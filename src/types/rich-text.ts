// Mirrors craftech-backend-ts/src/domain/rich-text. The three apps ship
// separately and share no package, so the model is stated in each rather than
// imported across — the arrangement isHeroVideo already uses.
//
// Font size is stored as a Tailwind token, never px. Colour and font family are
// stored as literal values and applied inline, because neither can be a class.
// The token literals below are what put those classes in the CSS: Tailwind
// scans this file for them.

export const RICH_TEXT_FEATURES = [
  "fontFamily",
  "fontSize",
  "bold",
  "italic",
  "underline",
  "strike",
  "textColor",
  "highlight",
  "alignment",
] as const;
export type RichTextFeature = (typeof RICH_TEXT_FEATURES)[number];

export const FONT_SIZE_TOKENS = [
  "text-xs",
  "text-sm",
  "text-base",
  "text-lg",
  "text-xl",
  "text-2xl",
  "text-3xl",
  "text-4xl",
  "text-5xl",
  "text-6xl",
  "text-7xl",
  "text-8xl",
  "text-9xl",
] as const;
export type FontSizeToken = (typeof FONT_SIZE_TOKENS)[number];

export const TEXT_ALIGNMENTS = ["left", "center", "right", "justify"] as const;
export type TextAlignment = (typeof TEXT_ALIGNMENTS)[number];

export type RichTextMarkType =
  "bold" | "italic" | "underline" | "strike" | "textStyle";

/** Absent means the range inherits the section's own styling. */
export interface RichTextStyleAttributes {
  fontFamily?: string | null;
  fontSize?: FontSizeToken | null;
  color?: string | null;
  backgroundColor?: string | null;
}

export interface RichTextMark {
  type: RichTextMarkType;
  attrs?: RichTextStyleAttributes;
}

export interface RichTextNode {
  type: "doc" | "paragraph" | "text" | "hardBreak";
  text?: string;
  marks?: RichTextMark[];
  attrs?: { textAlign?: TextAlignment | null };
  content?: RichTextNode[];
}

export interface RichTextDocument {
  type: "doc";
  content: RichTextNode[];
}

/** A field that may not have been saved since it became rich text. */
export type RichTextValue = RichTextDocument | string | null | undefined;

/** The typography a field inherits when the admin overrides nothing. The
 *  toolbar names these instead of saying "Default", the way Word shows
 *  "Calibri (Body)". */
export interface RichTextDefaults {
  fontFamily: string;
  /** Desktop pixel size, as a display string. */
  fontSize: string;
}

/** One family and the variants a document uses, so only those are fetched. */
export interface FontUsage {
  family: string;
  weights: number[];
  italic: boolean;
}

// ── Font catalogue (GET /cms/fonts) ─────────────────────────────────────────

export const FONT_CATEGORIES = [
  "sans-serif",
  "serif",
  "display",
  "handwriting",
  "monospace",
] as const;
export type FontCategory = (typeof FONT_CATEGORIES)[number];

export const FONT_SORTS = ["popularity", "alpha"] as const;
export type FontSort = (typeof FONT_SORTS)[number];

export interface CraftechFont {
  family: string;
  category: FontCategory;
  weights: number[];
  hasItalic: boolean;
}

export interface FontQuery {
  search?: string;
  category?: FontCategory;
  sort?: FontSort;
  page?: number;
  limit?: number;
}

export interface FontPage {
  fonts: CraftechFont[];
  total: number;
  page: number;
  limit: number;
  categories: FontCategory[];
}
