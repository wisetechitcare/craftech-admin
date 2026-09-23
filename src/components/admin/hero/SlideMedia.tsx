import { useState } from "react";
import type { Accept } from "react-dropzone";
import toast from "react-hot-toast";

import FileUpload from "@/components/admin/ui/FileUpload";
import { SelectFieldWrapper } from "@/components/admin/ui/SelectField";

import { HERO_SLIDE_MEDIA_MAX_SIZE_MB } from "@/lib/constants/hero";
import { uploadApi } from "@/services/api";
import { isHeroVideo } from "@/types/hero";

const SLIDE_ACCEPT: Accept = {
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/webp": [".webp"],
  "image/svg+xml": [".svg"],
  "video/mp4": [".mp4"],
  "video/webm": [".webm"],
};

const { IMAGE, VECTOR, VIDEO } = HERO_SLIDE_MEDIA_MAX_SIZE_MB;

const HERO_MEDIA_HINT = `Supports JPG, JPEG, PNG, WebP (max ${IMAGE} MB), SVG (max ${VECTOR} MB, sanitized), MP4 and WebM (max ${VIDEO} MB).`;

const VIDEO_TOOLTIP =
  "Video fills this line — images are hidden while a video is attached.";

interface SlideMediaProps {
  value: string[];
  error?: string;
  max: number;
  onChange: (urls: string[]) => void;
  className?: string;
}

export default function SlideMedia({
  value,
  error,
  max,
  onChange,
  className,
}: SlideMediaProps) {
  const [uploading, setUploading] = useState<boolean>(false);
  const [slot, setSlot] = useState<number>(0);

  const hasVideo = value.some(isHeroVideo);
  const capacity = hasVideo ? value.length : max;

  const upload = async (staged: File[]) => {
    if (!staged.length) return;

    const hasVideoFile = staged.some((file) => file.type.startsWith("video"));
    if (hasVideoFile && staged.length + value.length > 1) {
      toast.error(
        "A video fills the slide on its own — drop it by itself, after clearing the other media.",
      );
      setSlot((n) => n + 1);
      return;
    }

    for (const file of staged) {
      const limitMb =
        file.type === "image/svg+xml"
          ? VECTOR
          : file.type.startsWith("video/")
            ? VIDEO
            : IMAGE;
      if (file.size > limitMb * 1024 * 1024) {
        toast.error(
          `"${file.name}" is too large. Max allowed size: ${limitMb} MB.`,
        );
        setSlot((n) => n + 1);
        return;
      }
    }

    setUploading(true);
    const uploaded: string[] = [];
    try {
      for (const file of staged) {
        const form = new FormData();
        form.append("file", file);
        const { data } = await uploadApi.cmsMedia("hero", form);
        uploaded.push(data.data.url);
      }
      toast.success(
        uploaded.length > 1
          ? `${uploaded.length} files uploaded`
          : "File uploaded",
      );
    } catch (err) {
      const res = (err as { response?: { data?: { message?: string } } })
        .response;
      toast.error(res?.data?.message || "Upload failed");
    } finally {
      if (uploaded.length) onChange([...value, ...uploaded]);
      setSlot((n) => n + 1);
      setUploading(false);
    }
  };

  return (
    <SelectFieldWrapper
      label="Media (image or video)"
      required
      tooltip={VIDEO_TOOLTIP}
      hasError={Boolean(error)}
      resolvedHint={error}
      className={className}
    >
      <FileUpload
        key={slot}
        acceptTypes={SLIDE_ACCEPT}
        maxFiles={capacity}
        maxSizeMB={VIDEO}
        hint={<p className="mt-2 text-sm text-gray-500">{HERO_MEDIA_HINT}</p>}
        existingImages={value}
        onExistingImagesChange={onChange}
        onFilesChange={upload}
      />
      {uploading && <p className="mt-2 text-xs text-ink-mute">Uploading…</p>}
    </SelectFieldWrapper>
  );
}
