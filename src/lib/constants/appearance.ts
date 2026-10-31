import { LayoutVariant } from "@/types/common";
import type { FrameStyle, FrameStyleOption } from "@/types/appearance";

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
  "portfolioVariant",
] as const;

/** Site-wide like the theme: one save changes every page and section. */
export const FRAME_STYLE_OPTIONS: FrameStyleOption[] = [
  {
    key: "borders",
    label: "Border",
    helper:
      "The frame around cards, images and panels across the whole website.",
  },
  {
    key: "roundedCorners",
    label: "Rounded corners",
    helper:
      "Off gives buttons, cards, images and panels square corners across the whole website.",
  },
];

/** Every variant as designed: a variant change puts both switches back on. */
export const FRAME_STYLE_DEFAULTS: FrameStyle = {
  borders: true,
  roundedCorners: true,
};
