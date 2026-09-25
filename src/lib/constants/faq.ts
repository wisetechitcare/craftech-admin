import type { SectionCopyField } from "@/types/common";
import type { FaqSectionContent } from "@/types/faq";

/** What the live FAQ section shows while its copy is left empty — mirrors the
 *  website's own fallbacks, so the placeholders preview the real result. The
 *  email has no text default: an empty one uses Global Settings' email. */
export const FAQ_SECTION_DEFAULTS = {
  title: "Frequently asked questions",
  description:
    "We are here to help you with any questions you may have. If you don't find what you need, please contact us at",
  email: "Uses the email from Global Settings",
};

/** The FAQ section's copy fields, as the section content card draws them. */
export const FAQ_SECTION_FIELDS: SectionCopyField<FaqSectionContent>[] = [
  { key: "title", label: "Title", placeholder: FAQ_SECTION_DEFAULTS.title },
  {
    key: "description",
    label: "Supporting text",
    placeholder: FAQ_SECTION_DEFAULTS.description,
    multiline: true,
    tooltip: "The contact email is added at the end of this text as a link.",
  },
  {
    key: "email",
    label: "Contact email",
    placeholder: FAQ_SECTION_DEFAULTS.email,
    type: "email",
    narrow: true,
  },
];

/** Mirrors FAQ_LIMITS in the backend's validation schemas — the server rejects
 *  anything outside these, the form just says so first. */
export const FAQ_LIMITS = {
  question: { min: 5, max: 200 },
  answer: { min: 10, max: 1500 },
} as const;

/** The appearance flag for the whole FAQ section — the page header owns the
 *  switch, the card and the preview read the same key. */
export const FAQ_VISIBILITY_KEY = "home.faq";
