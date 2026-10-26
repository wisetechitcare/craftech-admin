import { IMAGE_STYLE_OPTIONS } from "@/lib/constants/common";
import type { ImageStyleOption } from "@/types/common";

/** Project detail photos: tone and caption switches + which photo layout to use. */
export const PROJECT_DETAIL_IMAGE_STYLE_OPTIONS: ImageStyleOption[] = [
  ...IMAGE_STYLE_OPTIONS.filter((opt) => opt.key !== "masonry"),
  {
    key: "masonry",
    label: "Inline photo gallery",
    helper:
      "On: every photo on the page. Off: preview grid with a Show all photos overlay.",
  },
];
