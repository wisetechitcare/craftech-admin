import type { RichTextDocument } from "@/types/rich-text";

export const PROJECT_CONTENT_FIELDS = [
  "title",
  "category",
  "client",
  "year",
  "location",
  "area",
  "withCollaboration",
  "description",
] as const;

export type ProjectContentField = (typeof PROJECT_CONTENT_FIELDS)[number];

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
}
