import { useState } from "react";
import { isAxiosError } from "axios";
import toast from "react-hot-toast";
import { Ban, Loader2, PaintBucket, Save } from "lucide-react";

import Modal from "@/components/admin/ui/Modal";
import RichTextField from "@/components/admin/ui/RichTextField";
import SitePreview, { PreviewSection } from "@/components/admin/ui/SitePreview";
import { ColorPicker } from "@/components/common/editor/controls";
import { Button } from "@/components/ui/button";

import { toRichText } from "@/lib/editor";
import {
  PROJECT_CAPTION_DESCRIPTION_DEFAULTS,
  PROJECT_CAPTION_DESCRIPTION_MAX,
  PROJECT_CAPTION_PREVIEW_HEIGHT,
  PROJECT_CAPTION_PREVIEW_WIDTH,
  PROJECT_CAPTION_TITLE_DEFAULTS,
  PROJECT_CAPTION_TITLE_MAX,
} from "@/lib/constants/projects";
import { DEFAULT_RICH_TEXT_CONFIG } from "@/lib/constants/rich-text";
import { cn } from "@/utils/utils";
import { ImageStyleSection, type ImageStyleMap } from "@/types/common";
import type { ProjectImageCaption } from "@/types/project";
import type { RichTextDocument } from "@/types/rich-text";

interface ProjectCaptionModalProps {
  imageUrl: string;
  position: number;
  count: number;
  caption: ProjectImageCaption;
  imageStyles: ImageStyleMap;
  onClose: () => void;
  onSave: (caption: ProjectImageCaption) => void | Promise<void>;
}

const ProjectCaptionModal = ({
  imageUrl,
  position,
  count,
  caption: initial,
  imageStyles,
  onClose,
  onSave,
}: ProjectCaptionModalProps) => {
  const [title, setTitle] = useState<RichTextDocument>(
    toRichText(initial.title),
  );
  const [description, setDescription] = useState<RichTextDocument>(
    toRichText(initial.description),
  );
  const [captionBackground, setCaptionBackground] = useState<string | null>(
    initial.captionBackground ?? null,
  );
  const [captionBackgroundNone, setCaptionBackgroundNone] = useState(
    initial.captionBackgroundNone === true,
  );
  const [saving, setSaving] = useState(false);

  const draft: ProjectImageCaption = {
    title,
    description,
    captionBackground,
    captionBackgroundNone: captionBackgroundNone || undefined,
  };

  const previewStyles: ImageStyleMap = {
    ...imageStyles,
    [ImageStyleSection.GALLERY]: imageStyles[ImageStyleSection.PROJECT_DETAIL],
  };

  return (
    <Modal
      open
      title={`Caption · Image ${position} of ${count}`}
      description="Shown over this image on hover when Caption on hover is enabled below."
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
            disabled={saving}
            onClick={async () => {
              setSaving(true);
              let message = "Failed to save the caption";
              let isError = true;
              try {
                await onSave(draft);
                isError = false;
                message = "Caption saved";
                onClose();
              } catch (error) {
                if (isAxiosError(error)) {
                  message = error.response?.data?.message || message;
                }
              } finally {
                setSaving(false);
                toast[isError ? "error" : "success"](message);
              }
            }}
            className="text-sm font-bold"
            startIcon={
              saving ? (
                <Loader2 className="size-5 animate-spin" />
              ) : (
                <Save className="size-5" />
              )
            }
          >
            Apply caption
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
                  images: [
                    {
                      _id: imageUrl,
                      name: `Image ${position}`,
                      url: imageUrl,
                      title,
                      description,
                      captionBackground,
                      captionBackgroundNone,
                    },
                  ],
                  section: { eyebrow: "", title: "", description: "" },
                },
                appearance: { imageStyles: previewStyles },
              }}
              viewportWidth={PROJECT_CAPTION_PREVIEW_WIDTH}
              viewportHeight={PROJECT_CAPTION_PREVIEW_HEIGHT}
            />
          </div>
          <div className="min-w-0 flex-1 space-y-4">
            <div className="flex items-center justify-between gap-4 rounded-lg border border-line px-4 py-3">
              <div className="min-w-0">
                <div className="text-sm font-semibold text-ink">
                  Caption background
                </div>
                <p className="mt-0.5 text-xs text-ink-faint">
                  Automatic uses the site gradient. Ban hides the wash (text
                  only).
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  title="No caption background"
                  aria-label="No caption background"
                  aria-pressed={captionBackgroundNone}
                  onClick={() => {
                    setCaptionBackgroundNone((on) => {
                      const next = !on;
                      if (next) setCaptionBackground(null);
                      return next;
                    });
                  }}
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded transition-colors hover:bg-gray-200",
                    captionBackgroundNone && "bg-gray-200 text-ink",
                  )}
                >
                  <Ban className="size-4" />
                </button>
                <ColorPicker
                  label="Caption background"
                  icon={<PaintBucket className="size-4" />}
                  swatches={DEFAULT_RICH_TEXT_CONFIG.colorSwatches}
                  value={captionBackgroundNone ? null : captionBackground}
                  disabled={captionBackgroundNone}
                  onChange={(color) => {
                    setCaptionBackgroundNone(false);
                    setCaptionBackground(color);
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <RichTextField
          label="Title"
          value={title}
          onChange={setTitle}
          defaults={PROJECT_CAPTION_TITLE_DEFAULTS}
          maxChars={PROJECT_CAPTION_TITLE_MAX}
          placeholder="e.g. Main facade"
        />
        <RichTextField
          label="Description"
          value={description}
          onChange={setDescription}
          defaults={PROJECT_CAPTION_DESCRIPTION_DEFAULTS}
          maxChars={PROJECT_CAPTION_DESCRIPTION_MAX}
          placeholder="e.g. Evening view from the plaza"
        />
      </div>
    </Modal>
  );
};

export default ProjectCaptionModal;
