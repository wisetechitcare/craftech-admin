import { IMAGE_STYLE_OPTIONS } from "@/lib/constants/common";

/** Project tiles: frame, corners, hover caption, and B&W. */
export const PORTFOLIO_IMAGE_STYLE_OPTIONS = IMAGE_STYLE_OPTIONS.filter(
  (opt) =>
    opt.key === "border" ||
    opt.key === "rounded" ||
    opt.key === "grayscale" ||
    opt.key === "hoverCaption",
);
