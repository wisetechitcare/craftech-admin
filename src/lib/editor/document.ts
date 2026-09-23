import type {
  FontUsage,
  RichTextDocument,
  RichTextNode,
} from "@/types/rich-text";

export const emptyRichText = (): RichTextDocument => ({
  type: "doc",
  content: [{ type: "paragraph" }],
});

const richTextFromPlain = (text: string): RichTextDocument => ({
  type: "doc",
  content: text.split(/\r?\n/).map((line) => ({
    type: "paragraph" as const,
    ...(line ? { content: [{ type: "text" as const, text: line }] } : {}),
  })),
});

const isDocument = (raw: unknown): raw is RichTextDocument =>
  typeof raw === "object" &&
  raw !== null &&
  (raw as RichTextNode).type === "doc" &&
  Array.isArray((raw as RichTextNode).content);

/** A field that has not been saved since it became rich text still holds the
 *  plain string it always held. */
export function toRichText(raw: unknown): RichTextDocument {
  if (isDocument(raw)) return raw;
  if (typeof raw === "string" && raw.length > 0) {
    // A field whose column is text, not json, holds the document serialised.
    if (raw.startsWith("{")) {
      try {
        const parsed: unknown = JSON.parse(raw);
        if (isDocument(parsed)) return parsed;
      } catch {
        // Not a document, so it is copy that happens to start with a brace.
      }
    }
    return richTextFromPlain(raw);
  }
  return emptyRichText();
}

/** What character counters count and the server's length limits measure. */
export function richTextToPlain(raw: unknown): string {
  const walk = (node: RichTextNode): string => {
    if (node.type === "text") return node.text ?? "";
    if (node.type === "hardBreak") return "\n";
    const inner = (node.content ?? []).map(walk).join("");
    return node.type === "paragraph" ? `${inner}\n` : inner;
  };
  return walk(toRichText(raw)).replace(/\n+$/, "");
}

const eachTextNode = (
  node: RichTextNode,
  visit: (node: RichTextNode) => void,
): void => {
  if (node.type === "text") visit(node);
  (node.content ?? []).forEach((child) => eachTextNode(child, visit));
};

/** Only the families and variants the copy actually uses are ever loaded. */
export function collectFontUsage(raw: unknown): FontUsage[] {
  const usage = new Map<string, { weights: Set<number>; italic: boolean }>();

  eachTextNode(toRichText(raw), (node) => {
    const marks = node.marks ?? [];
    const family = marks.find((mark) => mark.type === "textStyle")?.attrs
      ?.fontFamily;
    if (!family) return;

    const entry = usage.get(family) ?? {
      weights: new Set<number>(),
      italic: false,
    };
    entry.weights.add(marks.some((mark) => mark.type === "bold") ? 700 : 400);
    if (marks.some((mark) => mark.type === "italic")) entry.italic = true;
    usage.set(family, entry);
  });

  return [...usage].map(([family, { weights, italic }]) => ({
    family,
    weights: [...weights].sort((a, b) => a - b),
    italic,
  }));
}

/**
 * One stylesheet URL per family. Combined URLs are avoided because css2
 * rejects the whole request when any family is asked for a weight it does not
 * ship, taking every other font down with it.
 */
export function googleFontsHrefs(usage: FontUsage[]): string[] {
  return usage.map(({ family, weights, italic }) => {
    const name = family.trim().replace(/\s+/g, "+");
    const axis = italic
      ? `ital,wght@${[
          ...weights.map((weight) => `0,${weight}`),
          ...weights.map((weight) => `1,${weight}`),
        ].join(";")}`
      : `wght@${weights.join(";")}`;
    return `https://fonts.googleapis.com/css2?family=${name}:${axis}&display=swap`;
  });
}
