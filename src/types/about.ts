// Mirrors the server's About contract (craftech-backend-ts/src/domain/about).
// The LIMITS are deliberately not duplicated here — they arrive with the About
// payload as `rules`, so the admin renders counters from the same numbers the
// server enforces and the two can never drift. Same arrangement as types/hero.

import type { FieldErrors } from './hero';

export type { FieldErrors };

export type AboutVariant = 'premium-glass' | 'clean-modern' | 'floating';

export interface AboutLink {
  label: string;
  url: string;
}

export interface AboutStat {
  value: string;
  label: string;
}

export interface AboutDetail {
  label: string;
  value: string;
}

export interface AboutItem {
  icon: string;
  title: string;
  description: string;
}

export interface AboutCapability extends AboutItem {
  tags: string[];
}

export interface AboutStep {
  number: string;
  title: string;
  description: string;
}

export interface AboutSection {
  label: string;
  heading: string;
}

export interface AboutContent {
  story: AboutSection & {
    description: string;
    image: string;
    caption: string;
  };
  stats: AboutStat[];
  whoWeAre: AboutSection & {
    description: string;
    attribution: string;
    details: AboutDetail[];
  };
  values: AboutSection & { items: AboutItem[] };
  whatWeDo: AboutSection & { items: AboutCapability[] };
  whyChooseUs: AboutSection & { items: AboutItem[] };
  howWeWork: AboutSection & { steps: AboutStep[] };
  cta: AboutSection & {
    description: string;
    primary: AboutLink;
    secondary: AboutLink | null;
  };
}

interface Limit {
  max: number;
}

export interface AboutRules {
  label: Limit;
  heading: Limit;
  storyDescription: Limit;
  caption: Limit;
  quote: Limit;
  attribution: Limit;
  detail: { label: Limit; value: Limit };
  stat: { value: Limit; label: Limit };
  item: { title: Limit; description: Limit; tag: Limit };
  step: { number: Limit; title: Limit; description: Limit };
  ctaLabel: Limit;
  ctaDescription: Limit;
  lists: Record<'stats' | 'details' | 'values' | 'whatWeDo' | 'whyChooseUs' | 'howWeWork' | 'tags', Limit>;
}

export interface AboutResponse extends AboutContent {
  variant: AboutVariant;
  rules: AboutRules;
}

export const ABOUT_VARIANT_LABELS: Record<AboutVariant, string> = {
  'premium-glass': 'Premium Glass',
  'clean-modern': 'Clean Modern',
  floating: 'Floating',
};

export const EMPTY_ITEM: AboutItem = { icon: '', title: '', description: '' };
export const EMPTY_CAPABILITY: AboutCapability = { ...EMPTY_ITEM, tags: [] };
export const EMPTY_STAT: AboutStat = { value: '', label: '' };
export const EMPTY_DETAIL: AboutDetail = { label: '', value: '' };
export const EMPTY_STEP: AboutStep = { number: '', title: '', description: '' };
