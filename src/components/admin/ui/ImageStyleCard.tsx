import { useState } from "react";
import { isAxiosError } from "axios";
import toast from "react-hot-toast";
import { Loader2, Save } from "lucide-react";

import SwitchOptionsCard from "@/components/admin/ui/SwitchOptionsCard";
import {
  isVisible,
  type VisibilityMap,
  type VisibilitySection,
} from "@/components/admin/ui/VisibilityToggle";
import { Button } from "@/components/ui/button";

import { IMAGE_STYLE_OPTIONS } from "@/lib/constants/common";
import { updateAppearance } from "@/lib/utils/appearance";
import type {
  ImageStyleMap,
  ImageStyleOption,
  ImageStyleSection,
} from "@/types/common";

interface ImageStyleCardProps {
  section: ImageStyleSection;
  title?: string;
  description: string;
  styles: ImageStyleMap;
  onChange: (styles: ImageStyleMap) => void;
  /** Defaults to all switches; Clients passes B&W only. */
  options?: ImageStyleOption[];
  /** Show/hide switches listed after the style ones and saved with them
   *  (Projects passes the /projects search bar and category tabs). */
  visibilityOptions?: VisibilitySection[];
  visibility?: VisibilityMap;
  onVisibilityChange?: (visibility: VisibilityMap) => void;
}

const ImageStyleCard = ({
  section,
  title = "Image Style",
  description,
  styles,
  onChange,
  options = IMAGE_STYLE_OPTIONS,
  visibilityOptions = [],
  visibility = {},
  onVisibilityChange,
}: ImageStyleCardProps) => {
  const [saving, setSaving] = useState<boolean>(false);
  const style = styles[section];

  const handleSave = async () => {
    let message = "Failed to save the image style";
    let isError = true;

    setSaving(true);

    try {
      const response = await updateAppearance({
        imageStyles: styles,
        ...(visibilityOptions.length
          ? {
              visibility: Object.fromEntries(
                visibilityOptions.map(({ key }) => [
                  key,
                  isVisible(visibility, key),
                ]),
              ),
            }
          : {}),
      });

      message = response.data?.message || message;

      if (response.data?.success) {
        isError = false;
        message = response.data.message || "Image style saved";
        onChange(response.data.data.imageStyles);
        onVisibilityChange?.(response.data.data.visibility ?? {});
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
    <SwitchOptionsCard
      title={title}
      description={description}
      rows={[
        ...options.map(({ key, label, helper }) => ({
          key,
          label,
          helper,
          checked: style[key],
          onCheckedChange: (checked: boolean) =>
            onChange({ ...styles, [section]: { ...style, [key]: checked } }),
        })),
        ...visibilityOptions.map(({ key, label, helper }) => ({
          key,
          label,
          helper: helper ?? "",
          checked: isVisible(visibility, key),
          onCheckedChange: (checked: boolean) =>
            onVisibilityChange?.({ ...visibility, [key]: checked }),
        })),
      ]}
      actions={
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
      }
    />
  );
};

export default ImageStyleCard;
