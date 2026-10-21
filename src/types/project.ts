import type { RichTextDocument } from "@/types/rich-text";

export const PROJECT_CONTENT_FIELDS = [
  "title",
  "shortDescription",
  "category",
  "client",
  "year",
  "location",
  "area",
  "withCollaboration",
  "description",
] as const;

export type ProjectContentField = (typeof PROJECT_CONTENT_FIELDS)[number];

export enum ProjectFieldType {
  TEXT = "text",
  RICH_TEXT = "richText",
  NUMBER = "number",
  DATE = "date",
  BOOLEAN = "boolean",
  SELECT = "select",
  MULTI_SELECT = "multiSelect",
  URL = "url",
}

export enum ProjectStatus {
  DRAFT = "draft",
  PUBLISHED = "published",
  ARCHIVED = "archived",
}

export interface ProjectFieldDefinition {
  key: string;
  label: string;
  type: ProjectFieldType;
  required: boolean;
  enabled: boolean;
  showOnCard: boolean;
  showOnDetail: boolean;
  order: number;
  options?: string[];
}

export type ProjectCustomValue =
  string | number | boolean | string[] | RichTextDocument | null;

export interface ProjectFormState {
  title: string;
  category: string;
  description: string;
  client: string;
  year: number | string;
  location: string;
  area: string;
  withCollaboration: string;
  status: ProjectStatus;
}

export interface ProjectImageRow {
  url: string;
  publicId?: string;
}

export interface ProjectMedia {
  slug: string;
  thumbnail?: string;
  thumbnailPublicId?: string;
  images: string[];
  imagePublicIds?: string[];
}

export interface ProjectImageCaption {
  title?: RichTextDocument | null;
  description?: RichTextDocument | null;
  captionBackground?: string | null;
  /** Hover caption text without a background wash. */
  captionBackgroundNone?: boolean;
}

export interface ProjectMetadata {
  visibility?: Record<string, boolean>;
  content?: Partial<Record<ProjectContentField, RichTextDocument>>;
  imageCaptions?: Record<string, ProjectImageCaption>;
  tags?: string[];
  customValues?: Record<string, ProjectCustomValue>;
}
