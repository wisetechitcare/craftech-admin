import { LayoutVariant } from "@/types/common";

/** Display names only — the stored keys (premium-glass, …) never change. */
export const LAYOUT_VARIANT_LABELS: Record<LayoutVariant, string> = {
  [LayoutVariant.PREMIUM_GLASS]: "Variant 1",
  [LayoutVariant.CLEAN_MODERN]: "Variant 2",
  [LayoutVariant.FLOATING]: "Variant 3",
};

/** The site theme is these all holding one layout; every style save writes all of them. */
export const SECTION_VARIANT_FIELDS = [
  "navbarVariant",
  "heroVariant",
  "aboutVariant",
  "faqVariant",
  "contactVariant",
  "galleryVariant",
  "clientsVariant",
] as const;
