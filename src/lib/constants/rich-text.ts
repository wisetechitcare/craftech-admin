import {
  FONT_SIZE_TOKENS,
  RICH_TEXT_FEATURES,
  type FontSizeToken,
  type RichTextFeature,
} from "@/types/rich-text";

/** Defaults for every rich-text field. A field that wants less passes
 *  `allowedFeatures`; nothing else holds a list of formatting options. */
export interface RichTextConfig {
  features: RichTextFeature[];
  placeholder: string;
  colorSwatches: string[];
  highlightSwatches: string[];
  fontPageSize: number;
}

export const DEFAULT_RICH_TEXT_CONFIG: RichTextConfig = {
  features: [...RICH_TEXT_FEATURES],
  placeholder: "Write here…",
  colorSwatches: [
    "#0f172a",
    "#475569",
    "#94a3b8",
    "#ffffff",
    "#b91c1c",
    "#ea580c",
    "#ca8a04",
    "#15803d",
    "#0e7490",
    "#1d4ed8",
    "#6d28d9",
    "#be185d",
  ],
  highlightSwatches: [
    "#fef08a",
    "#bbf7d0",
    "#bfdbfe",
    "#fbcfe8",
    "#e9d5ff",
    "#fed7aa",
    "#e2e8f0",
    "#111827",
  ],
  fontPageSize: 24,
};

/** Tokens are stored; the pixel size they resolve to is what is shown. */
const FONT_SIZE_LABELS: Record<FontSizeToken, string> = {
  "text-xs": "12",
  "text-sm": "14",
  "text-base": "16",
  "text-lg": "18",
  "text-xl": "20",
  "text-2xl": "24",
  "text-3xl": "30",
  "text-4xl": "36",
  "text-5xl": "48",
  "text-6xl": "60",
  "text-7xl": "72",
  "text-8xl": "96",
  "text-9xl": "128",
};

/** SelectField speaks in strings, so "inherit" is the empty one. */
export const RICH_TEXT_DEFAULT_VALUE = "";
/** Word's wording for a colour the theme decides. */
export const RICH_TEXT_AUTOMATIC_LABEL = "Automatic";

/** Suffix marking the value a field falls back to, as Word's "Calibri (Body)"
 *  marks the theme font. */
export const inheritedLabel = (value: string): string => `${value} (Auto)`;

export const fontSizeOptions = (inheritedSize: string) => [
  { value: RICH_TEXT_DEFAULT_VALUE, label: inheritedLabel(inheritedSize) },
  ...FONT_SIZE_TOKENS.map((token) => ({
    value: token,
    label: FONT_SIZE_LABELS[token],
  })),
];
