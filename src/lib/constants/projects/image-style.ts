import { IMAGE_STYLE_OPTIONS } from "@/lib/constants/common";

/** Project detail gallery: frame, corners, hover caption, and B&W. */
export const PROJECT_DETAIL_IMAGE_STYLE_OPTIONS = IMAGE_STYLE_OPTIONS.filter(
  (opt) => opt.key !== "masonry",
);
