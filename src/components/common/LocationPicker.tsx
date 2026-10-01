import { useEffect, useRef, useState } from "react";
import { Loader2, LocateFixed } from "lucide-react";

import { Button } from "@/components/ui/button";

import {
  GOOGLE_MAPS_API_KEY,
  GOOGLE_MAPS_MAP_ID,
  MAP_DEFAULT_VIEW,
  MAP_PINNED_ZOOM,
  MapStatus,
} from "@/lib/constants/location";
import {
  loadGoogleMaps,
  placeToLocation,
  reverseGeocode,
  toCoordinates,
  toLatLngLiteral,
} from "@/lib/utils/common";
import type { Coordinates, LocationResult } from "@/types/location";
import { cn } from "@/utils/utils";

interface LocationPickerProps {
  /** The saved pin, or null for none. */
  value: Coordinates | null;
  /** Every new pin, with whatever address was found for it. */
  onChange: (location: LocationResult) => void;
}

/**
 * Search, click the map, drag the pin or use the browser's own position — each
 * ends in one `onChange` with the pin and the address found there. The picker
 * owns no address fields: the form that uses it decides where the address goes
 * and keeps it editable.
 */
const LocationPicker = ({ value, onChange }: LocationPickerProps) => {
  const mapNode = useRef<HTMLDivElement>(null);
  const searchNode = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(
    null,
  );
  const onChangeRef = useRef(onChange);
  const initialValue = useRef(value);
  // Only the newest lookup may report: a slow answer for an earlier click must
  // not overwrite the address of where the pin is now.
  const lookupRef = useRef<number>(0);
  const [status, setStatus] = useState<MapStatus>(MapStatus.LOADING);
  const [locating, setLocating] = useState<boolean>(false);
  const [detected, setDetected] = useState<string>("");
  const [notice, setNotice] = useState<string>("");
  const latitude = value?.latitude;
  const longitude = value?.longitude;

  useEffect(() => {
    onChangeRef.current = onChange;
  });

  const report = (lookup: number, location: LocationResult | null) => {
    if (lookup !== lookupRef.current) return;
    if (!location) {
      setNotice("That result has no spot on the map. Try another one.");
      return;
    }
    setDetected(location.formattedAddress);
    setNotice(
      location.address
        ? ""
        : "No address was found for this spot. Fill it in by hand.",
    );
    onChangeRef.current(location);
  };

  const showPin = (coordinates: Coordinates, zoomIn: boolean) => {
    const marker = markerRef.current;
    const map = mapRef.current;
    if (!marker || !map) return;
    marker.position = toLatLngLiteral(coordinates);
    marker.map = map;
    map.panTo(marker.position);
    if (zoomIn) map.setZoom(MAP_PINNED_ZOOM);
  };

  const dropPin = async (coordinates: Coordinates, zoomIn = false) => {
    const lookup = ++lookupRef.current;
    showPin(coordinates, zoomIn);
    report(lookup, await reverseGeocode(coordinates));
  };

  useEffect(() => {
    const apiKey = GOOGLE_MAPS_API_KEY;
    if (!apiKey) return;
    let cancelled = false;

    const init = async () => {
      try {
        await loadGoogleMaps(apiKey);
        const [
          { Map },
          { AdvancedMarkerElement },
          { PlaceAutocompleteElement },
        ] = await Promise.all([
          google.maps.importLibrary("maps"),
          google.maps.importLibrary("marker"),
          google.maps.importLibrary("places"),
        ]);
        if (cancelled || !mapNode.current || !searchNode.current) return;

        const start = initialValue.current;
        const map = new Map(mapNode.current, {
          mapId: GOOGLE_MAPS_MAP_ID,
          center: start ? toLatLngLiteral(start) : MAP_DEFAULT_VIEW.center,
          zoom: start ? MAP_PINNED_ZOOM : MAP_DEFAULT_VIEW.zoom,
          mapTypeControl: true,
          streetViewControl: false,
          fullscreenControl: false,
          clickableIcons: false,
        });
        const marker = new AdvancedMarkerElement({
          gmpDraggable: true,
          title: "Drag to fine-tune",
        });
        mapRef.current = map;
        markerRef.current = marker;

        map.addListener("click", (event: google.maps.MapMouseEvent) => {
          if (event.latLng) void dropPin(toCoordinates(event.latLng));
        });
        marker.addListener("dragend", (event: google.maps.MapMouseEvent) => {
          if (event.latLng) void dropPin(toCoordinates(event.latLng));
        });

        const search = new PlaceAutocompleteElement({});
        search.placeholder = "Search business, address, area or PIN…";
        search.addEventListener("gmp-select", ({ placePrediction }) => {
          const lookup = ++lookupRef.current;
          void placeToLocation(placePrediction)
            .catch(() => null)
            .then((location) => {
              if (location && lookup === lookupRef.current) {
                showPin(location.coordinates, true);
              }
              report(lookup, location);
            });
        });
        searchNode.current.replaceChildren(search);

        setStatus(MapStatus.READY);
      } catch {
        if (!cancelled) setStatus(MapStatus.FAILED);
      }
    };

    void init();
    return () => {
      cancelled = true;
    };
  }, []);

  // Follows the saved value too, so discarding changes puts the pin back. Keyed
  // on the numbers, not the object: callers rebuild it every render, and a
  // re-run mid-lookup would snap the pin back to where it was.
  useEffect(() => {
    const marker = markerRef.current;
    if (!marker) return;
    const pinned = latitude != null && longitude != null;
    marker.position = pinned ? { lat: latitude, lng: longitude } : null;
    marker.map = pinned ? mapRef.current : null;
  }, [latitude, longitude, status]);

  const locateMe = () => {
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setLocating(false);
        void dropPin(
          { latitude: coords.latitude, longitude: coords.longitude },
          true,
        );
      },
      () => {
        setLocating(false);
        setNotice(
          "Your browser did not share your location. Search or click the map instead.",
        );
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  if (!GOOGLE_MAPS_API_KEY) {
    return (
      <p className="text-sm text-ink-mute">
        The map is not switched on for this site yet. Ask your developer to turn
        it on; the address fields still work without it.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span
          className={cn(
            "rounded-full px-2.5 py-1 text-xs font-semibold",
            value ? "bg-ok/10 text-ok" : "bg-raise text-ink-mute",
          )}
        >
          {value ? "Location set" : "Location not set"}
        </span>
        <Button
          variant="outline"
          size="xs"
          onClick={locateMe}
          disabled={status !== MapStatus.READY || locating}
          startIcon={
            locating ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <LocateFixed className="size-4" />
            )
          }
        >
          Use my current location
        </Button>
      </div>

      <div ref={searchNode} className="scheme-light dark:scheme-dark" />

      <div className="relative">
        <div
          ref={mapNode}
          className="h-80 w-full overflow-hidden rounded-xl border border-line bg-raise"
        />
        {status !== MapStatus.READY && (
          <div className="absolute inset-0 flex items-center justify-center p-6 text-center text-sm text-ink-mute">
            {status === MapStatus.LOADING ? (
              <Loader2 className="size-6 animate-spin text-ink-faint" />
            ) : (
              "The map could not load. Check your connection and reload the page."
            )}
          </div>
        )}
      </div>
      <p className="text-xs text-ink-faint">
        Click the map to drop the pin, then drag it to fine-tune.
      </p>

      {notice && <p className="text-xs text-warn">{notice}</p>}
      {detected && (
        <div>
          <p className="text-xs font-semibold text-ink-mute">
            Detected address
          </p>
          <p className="text-sm text-ink">{detected}</p>
        </div>
      )}
      {value && (
        <p className="text-xs text-ink-faint">
          {value.latitude.toFixed(6)}, {value.longitude.toFixed(6)}
        </p>
      )}
    </div>
  );
};

export default LocationPicker;
