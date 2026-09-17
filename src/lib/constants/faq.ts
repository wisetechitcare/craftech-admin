/** What the live FAQ section shows while its copy is left empty — mirrors the
 *  website's own fallbacks, so the placeholders preview the real result. The
 *  email has no text default: an empty one uses Global Settings' email. */
export const FAQ_SECTION_DEFAULTS = {
  title: "Frequently asked questions",
  description:
    "We are here to help you with any questions you may have. If you don't find what you need, please contact us at",
  email: "Uses the email from Global Settings",
};

/** Mirrors FAQ_LIMITS in the backend's validation schemas — the server rejects
 *  anything outside these, the form just says so first. */
export const FAQ_LIMITS = {
  question: { min: 5, max: 200 },
  answer: { min: 10, max: 1500 },
} as const;
