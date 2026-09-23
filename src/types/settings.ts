// Mirrors the server's Global Settings contract (craftech-backend-ts:
// validation/schemas.ts settingsSchema, services/cmsService.ts SETTINGS_SELECT).

import type { BusinessDay, SocialPlatform } from "@/lib/constants/settings";

export interface DayHours {
  open?: string;
  close?: string;
  isOpen: boolean;
}

export type BusinessHours = Partial<Record<BusinessDay, DayHours>>;

export type SocialLinks = Partial<Record<SocialPlatform, string>>;

export interface SiteSettings {
  companyName: string;
  companyDescription?: string | null;
  primaryPhone?: string | null;
  alternatePhone?: string | null;
  whatsappNumber?: string | null;
  businessEmail?: string | null;
  officeAddress?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  country?: string | null;
  mapEmbedUrl?: string | null;
  businessHours?: BusinessHours | null;
  socialLinks?: SocialLinks | null;
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
  /** Keyed by the field path the server reports, e.g. "businessHours.monday". */
  errors: Record<string, string>;
  patch: (changes: Partial<SiteSettings>) => void;
}
