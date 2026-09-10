import { useState } from "react";
import { Accept } from "react-dropzone";
import { isAxiosError } from "axios";
import toast from "react-hot-toast";

import FileUpload from "@/components/admin/ui/FileUpload";
import InputField from "@/components/admin/ui/InputField";
import TextArea from "@/components/admin/ui/TextArea";

import { SectionCard, type AboutSectionProps } from "./shared";

import { AboutSectionKey } from "@/lib/constants/about";
import { uploadApi } from "@/services/api";

const STORY_ACCEPT: Accept = {
  "image/*": [".jpg", ".jpeg", ".png", ".webp"],
};

/** Our Story — the opening block: heading, introduction and the main image. */
const StorySection = ({
  content,
  rules,
  errors,
  patchSection,
  toggle,
  elementToggles,
}: AboutSectionProps) => {
  const { story } = content;
  const [uploading, setUploading] = useState<boolean>(false);
  // FileUpload stages the dropped file internally; once it is uploaded and its
  // URL stored, that staged copy is stale. Remounting is the whole reset.
  const [slot, setSlot] = useState<number>(0);

  const uploadImage = async (staged: File[]) => {
    const file = staged[0];
    if (!file) return;

    let message = "Something went wrong. Please try again.";
    let isError = true;
    setUploading(true);

    try {
      const form = new FormData();
      form.append("file", file);

      const response = await uploadApi.cmsMedia("about", form);

      message = response.data?.message || "Image uploaded";

      if (response.data?.success) {
        isError = false;
        patchSection("story", { image: response.data.data.url });
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

      setSlot((n) => n + 1);
      setUploading(false);
    }
  };

  return (
    <SectionCard
      title="Our Story"
      description="The opening block: the page heading, its introduction and the main image."
      controls={toggle(AboutSectionKey.STORY)}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField
          label="Section label"
          required
          value={story.label}
          onChange={(e) => patchSection("story", { label: e.target.value })}
          maxChars={rules.label.max}
          error={!!errors["story.label"]}
          hint={errors["story.label"]}
          tooltip="The kicker above the heading. Also labels the image caption."
        />
        <InputField
          label="Heading"
          required
          value={story.heading}
          onChange={(e) => patchSection("story", { heading: e.target.value })}
          maxChars={rules.heading.max}
          error={!!errors["story.heading"]}
          hint={errors["story.heading"]}
          tooltip="Text after the first comma renders in the accent colour; with no comma, the last two words do."
        />
      </div>
      <TextArea
        label="Description"
        required
        value={story.description}
        onChange={(e) => patchSection("story", { description: e.target.value })}
        maxChars={rules.storyDescription.max}
        error={!!errors["story.description"]}
        hint={errors["story.description"]}
        rows={4}
      />
      <div>
        <label className="block text-[10px] font-bold text-ink-faint uppercase tracking-wider mb-1.5">
          Image
        </label>
        <FileUpload
          key={slot}
          acceptTypes={STORY_ACCEPT}
          maxFiles={1}
          maxSizeMB={10}
          error={errors["story.image"]}
          existingImages={story.image ? [story.image] : []}
          onExistingImagesChange={(images) =>
            patchSection("story", { image: images[0] ?? "" })
          }
          onFilesChange={uploadImage}
        />
        {uploading ? (
          <p className="mt-2 text-xs text-ink-mute">Uploading…</p>
        ) : (
          story.image && (
            <p className="mt-2 text-xs text-ink-faint">
              The section takes one image. Remove this one to upload a different
              picture.
            </p>
          )
        )}
      </div>
      <InputField
        label="Image caption"
        value={story.caption}
        onChange={(e) => patchSection("story", { caption: e.target.value })}
        maxChars={rules.caption.max}
        error={!!errors["story.caption"]}
        hint={errors["story.caption"]}
        tooltip="Printed over the image. Kept short — Floating sets it in large display type inside a narrow card."
      />
      {elementToggles(AboutSectionKey.STORY)}
    </SectionCard>
  );
};

export default StorySection;
