import React, { useEffect, useState } from "react";
import { isAxiosError } from "axios";
import toast from "react-hot-toast";
import { Loader2, Save } from "lucide-react";

import ConfirmModal from "@/components/admin/ui/ConfirmModal";
import LayoutVariantPicker from "@/components/admin/ui/LayoutVariantPicker";
import PreviewPanel from "@/components/admin/ui/PreviewPanel";
import type { PreviewSection } from "@/components/admin/ui/SitePreview";
import { AdminInfoCallout } from "@/components/common";

import { LAYOUT_VARIANT_LABELS } from "@/lib/constants/appearance";
import { siteThemeOf, siteThemePayload } from "@/lib/utils/common";
import { appearanceApi } from "@/services/api";
import type { SectionVariantField } from "@/types/appearance";
import type { LayoutVariant } from "@/types/common";

interface AppearanceStyleProps {
  field: SectionVariantField;
  /** e.g. "Hero Style". */
  label: string;
  section: PreviewSection;
  viewportHeight?: number;
  note?: string;
}

const themeChangeMessage = (
  current: LayoutVariant | null,
  next: LayoutVariant,
) => {
  const nextLabel = LAYOUT_VARIANT_LABELS[next];
  const intro = current
    ? `Your website theme is currently ${LAYOUT_VARIANT_LABELS[current]}.`
    : "Your sections currently use different styles.";
  return `${intro} Saving ${nextLabel} here switches the whole website to ${nextLabel} — the navbar, hero, about page, gallery, FAQ and contact sections all follow it.`;
};

/** One section's style picker. Styles are shared: a save sets the theme for every section. */
export default function AppearanceStyle({
  field,
  label,
  section,
  viewportHeight,
  note,
}: AppearanceStyleProps) {
  const [value, setValue] = useState<LayoutVariant | null>(null);
  const [siteTheme, setSiteTheme] = useState<LayoutVariant | null>(null);
  const [confirming, setConfirming] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);

  useEffect(() => {
    appearanceApi
      .get()
      .then(({ data }) => {
        if (!data?.success) return;
        setValue(data.data[field]);
        setSiteTheme(siteThemeOf(data.data));
      })
      .catch(() => toast.error(`Failed to load the ${label.toLowerCase()}`));
  }, [field, label]);

  const save = async () => {
    if (!value) return;

    let message = `Failed to save the ${label.toLowerCase()}`;
    let isError = true;

    setConfirming(false);
    setSaving(true);

    try {
      const response = await appearanceApi.update(siteThemePayload(value));

      message = response.data?.message || message;

      if (response.data?.success) {
        isError = false;
        // The Appearance PUT answers with the record and no message.
        message =
          response.data.message ||
          `${LAYOUT_VARIANT_LABELS[value]} is now the theme for the whole website`;
        setValue(response.data.data[field]);
        setSiteTheme(siteThemeOf(response.data.data));
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

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (value !== siteTheme) {
      setConfirming(true);
      return;
    }
    save();
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
      <AdminInfoCallout description="One theme is shared by the whole website. Changing it here also changes every other section, and the Site Theme under Global → Site Identity." />
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

      <ConfirmModal
        open={confirming}
        danger={false}
        title="Change the theme of the whole website?"
        message={themeChangeMessage(siteTheme, value)}
        confirmLabel={`Apply ${LAYOUT_VARIANT_LABELS[value]} everywhere`}
        onConfirm={save}
        onCancel={() => setConfirming(false)}
      />
    </PreviewPanel>
  );
}
