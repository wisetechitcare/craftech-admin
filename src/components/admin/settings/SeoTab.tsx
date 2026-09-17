import { useState } from "react";
import { Accept } from "react-dropzone";
import { isAxiosError } from "axios";
import toast from "react-hot-toast";

import ToggleField from "./ToggleField";

import FileUpload from "@/components/admin/ui/FileUpload";
import InputField from "@/components/admin/ui/InputField";
import { SectionCard } from "@/components/admin/ui/SectionCard";
import TextArea from "@/components/admin/ui/TextArea";

import { SETTINGS_LIMITS } from "@/lib/constants/settings";
import { uploadApi } from "@/services/api";
import type { SettingsTabProps } from "@/types/settings";

const SHARE_IMAGE_ACCEPT: Accept = {
  "image/*": [".jpg", ".jpeg", ".png", ".webp"],
};

const SeoTab = ({ data, errors, patch }: SettingsTabProps) => {
  const [uploading, setUploading] = useState<boolean>(false);
  // FileUpload stages the dropped file internally; remounting clears it once
  // the uploaded URL is stored.
  const [slot, setSlot] = useState<number>(0);

  const uploadShareImage = async (staged: File[]) => {
    const file = staged[0];
    if (!file) return;

    let message = "Something went wrong. Please try again.";
    let isError = true;
    setUploading(true);

    try {
      const form = new FormData();
      form.append("file", file);

      const response = await uploadApi.cmsMedia("seo", form);

      message = response.data?.message || "Image uploaded";

      if (response.data?.success) {
        isError = false;
        patch({ seoOgImage: response.data.data.url });
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
    <div className="space-y-6">
      <SectionCard
        title="Search defaults"
        description="What search engines and link previews show for any page that does not set its own."
      >
        <InputField
          label="Site URL"
          type="url"
          placeholder="https://www.example.com"
          value={data.website ?? ""}
          onChange={(e) => patch({ website: e.target.value })}
          error={!!errors.website}
          hint={
            errors.website ??
            "This website's own public address. Used for canonical links and share previews."
          }
        />
        <InputField
          label="Default title"
          value={data.seoDefaultTitle ?? ""}
          onChange={(e) => patch({ seoDefaultTitle: e.target.value })}
          maxChars={SETTINGS_LIMITS.seoDefaultTitle}
          error={!!errors.seoDefaultTitle}
          hint={
            errors.seoDefaultTitle ??
            "The homepage title. Other pages show “Page | Site name”. Empty uses the site name."
          }
        />
        <TextArea
          label="Default meta description"
          rows={3}
          value={data.seoDefaultDescription ?? ""}
          onChange={(e) => patch({ seoDefaultDescription: e.target.value })}
          maxChars={SETTINGS_LIMITS.seoDefaultDescription}
          error={!!errors.seoDefaultDescription}
          hint={
            errors.seoDefaultDescription ??
            "The search-result snippet. Empty uses the short description from General."
          }
        />
        <div>
          <label className="block text-[10px] font-bold text-ink-faint uppercase tracking-wider mb-1.5">
            Default share image
          </label>
          <FileUpload
            key={slot}
            acceptTypes={SHARE_IMAGE_ACCEPT}
            maxFiles={1}
            maxSizeMB={5}
            error={errors.seoOgImage}
            existingImages={data.seoOgImage ? [data.seoOgImage] : []}
            onExistingImagesChange={(images) =>
              patch({ seoOgImage: images[0] ?? "" })
            }
            onFilesChange={uploadShareImage}
          />
          <p className="mt-2 text-xs text-ink-faint">
            {uploading
              ? "Uploading…"
              : "Shown when a page is shared on social media. 1200 × 630 px works everywhere."}
          </p>
        </div>
        <ToggleField
          label="Allow search engines to index this site"
          description="Turn off for a site that is not ready yet. Pages then ask search engines not to list them."
          checked={data.searchIndexing}
          onChange={(searchIndexing) => patch({ searchIndexing })}
        />
      </SectionCard>

      <SectionCard
        title="Integrations"
        description="Both are optional. Nothing is loaded while a field is empty."
      >
        <InputField
          label="Google Analytics measurement ID"
          placeholder="G-XXXXXXXXXX"
          value={data.googleAnalyticsId ?? ""}
          onChange={(e) => patch({ googleAnalyticsId: e.target.value.trim() })}
          error={!!errors.googleAnalyticsId}
          hint={
            errors.googleAnalyticsId ??
            "Loads Google Analytics on every public page."
          }
        />
        <InputField
          label="Google Search Console verification code"
          value={data.googleSearchConsoleId ?? ""}
          onChange={(e) =>
            patch({ googleSearchConsoleId: e.target.value.trim() })
          }
          error={!!errors.googleSearchConsoleId}
          hint={
            errors.googleSearchConsoleId ??
            'From Search Console\'s HTML tag method: paste only the content="…" value.'
          }
        />
      </SectionCard>
    </div>
  );
};

export default SeoTab;
