// Mirrors the server's Hero contract (craftech-backend-ts/src/domain/hero).
// The LIMITS are deliberately not duplicated here — they arrive with the Hero
// payload as `rules`, so the admin renders counters from the same numbers the
// server enforces and the two can never drift.

export type HeroVariant = 'premium-glass' | 'clean-modern' | 'floating';

/** True when a slide's media is a video rather than a still. Mirrors
 *  isHeroVideo in the website bundle — the two apps ship separately and share
 *  no package, so the rule is stated in each rather than imported across. */
export const isHeroVideo = (url?: string): boolean =>
  /\.(mp4|webm|mov|m4v|ogv)(\?|#|$)/i.test(url ?? '');

export interface HeroSlide {
  /** The slide's backdrop media, in display order — images, or one video. More
   *  than one is only accepted when this is the ONLY slide: the live Hero
   *  rotates them behind a headline that never changes. With several slides
   *  each takes exactly one, because its copy changes along with it. */
  images: string[];
  pos: string;
  title: string;
  subtitle: string;
}

/** One frame of the live Hero: a single medium and the copy shown over it. The
 *  site flattens slides into these to cycle through; heroFrames does the same
 *  so the preview steps through exactly what a visitor sees. */
export interface HeroFrame {
  image: string;
  pos: string;
  title: string;
  subtitle: string;
}

export const heroFrames = (slides: HeroSlide[]): HeroFrame[] =>
  slides.flatMap(({ images, ...copy }) => images.map((image) => ({ ...copy, image })));

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
  /** `imagesMax` is how many images a single-slide Hero may cross-fade through.
   *  A video has no count: it always stands alone on its slide. */
  slides: { min: number; max: number; imagesMax: number };
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
