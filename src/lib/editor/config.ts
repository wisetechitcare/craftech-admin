import type { Extensions } from "@tiptap/core";
import { Placeholder } from "@tiptap/extensions";
import TextAlign from "@tiptap/extension-text-align";
import {
  BackgroundColor,
  Color,
  FontFamily,
  TextStyle,
} from "@tiptap/extension-text-style";
import StarterKit from "@tiptap/starter-kit";

import { tailwindTextStyleAttribute } from "./extensions";

import {
  FONT_SIZE_TOKENS,
  RICH_TEXT_FEATURES,
  TEXT_ALIGNMENTS,
  type RichTextFeature,
} from "@/types/rich-text";

export interface RichTextExtensionsOptions {
  features?: readonly RichTextFeature[];
  placeholder?: string;
}

/**
 * The single editor configuration — every rich-text field is built from it.
 *
 * The block extensions StarterKit ships with are switched off because the
 * stored document is doc → paragraph → text and the server rejects anything
 * else; leaving them on would let an admin write content that cannot be saved.
 */
export function createRichTextExtensions({
  features = RICH_TEXT_FEATURES,
  placeholder,
}: RichTextExtensionsOptions = {}): Extensions {
  const has = (feature: RichTextFeature) => features.includes(feature);

  const extensions: Extensions = [
    StarterKit.configure({
      blockquote: false,
      bulletList: false,
      code: false,
      codeBlock: false,
      heading: false,
      horizontalRule: false,
      link: false,
      listItem: false,
      listKeymap: false,
      orderedList: false,
      trailingNode: false,
      bold: has("bold") && {},
      italic: has("italic") && {},
      strike: has("strike") && {},
      underline: has("underline") && {},
    }),
  ];

  if (placeholder) extensions.push(Placeholder.configure({ placeholder }));

  // TextStyle is the span every attribute below hangs off.
  const styleFeatures: RichTextFeature[] = [
    "fontFamily",
    "fontSize",
    "textColor",
    "highlight",
  ];
  if (styleFeatures.some(has)) extensions.push(TextStyle);

  if (has("fontFamily")) extensions.push(FontFamily);
  if (has("textColor")) extensions.push(Color);
  if (has("highlight")) extensions.push(BackgroundColor);
  if (has("fontSize")) {
    extensions.push(
      tailwindTextStyleAttribute({
        name: "fontSize",
        tokens: FONT_SIZE_TOKENS,
      }),
    );
  }

  if (has("alignment")) {
    extensions.push(
      // defaultAlignment so the Left button reads as active out of the box,
      // rather than no alignment appearing chosen at all.
      TextAlign.configure({
        types: ["paragraph"],
        alignments: [...TEXT_ALIGNMENTS],
        defaultAlignment: "left",
      }),
    );
  }

  return extensions;
}
