import type { SectionCopyField } from "@/types/common";
import type { GallerySectionContent } from "@/types/gallery";

/** The appearance flag for the homepage Gallery section — the page header owns
 *  the switch, the card and the preview read the same key. /gallery ignores it. */
export const GALLERY_VISIBILITY_KEY = "home.gallery";

/** The Cloudinary folder under craftech/cms/ that gallery uploads land in. */
export const GALLERY_UPLOAD_FOLDER = "gallery";

/** What the live Gallery section shows while its copy is left empty — mirrors
 *  the website's own fallbacks, so the placeholders preview the real result. */
export const GALLERY_SECTION_DEFAULTS: GallerySectionContent = {
  title: "A closer look",
  description: "Explore our work, one image at a time.",
};

/** The Gallery section's copy fields, as the section content card draws them. */
export const GALLERY_SECTION_FIELDS: SectionCopyField<GallerySectionContent>[] =
  [
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
