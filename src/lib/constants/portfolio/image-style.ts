import { IMAGE_STYLE_OPTIONS } from "@/lib/constants/common";
import type { ImageStyleOption } from "@/types/common";

/** One Image Style card for list tiles and detail photos. */
export const PORTFOLIO_IMAGE_STYLE_OPTIONS: ImageStyleOption[] = [
  ...IMAGE_STYLE_OPTIONS.filter((opt) => opt.key !== "masonry"),
  {
    key: "detailPage",
    label: "Project detail pages",
    helper:
      "On: each project opens its own detail page, and links like Live Demo stay separate buttons. Off: no detail pages; a project opens its first link, or nothing if it has none.",
  },
  {
    key: "masonry",
    label: "Inline photo gallery",
    helper:
      "Detail page only. On: every photo below the project copy. Off: a preview grid with Show all photos.",
  },
];
