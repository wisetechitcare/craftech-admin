import type { SectionCopyField } from "@/types/common";
import type { GallerySectionContent } from "@/types/gallery";
import type { RichTextDefaults } from "@/types/rich-text";

/** The appearance flag for the homepage Gallery section — the page header owns
 *  the switch, the card and the preview read the same key. /gallery ignores it. */
export const GALLERY_VISIBILITY_KEY = "home.gallery";

/** The Cloudinary folder under craftech/cms/ that gallery uploads land in. */
export const GALLERY_UPLOAD_FOLDER = "gallery";

/** An image's hover caption, at the plain-text lengths the server allows. */
export const GALLERY_CAPTION_TITLE_MAX = 80;
export const GALLERY_CAPTION_DESCRIPTION_MAX = 200;

/** The caption preview renders one tile at about the size the site's grid
 *  gives it, so the caption's text keeps its real proportion to the image. */
export const GALLERY_CAPTION_PREVIEW_WIDTH = 640;
export const GALLERY_CAPTION_PREVIEW_HEIGHT = 480;

/** What an unstyled caption line inherits on the site, shown in the toolbar. */
export const GALLERY_CAPTION_TITLE_DEFAULTS: RichTextDefaults = {
  fontFamily: "Inter",
  fontSize: "14",
};
export const GALLERY_CAPTION_DESCRIPTION_DEFAULTS: RichTextDefaults = {
  fontFamily: "Inter",
  fontSize: "12",
};

/** What the live Gallery section shows while its copy is left empty — mirrors
 *  the website's own fallbacks, so the placeholders preview the real result. */
export const GALLERY_SECTION_DEFAULTS: GallerySectionContent = {
  eyebrow: "Gallery",
  title: "A closer look",
  description: "Explore our work, one image at a time.",
};

/** The Gallery section's copy fields, as the section content card draws them. */
export const GALLERY_SECTION_FIELDS: SectionCopyField<GallerySectionContent>[] =
  [
    {
      key: "eyebrow",
      label: "Eyebrow",
      placeholder: GALLERY_SECTION_DEFAULTS.eyebrow,
      tooltip: "The short label above the title.",
      narrow: true,
    },
    {
      key: "title",
      label: "Title",
      placeholder: GALLERY_SECTION_DEFAULTS.title,
    },
    {
      key: "description",
      label: "Supporting text",
      placeholder: GALLERY_SECTION_DEFAULTS.description,
      multiline: true,
    },
  ];
