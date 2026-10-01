import { useState } from "react";
import { isAxiosError } from "axios";
import toast from "react-hot-toast";
import { Loader2, Save } from "lucide-react";

import SwitchOptionsCard from "@/components/admin/ui/SwitchOptionsCard";
import { Button } from "@/components/ui/button";

import { IMAGE_STYLE_OPTIONS } from "@/lib/constants/common";
import { appearanceApi } from "@/services/api";
import type { ImageStyleMap, ImageStyleSection } from "@/types/common";

interface ImageStyleCardProps {
  section: ImageStyleSection;
  description: string;
  styles: ImageStyleMap;
  onChange: (styles: ImageStyleMap) => void;
}

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
    <SwitchOptionsCard
      title="Image Style"
      description={description}
      rows={IMAGE_STYLE_OPTIONS.map(({ key, label, helper }) => ({
        key,
        label,
        helper,
        checked: style[key],
        onCheckedChange: (checked) =>
          onChange({ ...styles, [section]: { ...style, [key]: checked } }),
      }))}
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
