export const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as
  string | undefined;

/** Draggable pins need a Map ID. Google's demo ID works until the project
 *  sets its own in the Cloud console. */
export const GOOGLE_MAPS_MAP_ID =
  (import.meta.env.VITE_GOOGLE_MAPS_MAP_ID as string | undefined) ||
  "DEMO_MAP_ID";

/** The whole world: nothing about a new site says where it is. */
export const MAP_DEFAULT_VIEW = { center: { lat: 20, lng: 0 }, zoom: 2 };

/** Street level, close enough to put the pin on the right building. */
export const MAP_PINNED_ZOOM = 17;

export enum MapStatus {
  LOADING = "loading",
  READY = "ready",
  FAILED = "failed",
}
