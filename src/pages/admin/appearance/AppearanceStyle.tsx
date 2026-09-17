import React, { useEffect, useState } from "react";
import { isAxiosError } from "axios";
import toast from "react-hot-toast";
import { Loader2, Save } from "lucide-react";

import LayoutVariantPicker from "@/components/admin/ui/LayoutVariantPicker";
import PreviewPanel from "@/components/admin/ui/PreviewPanel";
import type { PreviewSection } from "@/components/admin/ui/SitePreview";
import { AdminInfoCallout } from "@/components/common";

import { appearanceApi } from "@/services/api";
import type { AppearanceUpdatePayload } from "@/types/appearance";
import type { LayoutVariant } from "@/types/common";

type StyleField =
  "navbarVariant" | "heroVariant" | "aboutVariant" | "faqVariant";

interface AppearanceStyleProps {
  field: StyleField;
  /** e.g. "Hero Style". */
  label: string;
  section: PreviewSection;
  viewportHeight?: number;
  note?: string;
}

/** One section's style: three layouts to pick from, drawn live by the site. */
export default function AppearanceStyle({
  field,
  label,
  section,
  viewportHeight,
  note,
}: AppearanceStyleProps) {
  const [value, setValue] = useState<LayoutVariant | null>(null);
  const [saving, setSaving] = useState<boolean>(false);

  useEffect(() => {
    appearanceApi
      .get()
      .then(({ data }) => data?.success && setValue(data.data[field]))
      .catch(() => toast.error(`Failed to load the ${label.toLowerCase()}`));
  }, [field, label]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!value) return;

    let message = `Failed to save the ${label.toLowerCase()}`;
    let isError = true;

    setSaving(true);

    try {
      const payload: AppearanceUpdatePayload = { [field]: value };
      const response = await appearanceApi.update(payload);

      message = response.data?.message || message;

      if (response.data?.success) {
        isError = false;
        // The Appearance PUT answers with the record and no message.
        message = response.data.message || `${label} saved`;
        setValue(response.data.data[field]);
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

  if (!value) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-ink-faint" />
      </div>
    );
  }

  return (
    <PreviewPanel
      section={section}
      draft={{ appearance: { [field]: value } }}
      viewportHeight={viewportHeight}
    >
      {note && <AdminInfoCallout description={note} />}

      <form
        onSubmit={handleSubmit}
        className="bg-paper border border-line rounded-xl p-6 space-y-6"
      >
        <LayoutVariantPicker label={label} value={value} onChange={setValue} />

        <div className="flex justify-end pt-6 border-t border-line">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-info text-white rounded-lg font-bold text-sm hover:bg-info disabled:opacity-50 flex items-center gap-2 transition-colors"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save {label}
          </button>
        </div>
      </form>
    </PreviewPanel>
  );
}
