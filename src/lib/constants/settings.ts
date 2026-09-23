import type { SiteSettings } from "@/types/settings";

/** The Global Settings tabs, in the order the page lists them. */
export enum SettingsTab {
  GENERAL = "general",
  CONTACT = "contact",
  SOCIAL = "social",
  SEO = "seo",
  ADVANCED = "advanced",
}

export const SETTINGS_TABS: { id: SettingsTab; label: string }[] = [
  { id: SettingsTab.GENERAL, label: "General" },
  { id: SettingsTab.CONTACT, label: "Contact & Location" },
  { id: SettingsTab.SOCIAL, label: "Social Links" },
  { id: SettingsTab.SEO, label: "SEO" },
  { id: SettingsTab.ADVANCED, label: "Advanced" },
];

/** Which fields each tab owns. The page sends only these, so a save here can
 *  never touch Site Identity's branding, which shares the settings row. */
export const SETTINGS_TAB_FIELDS: Record<SettingsTab, (keyof SiteSettings)[]> =
  {
    [SettingsTab.GENERAL]: ["companyName", "companyDescription"],
    [SettingsTab.CONTACT]: [
      "primaryPhone",
      "alternatePhone",
      "whatsappNumber",
      "businessEmail",
      "officeAddress",
      "city",
      "state",
      "postalCode",
      "country",
      "mapEmbedUrl",
      "businessHours",
    ],
    [SettingsTab.SOCIAL]: ["socialLinks"],
    [SettingsTab.SEO]: [
      "website",
      "seoDefaultTitle",
      "seoDefaultDescription",
      "seoOgImage",
      "searchIndexing",
      "googleAnalyticsId",
      "googleSearchConsoleId",
    ],
    [SettingsTab.ADVANCED]: ["maintenanceMode", "maintenanceMessage"],
  };

/** Mirrors BUSINESS_DAYS in the backend's validation schemas. */
export enum BusinessDay {
  MONDAY = "monday",
  TUESDAY = "tuesday",
  WEDNESDAY = "wednesday",
  THURSDAY = "thursday",
  FRIDAY = "friday",
  SATURDAY = "saturday",
  SUNDAY = "sunday",
}

export const BUSINESS_DAYS = Object.values(BusinessDay);

/** Pre-filled when a closed day is switched open, so the row is valid at once. */
export const DEFAULT_OPEN_HOURS = { open: "09:00", close: "17:00" };

export enum SocialPlatform {
  INSTAGRAM = "instagram",
  LINKEDIN = "linkedin",
  FACEBOOK = "facebook",
  TWITTER = "twitter",
  YOUTUBE = "youtube",
}

export const SOCIAL_PLATFORMS: { key: SocialPlatform; label: string }[] = [
  { key: SocialPlatform.INSTAGRAM, label: "Instagram" },
  { key: SocialPlatform.LINKEDIN, label: "LinkedIn" },
  { key: SocialPlatform.FACEBOOK, label: "Facebook" },
  { key: SocialPlatform.TWITTER, label: "X (Twitter)" },
  { key: SocialPlatform.YOUTUBE, label: "YouTube" },
];

/** Mirrors the backend's settingsSchema max lengths. */
export const SETTINGS_LIMITS = {
  companyName: 120,
  companyDescription: 500,
  seoDefaultTitle: 120,
  seoDefaultDescription: 300,
  maintenanceMessage: 300,
} as const;
