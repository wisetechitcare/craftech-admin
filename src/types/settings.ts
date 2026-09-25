// Mirrors the server's Global Settings contract (craftech-backend-ts:
// validation/schemas.ts settingsSchema, services/cmsService.ts SETTINGS_SELECT).

import type { Dispatch, SetStateAction } from "react";

import type { VisibilityMap } from "@/components/admin/ui/VisibilityToggle";

import type { SocialPlatform } from "@/lib/constants/settings";

/** A profile URL per platform, in the order the website renders them. An entry
 *  with an empty url keeps its place in that order without being shown. */
export interface SocialLink {
  platform: SocialPlatform;
  url: string;
}

/** One office. The first filled, visible address is the head office: the only
 *  one the map shows and the one search engines are given. */
export interface AddressEntry {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export const EMPTY_ADDRESS: AddressEntry = {
  street: "",
  city: "",
  state: "",
  postalCode: "",
  country: "",
};

export interface SiteSettings {
  companyName: string;
  companyDescription?: string | null;
  /** Fixed numbered slots. A blank slot keeps its place, so "Phone No. 3" is
   *  always the third field. The first filled slot is the primary. */
  phones?: string[] | null;
  emails?: string[] | null;
  addresses?: AddressEntry[] | null;
  /** Which slot the WhatsApp buttons dial. Unset means the primary. */
  whatsappPhoneIndex?: number | null;
  /** Derived by the server from `phones`, never sent back. */
  whatsappNumber?: string | null;
  mapEmbedUrl?: string | null;
  socialLinks?: SocialLink[] | null;
  website?: string | null;
  seoDefaultTitle?: string | null;
  seoDefaultDescription?: string | null;
  seoOgImage?: string | null;
  searchIndexing: boolean;
  googleAnalyticsId?: string | null;
  googleSearchConsoleId?: string | null;
  maintenanceMode: boolean;
  maintenanceMessage?: string | null;
}

export interface SettingsTabProps {
  data: SiteSettings;
  /** Keyed by the field path the server reports, e.g. "addresses.0.city". */
  errors: Record<string, string>;
  patch: (changes: Partial<SiteSettings>) => void;
  /** Appearance owns what the website draws, so hiding a number never touches
   *  the number itself. Keys come from the backend's visibility registry. */
  visibility: VisibilityMap;
  patchVisibility: (key: string, visible: boolean) => void;
  /** For the edits that move several keys at once — removing a row shifts the
   *  flags of every row below it up with them. */
  setVisibility: Dispatch<SetStateAction<VisibilityMap>>;
}
