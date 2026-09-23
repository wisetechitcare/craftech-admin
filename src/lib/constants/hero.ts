/** Homepage visibility group on the Appearance record. */
export const HOME_VISIBILITY_GROUP = "home";

/** Client-side upload ceilings for Hero slide media (server enforces its own limits). */
export const HERO_SLIDE_MEDIA_MAX_SIZE_MB = {
  IMAGE: 10,
  VECTOR: 2,
  VIDEO: 200,
} as const;

/** Element keys the live Hero honours for per-part visibility. */
export enum HeroVisibilityKey {
  SECTION = "home.hero",
  TITLE = "home.hero.title",
  ACCENT = "home.hero.accent",
  SUBTITLE = "home.hero.subtitle",
  EYEBROW = "home.hero.eyebrow",
  PRIMARY_CTA = "home.hero.primaryCta",
  SECONDARY_CTA = "home.hero.secondaryCta",
  TRUST_STRIP = "home.hero.trustStrip",
}
