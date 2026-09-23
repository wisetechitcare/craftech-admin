import { trustStripSegments } from "./trust-strip";

import { richTextToPlain } from "@/lib/editor";
import {
  isHeroVideo,
  type FieldErrors,
  type HeroContent,
  type HeroRules,
} from "@/types/hero";

/** Mirrors the server's length rules so Save can be blocked before a round trip.
 *  Keys are the zod paths the API returns, so both sources render identically.
 *  Rich-text fields are measured as PLAIN text, exactly as the server does. */
export function heroClientErrors(
  content: HeroContent,
  rules: HeroRules,
): FieldErrors {
  const errors: FieldErrors = {};
  const cap = (key: string, value: string, max: number, name: string) => {
    if (value.length > max)
      errors[key] =
        `${name} must be ${max} characters or fewer for this Hero style.`;
  };

  content.slides.forEach((slide, i) => {
    const title = richTextToPlain(slide.title);
    const accent = richTextToPlain(slide.accent);

    if (!title.trim()) errors[`slides.${i}.title`] = "Title is required.";
    if (!slide.images.length)
      errors[`slides.${i}.images`] = "An image or video is required.";
    if (slide.images.some(isHeroVideo) && slide.images.length > 1) {
      errors[`slides.${i}.images`] =
        "A video fills the slide on its own. Keep the video and remove the images, or remove the video to use images.";
    }
    if (content.slides.length > 1 && slide.images.length > 1) {
      errors[`slides.${i}.images`] =
        "With more than one slide, each slide takes a single image or video. Remove the extras here, or delete the other slides.";
    }
    cap(
      `slides.${i}.title`,
      title + accent,
      rules.title.max,
      "Title and accent text together",
    );
    cap(
      `slides.${i}.subtitle`,
      richTextToPlain(slide.subtitle),
      rules.subtitle.max,
      "Subtitle",
    );
  });
  if (!content.slides.length) errors.slides = "At least one slide is required.";

  const eyebrow = richTextToPlain(content.eyebrow);
  if (!eyebrow.trim()) errors.eyebrow = "Eyebrow is required.";
  cap("eyebrow", eyebrow, rules.eyebrow.max, "Eyebrow");
  cap(
    "primaryCta.label",
    content.primaryCta.label,
    rules.ctaLabel.max,
    "Label",
  );
  cap(
    "secondaryCta.label",
    content.secondaryCta.label,
    rules.ctaLabel.max,
    "Label",
  );
  if (!content.trustStrip.trim()) {
    errors.trustStrip = "Add at least one claim.";
  }
  cap("trustStrip", content.trustStrip, rules.trustStrip.max, "Trust strip");

  const segments = trustStripSegments(content.trustStrip);
  if (segments.length > rules.trustStrip.itemsMax) {
    errors.trustStrip = `At most ${rules.trustStrip.itemsMax} claims are allowed.`;
  }

  const longChip = segments.find(
    (segment) => segment.length > rules.trustStrip.segmentMax,
  );
  if (longChip) {
    errors.trustStrip = `"${longChip.slice(0, 24)}…" is longer than ${rules.trustStrip.segmentMax} characters and will overflow its chip.`;
  }
  return errors;
}
