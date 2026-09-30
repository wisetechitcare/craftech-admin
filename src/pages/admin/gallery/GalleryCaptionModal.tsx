import { useState } from "react";
import { Loader2, PaintBucket, Save } from "lucide-react";
import { isAxiosError } from "axios";
import toast from "react-hot-toast";

import Modal from "@/components/admin/ui/Modal";
import RichTextField from "@/components/admin/ui/RichTextField";
import SitePreview, { PreviewSection } from "@/components/admin/ui/SitePreview";
import { ColorPicker } from "@/components/common/editor/controls";
import { Button } from "@/components/ui/button";

import { toRichText } from "@/lib/editor";
import {
  GALLERY_CAPTION_DESCRIPTION_DEFAULTS,
  GALLERY_CAPTION_DESCRIPTION_MAX,
  GALLERY_CAPTION_PREVIEW_HEIGHT,
  GALLERY_CAPTION_PREVIEW_WIDTH,
  GALLERY_CAPTION_TITLE_DEFAULTS,
  GALLERY_CAPTION_TITLE_MAX,
} from "@/lib/constants/gallery";
import { DEFAULT_RICH_TEXT_CONFIG } from "@/lib/constants/rich-text";
import { galleryApi } from "@/services/api";
import type { ImageStyleMap } from "@/types/common";
import type { GalleryImage, GalleryImageUpdatePayload } from "@/types/gallery";
import type { RichTextDocument } from "@/types/rich-text";

interface GalleryCaptionModalProps {
  image: GalleryImage;
  /** 1-based, as the tile's badge shows it. */
  position: number;
  count: number;
  /** The unsaved switches, so the preview matches the page behind the dialog. */
  imageStyles: ImageStyleMap;
  onClose: () => void;
  onSaved: (id: string, caption: GalleryImageUpdatePayload) => void;
}

/** One image's hover caption, edited beside a live preview of that image so
 *  there is no doubt which one it belongs to. Mount with `key={image._id}`. */
const GalleryCaptionModal = ({
  image,
  position,
  count,
  imageStyles,
  onClose,
  onSaved,
}: GalleryCaptionModalProps) => {
  const [title, setTitle] = useState<RichTextDocument>(toRichText(image.title));
  const [description, setDescription] = useState<RichTextDocument>(
    toRichText(image.description),
  );
  const [captionBackground, setCaptionBackground] = useState<string | null>(
    image.captionBackground ?? null,
  );
  const [saving, setSaving] = useState<boolean>(false);

  const caption: GalleryImageUpdatePayload = {
    title,
    description,
    captionBackground,
  };

  const handleSave = async () => {
    let message = "Failed to save the caption";
    let isError = true;

    setSaving(true);

    try {
      const response = await galleryApi.update(image._id, caption);

      message = response.data?.message || message;

      if (response.data?.success) {
        isError = false;
        onSaved(image._id, caption);
        onClose();
      }
    } catch (error) {
      if (isAxiosError(error)) {
        message = error.response?.data?.message || message;
      }
    } finally {
      if (isError) {
        toast.error(message);
      } else {
        toast.success(message);
      }

      setSaving(false);
    }
  };

  return (
    <Modal
      open
      title={`Caption · Image ${position} of ${count}`}
      description="Shown over this image on hover. Leave a field empty to hide that line."
      onClose={onClose}
      className="max-w-5xl"
      footer={
        <>
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={saving}
            className="text-sm font-bold"
            startIcon={
              saving ? (
                <Loader2 className="size-5 animate-spin" />
              ) : (
                <Save className="size-5" />
              )
            }
          >
            Save Caption
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-start">
          <div className="w-full shrink-0 md:max-w-md">
            <SitePreview
              section={PreviewSection.GALLERY_CAPTION}
              draft={{
                galleryContent: {
                  images: [{ ...image, ...caption }],
                  section: { eyebrow: "", title: "", description: "" },
                },
                appearance: { imageStyles },
              }}
              viewportWidth={GALLERY_CAPTION_PREVIEW_WIDTH}
              viewportHeight={GALLERY_CAPTION_PREVIEW_HEIGHT}
            />
          </div>
          <div className="min-w-0 flex-1 space-y-4">
            <div>
              <p className="text-sm font-semibold text-ink">Live preview</p>
              <p className="mt-1 text-xs text-ink-faint">
                Drawn by the website itself, as the caption shows while this
                image is hovered. It updates as you type.
              </p>
            </div>
            <div className="flex items-center justify-between gap-4 rounded-lg border border-line px-4 py-3">
              <div className="min-w-0">
                <div className="text-sm font-semibold text-ink">
                  Caption background
                </div>
                <p className="mt-0.5 text-xs text-ink-faint">
                  Behind this caption. Automatic keeps the site's gradient.
                </p>
              </div>
              <ColorPicker
                label="Caption background"
                icon={<PaintBucket className="size-4" />}
                swatches={DEFAULT_RICH_TEXT_CONFIG.colorSwatches}
                value={captionBackground}
                onChange={setCaptionBackground}
              />
            </div>
            <p className="truncate text-xs text-ink-faint">{image.name}</p>
          </div>
        </div>

        <RichTextField
          label="Title"
          value={title}
          onChange={setTitle}
          defaults={GALLERY_CAPTION_TITLE_DEFAULTS}
          maxChars={GALLERY_CAPTION_TITLE_MAX}
          placeholder="e.g. Riverside Villa"
          tooltip="Select text to style just that part, or style the whole line with nothing selected."
        />
        <RichTextField
          label="Description"
          value={description}
          onChange={setDescription}
          defaults={GALLERY_CAPTION_DESCRIPTION_DEFAULTS}
          maxChars={GALLERY_CAPTION_DESCRIPTION_MAX}
          placeholder="e.g. Full MEP fit-out, completed 2024"
        />
      </div>
    </Modal>
  );
};

export default GalleryCaptionModal;
