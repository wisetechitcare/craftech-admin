import { richTextToPlain, toRichText } from "@/lib/editor";
import {
  ProjectFieldType,
  type ProjectContentField,
  type ProjectFieldDefinition,
  type ProjectImageCaption,
} from "@/types/project";
import type { RichTextDefaults } from "@/types/rich-text";

export const PROJECT_CAPTION_TITLE_MAX = 80;
export const PROJECT_CAPTION_DESCRIPTION_MAX = 200;

export const PROJECT_FIELD_LIMIT = 20;
export const PROJECT_CARD_FIELD_LIMIT = 3;
export const PROJECT_DETAIL_FIELD_WARNING_LIMIT = 12;
export const PROJECT_FIELD_LABEL_MAX = 40;

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

export const PROJECT_BUILT_IN_FIELDS: Record<string, ProjectFieldType> = {
  shortDescription: ProjectFieldType.RICH_TEXT,
  category: ProjectFieldType.TEXT,
  client: ProjectFieldType.TEXT,
  year: ProjectFieldType.NUMBER,
  location: ProjectFieldType.TEXT,
  area: ProjectFieldType.TEXT,
  withCollaboration: ProjectFieldType.TEXT,
  description: ProjectFieldType.RICH_TEXT,
  tags: ProjectFieldType.MULTI_SELECT,
};

const field = (
  key: string,
  label: string,
  type: ProjectFieldType,
  order: number,
  overrides: Partial<ProjectFieldDefinition> = {},
): ProjectFieldDefinition => ({
  key,
  label,
  type,
  required: false,
  enabled: true,
  showOnCard: false,
  showOnDetail: true,
  order,
  ...overrides,
});

export const PROJECT_LEGACY_FIELDS: ProjectFieldDefinition[] = [
  field("category", "Typology", ProjectFieldType.TEXT, 0, {
    required: true,
    showOnCard: true,
  }),
  field("client", "Client name", ProjectFieldType.TEXT, 1, { required: true }),
  field("year", "Year of completion", ProjectFieldType.NUMBER, 2, {
    required: true,
    showOnCard: true,
  }),
  field("location", "Location", ProjectFieldType.TEXT, 3, {
    required: true,
    showOnCard: true,
  }),
  field("area", "Area", ProjectFieldType.TEXT, 4),
  field("withCollaboration", "With collaboration", ProjectFieldType.TEXT, 5),
  field("description", "Detailed description", ProjectFieldType.RICH_TEXT, 6, {
    required: true,
  }),
];

export const PROJECT_FIELD_TYPE_OPTIONS = [
  { value: ProjectFieldType.TEXT, label: "Text" },
  { value: ProjectFieldType.RICH_TEXT, label: "Rich text" },
  { value: ProjectFieldType.NUMBER, label: "Number" },
  { value: ProjectFieldType.DATE, label: "Date" },
  { value: ProjectFieldType.BOOLEAN, label: "Yes / No" },
  { value: ProjectFieldType.SELECT, label: "Select" },
  { value: ProjectFieldType.MULTI_SELECT, label: "Multi-select" },
  { value: ProjectFieldType.URL, label: "URL" },
];

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
