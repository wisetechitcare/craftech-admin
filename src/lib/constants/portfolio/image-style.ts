import { IMAGE_STYLE_OPTIONS } from "@/lib/constants/common";
import type { ImageStyleOption } from "@/types/common";

/** One Image Style card for list tiles and detail photos. */
export const PORTFOLIO_IMAGE_STYLE_OPTIONS: ImageStyleOption[] = [
  ...IMAGE_STYLE_OPTIONS.filter((opt) => opt.key !== "masonry"),
  {
    key: "detailPage",
    label: "Project detail page",
    helper:
      "On: compact cards that open each project's own page, for photo-led work like construction or interiors. Off: the whole project on its card, with summary, fields, tags and link buttons, and no detail pages. Suits developers and freelancers.",
  },
  {
    key: "masonry",
    label: "Inline photo gallery",
    helper:
      "Detail page only. On: every photo below the project copy. Off: a preview grid with Show all photos.",
  },
];
