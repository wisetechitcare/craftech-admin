// Mirrors the server's Appearance contract (craftech-backend-ts: the Appearance
// model, src/domain/navbar/rules.ts and src/domain/visibility/registry.ts).
// The LIMITS are deliberately not duplicated here — they arrive with the record
// as `navbarRules`, so the admin renders counters from the same numbers the
// server enforces and the two can never drift. Same arrangement as types/about.

import type {
  VisibilityMap,
  VisibilitySection,
} from "../components/admin/ui/VisibilityToggle";

import type { CustomCursorVariant, LayoutVariant } from "./common";

export type { CustomCursorVariant, LayoutVariant };

export interface NavbarLink {
  label: string;
  href: string;
}

export interface NavbarContent {
  links: NavbarLink[];
  cta: NavbarLink;
}

interface Limit {
  max: number;
}

export interface NavbarRules {
  label: Limit;
  href: Limit;
  ctaLabel: Limit;
  links: Limit;
}

export interface VisibilityGroup {
  key: string;
  label: string;
  helper?: string;
  sections: VisibilitySection[];
}

export interface AppearanceResponse {
  _id: string;
  navbarVariant: LayoutVariant;
  heroVariant: LayoutVariant;
  aboutVariant: LayoutVariant;
  customCursorVariant: CustomCursorVariant;
  navbar: NavbarContent;
  navbarRules: NavbarRules;
  visibility: VisibilityMap | null;
  visibilityOptions: VisibilityGroup[];
  /** Always complete — the server repairs it and serves the default when
   *  nothing has been saved, so the Admin carries no copy of that default. */
  sectionOrder: string[];
  /** Which of those the live layout can be told to move. Read-only, like
   *  `visibilityOptions` — the write schema drops it. */
  sectionOrderOptions: string[];
}

/** Every field is optional: a form sends the slice it owns and nothing else,
 *  so saving the layout switches can never rewrite another page's toggles. */
export interface AppearanceUpdatePayload {
  navbarVariant?: LayoutVariant;
  heroVariant?: LayoutVariant;
  aboutVariant?: LayoutVariant;
  customCursorVariant?: CustomCursorVariant;
  navbar?: NavbarContent;
  visibility?: VisibilityMap;
  sectionOrder?: string[];
}

export const EMPTY_NAV_LINK: NavbarLink = { label: "", href: "" };
