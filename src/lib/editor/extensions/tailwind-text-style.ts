import { Extension } from "@tiptap/core";

import type { RichTextStyleAttributes } from "@/types/rich-text";

export interface TailwindTextStyleAttributeOptions {
  name: keyof RichTextStyleAttributes;
  /** The only values it may hold, as Tailwind class names. */
  tokens: readonly string[];
}

/**
 * A `textStyle` attribute whose value IS a Tailwind class.
 *
 * Tiptap's own FontSize extension writes `font-size: 32px`, which puts an
 * arbitrary number into content the design system owns. This stores the token
 * and renders it as a class, so the website renders exactly what the editor
 * showed with no px→token translation anywhere.
 */
export const tailwindTextStyleAttribute = ({
  name,
  tokens,
}: TailwindTextStyleAttributeOptions) =>
  Extension.create({
    name: `tailwind-${name}`,

    addGlobalAttributes() {
      return [
        {
          types: ["textStyle"],
          attributes: {
            [name]: {
              default: null,
              // Only matters for pasted HTML — stored content arrives as JSON.
              parseHTML: (element: HTMLElement) =>
                element
                  .getAttribute("class")
                  ?.split(/\s+/)
                  .find((candidate) => tokens.includes(candidate)) ?? null,
              renderHTML: (attributes: Record<string, unknown>) => {
                const token = attributes[name];
                return typeof token === "string" && tokens.includes(token)
                  ? { class: token }
                  : {};
              },
            },
          },
        },
      ];
    },
  });
