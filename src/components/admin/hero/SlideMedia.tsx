import { useState } from "react";
import type { Accept } from "react-dropzone";
import toast from "react-hot-toast";

import FileUpload from "@/components/admin/ui/FileUpload";

import { uploadApi } from "@/services/api";
import { isHeroVideo } from "@/types/hero";

const SLIDE_ACCEPT: Accept = {
  "image/*": [".jpg", ".jpeg", ".png", ".webp"],
  "video/*": [".mp4", ".mov", ".webm", ".mkv", ".avi"],
};

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
    <div className={className}>
      <label className="mb-4 block text-sm font-medium text-black">
        Media{" "}
        {max > 1 && !hasVideo && (
          <span className="font-normal text-ink-faint">
            ({value.length}/{max} images)
          </span>
        )}
        {hasVideo && (
          <span className="font-normal text-ink-faint">
            (video — fills the slide)
          </span>
        )}
      </label>
      <FileUpload
        key={slot}
        acceptTypes={SLIDE_ACCEPT}
        maxFiles={capacity}
        maxSizeMB={200}
        error={error}
        existingImages={value}
        onExistingImagesChange={onChange}
        onFilesChange={upload}
      />
      {uploading && <p className="mt-2 text-xs text-ink-mute">Uploading…</p>}
    </div>
  );
}
