// Mirrors the server's Hero contract (craftech-backend-ts/src/domain/hero).
// The LIMITS are deliberately not duplicated here — they arrive with the Hero
// payload as `rules`, so the admin renders counters from the same numbers the
// server enforces and the two can never drift.

import type { NavigationDestinationOption } from "@/lib/constants/navigation";
import { LayoutVariant } from "./common";
import type { RichTextDocument, RichTextFeature } from "./rich-text";

export type HeroVariant = LayoutVariant;

/** True when a slide's media is a video rather than a still. Mirrors
 *  isHeroVideo in the website bundle — the two apps ship separately and share
 *  no package, so the rule is stated in each rather than imported across. */
export const isHeroVideo = (url?: string): boolean =>
  /\.(mp4|webm|mov|m4v|ogv)(\?|#|$)/i.test(url ?? "");

export interface HeroSlide {
  /** The slide's backdrop media, in display order — images, or one video. More
   *  than one is only accepted when this is the ONLY slide: the live Hero
   *  rotates them behind a headline that never changes. With several slides
   *  each takes exactly one, because its copy changes along with it. */
  images: string[];
  pos: string;
  /** Rich text. Character budgets count plain text, so formatting never costs
   *  an admin room in the layout. */
  title: RichTextDocument;
  /** The end of the headline, drawn in the accent colour unless overridden.
   *  Shares the title's budget — both are one headline. */
  accent: RichTextDocument;
  subtitle: RichTextDocument;
}

export interface HeroCta {
  label: string;
  destinationKey: string;
  externalUrl?: string | null;
}

export interface HeroContent {
  slides: HeroSlide[];
  eyebrow: RichTextDocument;
  primaryCta: HeroCta;
  secondaryCta: HeroCta;
  trustStrip: string;
}

/** A text field's budget plus the typography it inherits, which the editor
 *  names instead of saying "Default". */
export interface HeroTextRule {
  max: number;
  font: string;
  size: string;
}

export interface HeroRules {
  title: HeroTextRule;
  subtitle: HeroTextRule;
  eyebrow: HeroTextRule;
  ctaLabel: { max: number };
  trustStrip: { max: number; segmentMax: number; itemsMax: number };
  /** `imagesMax` is how many images a single-slide Hero may cross-fade through.
   *  A video has no count: it always stands alone on its slide. */
  slides: { min: number; max: number; imagesMax: number };
  positions: string[];
  /** Which formatting the text editors offer. Served rather than hardcoded so
   *  a toolbar can never show a control the server would reject. */
  textFeatures: RichTextFeature[];
}

export interface HeroResponse extends HeroContent {
  variant: HeroVariant;
  rules: HeroRules;
  navigationDestinations: NavigationDestinationOption[];
}

/** Field-level messages from the API, keyed by zod path ("slides.0.title"). */
export type FieldErrors = Record<string, string>;

export const HERO_VARIANT_LABELS: Record<HeroVariant, string> = {
  [LayoutVariant.PREMIUM_GLASS]: "Premium Glass",
  [LayoutVariant.CLEAN_MODERN]: "Clean Modern",
  [LayoutVariant.FLOATING]: "Floating",
};
