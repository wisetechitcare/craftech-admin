import type { FaqSectionContent } from "@/types/faq";

/** The Gallery section's own copy. Empty strings mean "use the site's default". */
export type GallerySectionContent = Pick<
  FaqSectionContent,
  "title" | "description"
>;

/** A media library image in its gallery position; the array position is the order. */
export interface GalleryImage {
  _id: string;
  name: string;
  url: string;
}

/** What POST /cms/gallery takes: the upload's result, named after its file. */
export interface GalleryImagePayload {
  name: string;
  url: string;
  publicId?: string;
}

export interface GalleryListResponse {
  success: boolean;
  message?: string;
  data: GalleryImage[];
}
