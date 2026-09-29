import type {
  Coordinates,
  LocationResult,
  PostalAddress,
} from "@/types/location";

/** The common ground of a Places `AddressComponent` and a Geocoder
 *  `GeocoderAddressComponent`, so one normaliser reads both. */
interface AddressPart {
  longText: string | null;
  types: string[];
}

declare global {
  interface Window {
    onGoogleMapsReady?: () => void;
  }
}

let mapsReady: Promise<void> | undefined;

/** Adds the Maps JavaScript API once per page; every picker awaits the same
 *  load. A failed load is forgotten so the next mount can retry. Resolves on
 *  Google's callback, not the script's onload: with loading=async the script
 *  is only a bootstrap, and importLibrary exists once the callback fires. */
export const loadGoogleMaps = (apiKey: string) => {
  mapsReady ??= new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?${new URLSearchParams(
      {
        key: apiKey,
        v: "weekly",
        loading: "async",
        callback: "onGoogleMapsReady",
      },
    )}`;
    script.async = true;
    window.onGoogleMapsReady = () => resolve();
    script.onerror = () => {
      mapsReady = undefined;
      script.remove();
      reject(new Error("Google Maps failed to load"));
    };
    document.head.append(script);
  });
  return mapsReady;
};

export const toLatLngLiteral = ({
  latitude,
  longitude,
}: Coordinates): google.maps.LatLngLiteral => ({
  lat: latitude,
  lng: longitude,
});

export const toCoordinates = (latLng: google.maps.LatLng): Coordinates => ({
  latitude: latLng.lat(),
  longitude: latLng.lng(),
});

const CITY_TYPES = [
  "locality",
  "postal_town",
  "administrative_area_level_3",
  "administrative_area_level_2",
];

const partOf = (parts: AddressPart[], type: string) =>
  parts.find((part) => part.types.includes(type))?.longText?.trim() ?? "";

export const normalizeAddress = (
  parts: AddressPart[],
  formattedAddress = "",
): PostalAddress => {
  const city = CITY_TYPES.map((type) => partOf(parts, type)).find(Boolean);
  const road = [partOf(parts, "street_number"), partOf(parts, "route")]
    .filter(Boolean)
    .join(" ");
  // Most specific first. India fills the sublocality levels (sector, area)
  // where the US fills number and route, so the street line takes all of them.
  const street = [
    partOf(parts, "subpremise"),
    partOf(parts, "premise"),
    road,
    partOf(parts, "neighborhood"),
    partOf(parts, "sublocality_level_3"),
    partOf(parts, "sublocality_level_2"),
    partOf(parts, "sublocality_level_1"),
  ]
    .filter(
      (line, index, lines) =>
        line && line !== city && lines.indexOf(line) === index,
    )
    .join(", ");
  const firstLine = formattedAddress.split(",")[0]?.trim() ?? "";

  return {
    street: street || (firstLine !== city ? firstLine : ""),
    city: city ?? "",
    state: partOf(parts, "administrative_area_level_1"),
    postalCode: partOf(parts, "postal_code"),
    country: partOf(parts, "country"),
  };
};

/** The address at a pin. A spot with no address still keeps its pin: the
 *  admin fills the fields in by hand. */
export const reverseGeocode = async (
  coordinates: Coordinates,
): Promise<LocationResult> => {
  const { Geocoder } = await google.maps.importLibrary("geocoding");
  try {
    const { results } = await new Geocoder().geocode({
      location: toLatLngLiteral(coordinates),
    });
    // A bare plus code ("7JFJ+X2") is Google's answer for open ground; the
    // next result is the nearest real address.
    const best =
      results.find((result) => !result.types.includes("plus_code")) ??
      results[0];
    if (best) {
      return {
        coordinates,
        placeId: "",
        formattedAddress: best.formatted_address,
        address: normalizeAddress(
          best.address_components.map((part) => ({
            longText: part.long_name,
            types: part.types,
          })),
          best.formatted_address,
        ),
      };
    }
  } catch {
    // ZERO_RESULTS rejects too; either way there is no address to offer.
  }
  return { coordinates, placeId: "", formattedAddress: "", address: null };
};

export const placeToLocation = async (
  prediction: google.maps.places.PlacePrediction,
): Promise<LocationResult | null> => {
  const place = prediction.toPlace();
  await place.fetchFields({
    fields: ["location", "formattedAddress", "addressComponents"],
  });
  if (!place.location) return null;
  const formattedAddress = place.formattedAddress ?? "";
  return {
    coordinates: toCoordinates(place.location),
    placeId: place.id,
    formattedAddress,
    address: normalizeAddress(place.addressComponents ?? [], formattedAddress),
  };
};
