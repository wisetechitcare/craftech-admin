// Mirrors the server's Appearance contract (craftech-backend-ts: the Appearance
// model, src/domain/navbar/rules.ts and src/domain/visibility/registry.ts).
// The LIMITS are deliberately not duplicated here — they arrive with the record
// as `navbarRules`, so the admin renders counters from the same numbers the
// server enforces and the two can never drift. Same arrangement as types/about.

import type {
  VisibilityMap,
  VisibilitySection,
} from "../components/admin/ui/VisibilityToggle";

import type { SECTION_VARIANT_FIELDS } from "@/lib/constants/appearance";
import type {
  NavigationDestinationOption,
  NavigationTarget,
} from "@/lib/constants/navigation";
import type {
  CustomCursorVariant,
  ImageStyleMap,
  LayoutVariant,
} from "./common";

export type { CustomCursorVariant, LayoutVariant };

export interface NavbarItem {
  destinationKey: string;
  label: string;
  visible: boolean;
}

export interface NavbarContent {
  links: NavbarItem[];
  cta: NavigationTarget;
}

interface Limit {
  max: number;
}

export interface NavbarRules {
  label: Limit;
  ctaLabel: Limit;
  links: Limit;
}

export interface VisibilityGroup {
  key: string;
  label: string;
  helper?: string;
  sections: VisibilitySection[];
}

/** The Appearance fields that each hold one section's layout. */
export type SectionVariantField = (typeof SECTION_VARIANT_FIELDS)[number];

export interface AppearanceResponse {
  _id: string;
  navbarVariant: LayoutVariant;
  heroVariant: LayoutVariant;
  aboutVariant: LayoutVariant;
  faqVariant: LayoutVariant;
  contactVariant: LayoutVariant;
  galleryVariant: LayoutVariant;
  clientsVariant: LayoutVariant;
  customCursorVariant: CustomCursorVariant;
  navbar: NavbarContent;
  navbarRules: NavbarRules;
  navigationDestinations: NavigationDestinationOption[];
  visibility: VisibilityMap | null;
  visibilityOptions: VisibilityGroup[];
  /** Always complete — the server repairs it and serves the default when
   *  nothing has been saved, so the Admin carries no copy of that default. */
  sectionOrder: string[];
  /** Which of those the live layout can be told to move. Read-only, like
   *  `visibilityOptions` — the write schema drops it. */
  sectionOrderOptions: string[];
  imageStyles: ImageStyleMap;
}

/** Every field is optional: a form sends the slice it owns and nothing else,
 *  so saving the layout switches can never rewrite another page's toggles. */
export interface AppearanceUpdatePayload {
  navbarVariant?: LayoutVariant;
  heroVariant?: LayoutVariant;
  aboutVariant?: LayoutVariant;
  faqVariant?: LayoutVariant;
  contactVariant?: LayoutVariant;
  galleryVariant?: LayoutVariant;
  clientsVariant?: LayoutVariant;
  customCursorVariant?: CustomCursorVariant;
  navbar?: NavbarContent;
  visibility?: VisibilityMap;
  sectionOrder?: string[];
  imageStyles?: ImageStyleMap;
}
