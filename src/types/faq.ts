/** The FAQ section's own copy, shared by every FAQ style. Empty strings mean
 *  "use the site's default", so an unsaved section renders as it does today. */
export interface FaqSectionContent {
  title: string;
  description: string;
  email: string;
}

export const EMPTY_FAQ_SECTION: FaqSectionContent = {
  title: "",
  description: "",
  email: "",
};

/** A question and its answer. The CMS stores nothing else about an FAQ — no
 *  category, no publish flag, no keywords; the array position is the order. */
export interface FaqItem {
  _id: string;
  question: string;
  answer: string;
}

export type FaqPayload = Pick<FaqItem, "question" | "answer">;

/** The cap travels with the list, so the Admin never holds its own copy of it. */
export interface FaqListResponse {
  success: boolean;
  message?: string;
  data: FaqItem[];
  limit: { max: number };
}
