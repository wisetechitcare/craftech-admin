import { useState } from "react";
import { isAxiosError } from "axios";
import toast from "react-hot-toast";

import FileUpload from "@/components/admin/ui/FileUpload";
import InputField from "@/components/admin/ui/InputField";

import {
  CLIENT_DISPLAY_NAME_HELPER,
  CLIENT_DISPLAY_NAME_MAX,
  CLIENTS_UPLOAD_FOLDER,
} from "@/lib/constants/clients";
import {
  IMAGE_UPLOAD_ACCEPT,
  IMAGE_UPLOAD_MAX_SIZE_MB,
} from "@/lib/constants/common";
import { uploadApi } from "@/services/api";
import type { ClientFormValues } from "@/types/clients";

interface ClientLogoFieldsProps {
  form: ClientFormValues;
  onChange: (next: ClientFormValues) => void;
  logoLink: string;
  onLogoLinkChange: (value: string) => void;
}

const ClientLogoFields = ({
  form,
  onChange,
  logoLink,
  onLogoLinkChange,
}: ClientLogoFieldsProps) => {
  const [uploading, setUploading] = useState(false);
  const [uploadSlot, setUploadSlot] = useState(0);

  const patch = (partial: Partial<ClientFormValues>) =>
    onChange({ ...form, ...partial });

  const uploadLogo = async (staged: File[]) => {
    const file = staged[staged.length - 1];
    if (!file) return;

    let message = "Something went wrong. Please try again.";
    let isError = true;
    setUploading(true);

    try {
      const body = new FormData();
      body.append("file", file);
      const response = await uploadApi.cmsMedia(CLIENTS_UPLOAD_FOLDER, body);

      message = response.data?.message || "Logo uploaded";

      if (response.data?.success) {
        isError = false;
        onLogoLinkChange("");
        patch({ logo: response.data.data.url });
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
        setUploadSlot((n) => n + 1);
      }
      setUploading(false);
    }
  };

  const logoForUpload = uploading ? "" : form.logo;

  return (
    <>
      <div>
        <label className="block text-[10px] font-bold text-ink-faint uppercase tracking-wider mb-1.5">
          Logo upload
        </label>
        <FileUpload
          key={uploadSlot}
          acceptTypes={IMAGE_UPLOAD_ACCEPT}
          maxFiles={1}
          maxSizeMB={IMAGE_UPLOAD_MAX_SIZE_MB}
          existingImages={logoForUpload ? [logoForUpload] : []}
          onExistingImagesChange={(images) => {
            onLogoLinkChange("");
            patch({ logo: images[0] ?? "" });
          }}
          onFilesChange={uploadLogo}
        />
        {uploading && (
          <p className="mt-2 text-xs text-ink-mute">Uploading logo…</p>
        )}
        {form.logo && !uploading && (
          <p className="mt-2 text-xs text-ink-faint">
            Uploaded — preview above.
          </p>
        )}
      </div>

      <InputField
        label="Logo link (optional)"
        type="url"
        value={logoLink}
        onChange={(e) => onLogoLinkChange(e.target.value)}
        onBlur={() => {
          if (logoLink.trim()) patch({ logo: logoLink.trim() });
        }}
        placeholder="https://… (paste if not uploading)"
      />

      <InputField
        label="Client name (optional)"
        value={form.displayName}
        onChange={(e) =>
          patch({
            displayName: e.target.value.slice(0, CLIENT_DISPLAY_NAME_MAX),
          })
        }
        maxLength={CLIENT_DISPLAY_NAME_MAX}
        maxChars={CLIENT_DISPLAY_NAME_MAX}
        hint={CLIENT_DISPLAY_NAME_HELPER}
        placeholder="Short brand name for Variant 2 hover"
      />

      <InputField
        label="Website link (optional)"
        type="url"
        value={form.website}
        onChange={(e) => patch({ website: e.target.value })}
        placeholder="https://"
      />
    </>
  );
};

export default ClientLogoFields;
