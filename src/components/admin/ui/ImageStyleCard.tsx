import { useState } from "react";
import { isAxiosError } from "axios";
import toast from "react-hot-toast";
import { Loader2, Save } from "lucide-react";

import { SectionCard } from "@/components/admin/ui/SectionCard";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

import { IMAGE_STYLE_OPTIONS } from "@/lib/constants/common";
import { appearanceApi } from "@/services/api";
import type { ImageStyleMap, ImageStyleSection } from "@/types/common";

interface ImageStyleCardProps {
  section: ImageStyleSection;
  description: string;
  /** The whole stored map — Appearance writes it whole, so the other sections'
   *  styles have to travel with this one. */
  styles: ImageStyleMap;
  onChange: (styles: ImageStyleMap) => void;
}

/** Border, corners, black & white and hover caption for one image-led section,
 *  honoured by every layout of it. Saved to Appearance on its own. */
const ImageStyleCard = ({
  section,
  description,
  styles,
  onChange,
}: ImageStyleCardProps) => {
  const [saving, setSaving] = useState<boolean>(false);
  const style = styles[section];

  const handleSave = async () => {
    let message = "Failed to save the image style";
    let isError = true;

    setSaving(true);

    try {
      const response = await appearanceApi.update({ imageStyles: styles });

      message = response.data?.message || message;

      if (response.data?.success) {
        isError = false;
        // Appearance answers without a message of its own.
        message = response.data.message || "Image style saved";
        onChange(response.data.data.imageStyles);
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
    <SectionCard title="Image Style" description={description}>
      <div className="divide-y divide-line rounded-lg border border-line px-4">
        {IMAGE_STYLE_OPTIONS.map(({ key, label, helper }) => (
          <label
            key={key}
            className="flex items-center justify-between gap-4 py-3"
          >
            <div className="min-w-0">
              <div className="text-sm font-semibold text-ink">{label}</div>
              <p className="mt-0.5 text-xs text-ink">{helper}</p>
            </div>
            <Switch
              checked={style[key]}
              onCheckedChange={(checked) =>
                onChange({ ...styles, [section]: { ...style, [key]: checked } })
              }
            />
          </label>
        ))}
      </div>
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="text-sm font-bold"
          size="sm"
          startIcon={
            saving ? (
              <Loader2 className="size-5 animate-spin" />
            ) : (
              <Save className="size-5" />
            )
          }
        >
          Save Changes
        </Button>
      </div>
    </SectionCard>
  );
};

export default ImageStyleCard;
