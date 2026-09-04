// Mirrors the server's Hero contract (craftech-backend-ts/src/domain/hero).
// The LIMITS are deliberately not duplicated here — they arrive with the Hero
// payload as `rules`, so the admin renders counters from the same numbers the
// server enforces and the two can never drift.

export type HeroVariant = 'premium-glass' | 'clean-modern' | 'floating';

export interface HeroSlide {
  image: string;
  pos: string;
  title: string;
  subtitle: string;
}

export interface HeroCta {
  label: string;
  url: string;
}

export interface HeroContent {
  slides: HeroSlide[];
  eyebrow: string;
  primaryCta: HeroCta;
  secondaryCta: HeroCta;
  trustStrip: string;
}

export interface HeroRules {
  title: { max: number };
  subtitle: { max: number };
  eyebrow: { max: number };
  ctaLabel: { max: number };
  trustStrip: { max: number; segmentMax: number };
  slides: { min: number; max: number };
  positions: string[];
}

export interface HeroResponse extends HeroContent {
  variant: HeroVariant;
  rules: HeroRules;
}

/** Field-level messages from the API, keyed by zod path ("slides.0.title"). */
export type FieldErrors = Record<string, string>;

export const HERO_VARIANT_LABELS: Record<HeroVariant, string> = {
  'premium-glass': 'Premium Glass',
  'clean-modern': 'Clean Modern',
  floating: 'Floating',
};
