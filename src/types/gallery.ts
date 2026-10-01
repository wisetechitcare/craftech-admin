import type { FaqSectionContent } from "@/types/faq";
import type { RichTextDocument, RichTextValue } from "@/types/rich-text";

/** The Gallery section's own copy. Empty strings mean "use the site's default". */
export interface GallerySectionContent extends Pick<
  FaqSectionContent,
  "title" | "description"
> {
  /** The short label over the title. */
  eyebrow: string;
}

/** A media library image in its gallery position; the array position is the order. */
export interface GalleryImage {
  _id: string;
  name: string;
  url: string;
  /** The styled hover caption; an empty document until an admin writes one. */
  title?: RichTextValue;
  description?: RichTextValue;
  /** #rrggbb behind the caption; null keeps the site's gradient. */
  captionBackground?: string | null;
}

/** What POST /cms/gallery takes: the upload's result, named after its file. */
export interface GalleryImagePayload {
  name: string;
  url: string;
  publicId?: string;
}

/** What PUT /cms/gallery/:id takes: the hover caption. An empty document clears a line. */
export interface GalleryImageUpdatePayload {
  title: RichTextDocument;
  description: RichTextDocument;
  captionBackground: string | null;
}

export interface GalleryListResponse {
  success: boolean;
  message?: string;
  data: GalleryImage[];
}
