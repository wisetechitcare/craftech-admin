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
      "phones",
      "emails",
      "addresses",
      "whatsappPhoneIndex",
      "mapEmbedUrl",
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

/** Mirrors SOCIAL_PLATFORMS in the backend's domain/contact/channels.ts. */
export enum SocialPlatform {
  INSTAGRAM = "instagram",
  LINKEDIN = "linkedin",
  FACEBOOK = "facebook",
  TWITTER = "twitter",
  YOUTUBE = "youtube",
  GITHUB = "github",
}

export const SOCIAL_PLATFORM_LABELS: Record<SocialPlatform, string> = {
  [SocialPlatform.INSTAGRAM]: "Instagram",
  [SocialPlatform.LINKEDIN]: "LinkedIn",
  [SocialPlatform.FACEBOOK]: "Facebook",
  [SocialPlatform.TWITTER]: "X (Twitter)",
  [SocialPlatform.YOUTUBE]: "YouTube",
  [SocialPlatform.GITHUB]: "GitHub",
};

/** How many phone numbers, emails and addresses Global Settings accepts.
 *  Mirrors CONTACT_SLOTS in the backend's domain/contact/channels.ts — one past
 *  this point would fail validation, so the Add button stops here. */
export const CONTACT_SLOTS = 4;

/** Mirrors the `contactDetails` group in the backend's visibility registry. */
export enum ContactVisibilitySection {
  CONTACT_INFO = "contactDetails.contactInfo",
  ADDRESSES = "contactDetails.addresses",
  SOCIAL = "contactDetails.social",
}

/** Takes the row's array index; the key itself counts from 1, the way the
 *  field labels do. Kept identical to the frontend's helper of the same name. */
export const contactSlotVisibilityKey = (
  channel: "phone" | "email" | "address",
  index: number,
) => `contactDetails.${channel}.${index + 1}`;

export const socialVisibilityKey = (platform: SocialPlatform) =>
  `contactDetails.social.${platform}`;

/** Mirrors the backend's settingsSchema max lengths. */
export const SETTINGS_LIMITS = {
  companyName: 120,
  companyDescription: 500,
  seoDefaultTitle: 120,
  seoDefaultDescription: 300,
  maintenanceMessage: 300,
} as const;
