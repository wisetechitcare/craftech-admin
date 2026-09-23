import { emptyRichText } from "@/lib/editor";
import type { HeroSlide } from "@/types/hero";

export const EMPTY_SLIDE: HeroSlide = {
  images: [],
  pos: "center center",
  title: emptyRichText(),
  accent: emptyRichText(),
  subtitle: emptyRichText(),
};

export const POSITION_LABELS: Record<string, string> = {
  "left top": "Top left",
  "center top": "Top centre",
  "right top": "Top right",
  "left center": "Middle left",
  "center center": "Centre",
  "right center": "Middle right",
  "left bottom": "Bottom left",
  "center bottom": "Bottom centre",
  "right bottom": "Bottom right",
  "center 40%": "Centre, slightly high",
};
