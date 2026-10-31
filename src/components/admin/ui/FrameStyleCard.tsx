import { useState } from "react";
import { isAxiosError } from "axios";
import toast from "react-hot-toast";
import { Loader2, Save } from "lucide-react";

import ConfirmModal from "@/components/admin/ui/ConfirmModal";
import SwitchOptionsCard from "@/components/admin/ui/SwitchOptionsCard";
import { Button } from "@/components/ui/button";

import { FRAME_STYLE_OPTIONS } from "@/lib/constants/appearance";
import { appearanceApi } from "@/services/api";
import type { FrameStyle } from "@/types/appearance";

interface FrameStyleCardProps {
  frame: FrameStyle;
  onChange: (frame: FrameStyle) => void;
}

/** The site-wide Border / Rounded corners switches; saving asks first, since
 *  the change reaches every page, not only the section it is edited from. */
const FrameStyleCard = ({ frame, onChange }: FrameStyleCardProps) => {
  const [confirming, setConfirming] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);

  const handleSave = async () => {
    let message = "Failed to save the border and corners";
    let isError = true;

    setConfirming(false);
    setSaving(true);

    try {
      const response = await appearanceApi.update(frame);

      message = response.data?.message || message;

      if (response.data?.success) {
        isError = false;
        message = response.data.message || "Border and corners saved";
        onChange({
          borders: response.data.data.borders,
          roundedCorners: response.data.data.roundedCorners,
        });
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
    <>
      <SwitchOptionsCard
        title="Border & Corners"
        description="Shared by the whole website. The preview shows a change before you save it."
        rows={FRAME_STYLE_OPTIONS.map(({ key, label, helper }) => ({
          key,
          label,
          helper,
          checked: frame[key],
          onCheckedChange: (checked) => onChange({ ...frame, [key]: checked }),
        }))}
        actions={
          <Button
            onClick={() => setConfirming(true)}
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

      <ConfirmModal
        open={confirming}
        danger={false}
        title="Apply to the whole website?"
        message="Border and rounded corners will apply to your entire website."
        confirmLabel="Apply"
        onConfirm={handleSave}
        onCancel={() => setConfirming(false)}
      />
    </>
  );
};

export default FrameStyleCard;
