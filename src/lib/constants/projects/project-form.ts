import { richTextToPlain, toRichText } from "@/lib/editor";
import type { ProjectContentField, ProjectImageCaption } from "@/types/project";
import type { RichTextDefaults } from "@/types/rich-text";

export const PROJECT_CAPTION_TITLE_MAX = 80;
export const PROJECT_CAPTION_DESCRIPTION_MAX = 200;

export const PROJECT_CAPTION_PREVIEW_WIDTH = 640;
export const PROJECT_CAPTION_PREVIEW_HEIGHT = 480;

export const PROJECT_CAPTION_TITLE_DEFAULTS: RichTextDefaults = {
  fontFamily: "Inter",
  fontSize: "14",
};
export const PROJECT_CAPTION_DESCRIPTION_DEFAULTS: RichTextDefaults = {
  fontFamily: "Inter",
  fontSize: "12",
};

export const PROJECT_FIELD_BODY_DEFAULTS: RichTextDefaults = {
  fontFamily: "Inter",
  fontSize: "16",
};

export const PROJECT_FIELD_LABEL_DEFAULTS: RichTextDefaults = {
  fontFamily: "Inter",
  fontSize: "14",
};

export interface ProjectRichFieldConfig {
  key: ProjectContentField;
  label: string;
  required?: boolean;
  wide?: boolean;
  placeholder?: string;
  tooltip?: string;
  /** Plain InputField instead of RichTextField (e.g. typology uses Select). */
  plainOnly?: boolean;
}

export const PROJECT_RICH_FIELDS: ProjectRichFieldConfig[] = [
  {
    key: "title",
    label: "Project name",
    required: true,
    wide: true,
    placeholder: "e.g. Luxury Tower Dubai",
  },
  {
    key: "category",
    label: "Typology",
    required: true,
    wide: true,
    plainOnly: true,
  },
  {
    key: "client",
    label: "Client name",
    required: true,
  },
  {
    key: "year",
    label: "Year of completion",
    required: true,
  },
  {
    key: "location",
    label: "Location",
    required: true,
    placeholder: "City, Country",
  },
  { key: "area", label: "Area", placeholder: "e.g. 2,500 sq. ft." },
  {
    key: "withCollaboration",
    label: "With collaboration",
    wide: true,
    placeholder: "Collaborator name(s), optional",
  },
  {
    key: "description",
    label: "Detailed description",
    required: true,
    wide: true,
    placeholder:
      "Use a blank line after the first paragraph for the short intro on the project page.",
  },
];

/** Hover caption before any per-image override — same as project cards (title + location). */
export const defaultProjectImageCaption = (
  title: string,
  location: string,
): ProjectImageCaption => ({
  title: toRichText(title),
  description: toRichText(location),
});

const captionLine = (
  value: ProjectImageCaption["title"],
  fallback: ProjectImageCaption["title"],
) => {
  if (value && richTextToPlain(value).trim()) return value;
  return fallback;
};

export const resolveProjectImageCaption = (
  saved: ProjectImageCaption | undefined,
  title: string,
  location: string,
): ProjectImageCaption => {
  const defaults = defaultProjectImageCaption(title, location);
  if (!saved) return defaults;
  return {
    title: captionLine(saved.title, defaults.title),
    description: captionLine(saved.description, defaults.description),
    captionBackground: saved.captionBackground ?? null,
    captionBackgroundNone: saved.captionBackgroundNone === true,
  };
};

export const projectImageCaptionPlainLabel = (
  caption: ProjectImageCaption,
): string => {
  const parts = [
    richTextToPlain(caption.title).trim(),
    richTextToPlain(caption.description).trim(),
  ].filter(Boolean);
  return parts.join(" · ");
};

/** Same as defaults → do not store on the project; keeps title/location fields independent. */
export const projectImageCaptionMatchesDefault = (
  caption: ProjectImageCaption,
  title: string,
  location: string,
): boolean => {
  const base = defaultProjectImageCaption(title, location);
  return (
    richTextToPlain(caption.title).trim() ===
      richTextToPlain(base.title).trim() &&
    richTextToPlain(caption.description).trim() ===
      richTextToPlain(base.description).trim() &&
    (caption.captionBackground ?? null) === null &&
    !caption.captionBackgroundNone
  );
};
