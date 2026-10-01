export interface Coordinates {
  latitude: number;
  longitude: number;
}

/** A postal address as the forms edit it — the parts, never one blob of text. */
export interface PostalAddress {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

/** What LocationPicker reports for every pin it drops. `address` is null when
 *  no address could be found for the spot; `placeId` is set only when the pin
 *  is exactly a place picked from search, so dragging it away clears it. */
export interface LocationResult {
  coordinates: Coordinates;
  placeId: string;
  formattedAddress: string;
  address: PostalAddress | null;
}
