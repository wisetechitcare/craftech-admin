import { IMAGE_STYLE_OPTIONS } from "@/lib/constants/common";
import type { ImageStyleOption } from "@/types/common";

/** One Image Style card for list tiles and detail photos. */
export const PORTFOLIO_IMAGE_STYLE_OPTIONS: ImageStyleOption[] = [
  ...IMAGE_STYLE_OPTIONS.filter((opt) => opt.key !== "masonry"),
  {
    key: "masonry",
    label: "Inline photo gallery",
    helper:
      "On: every photo below the project copy. Off: preview up top with Show all photos.",
  },
];
