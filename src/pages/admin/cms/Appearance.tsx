import React, { useEffect, useMemo, useState } from "react";
import { isAxiosError } from "axios";
import toast from "react-hot-toast";
import { AlertCircle, Loader2, Save } from "lucide-react";

import SitePreview, {
  PreviewSection,
  type PreviewDraft,
} from "@/components/admin/ui/SitePreview";

import { appearanceApi } from "../../../services/api";
import {
  type AppearanceResponse,
  type LayoutVariant,
} from "../../../types/appearance";
import { cn } from "../../../utils/utils";

interface SectionHeaderProps {
  title: string;
  description?: string;
}

const SectionHeader = ({ title, description }: SectionHeaderProps) => (
  <div className="mb-6 pb-4 border-b border-line">
    <h3 className="text-lg font-bold text-ink mb-1">{title}</h3>
    {description && <p className="text-sm text-ink-mute">{description}</p>}
  </div>
);

// Must match the 3 variant keys in craftech-frontend-next's Navbar/HeroSection config.ts
const VARIANT_OPTIONS: { value: LayoutVariant; label: string }[] = [
  { value: "premium-glass", label: "Premium Glass" },
  { value: "clean-modern", label: "Clean Modern" },
  { value: "floating", label: "Floating" },
];

interface VariantPickerProps {
  label: string;
  value: LayoutVariant;
  /** Which section of the website this picker restyles, previewed below it. */
  section: PreviewSection;
  /** The pending selections for all three pickers, so the preview renders the
   *  choice being made rather than the one last saved. */
  draft: PreviewDraft;
  previewHeight?: number;
  onChange: (value: LayoutVariant) => void;
}

const VariantPicker = ({
  label,
  value,
  section,
  draft,
  previewHeight,
  onChange,
}: VariantPickerProps) => (
  <div className="space-y-3">
    <label className="block text-xs font-semibold text-ink-mute uppercase tracking-wider">
      {label}
    </label>
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {VARIANT_OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            "p-3 rounded-lg border-2 text-sm font-semibold text-ink transition-colors",
            value === opt.value
              ? "border-info bg-info/10"
              : "border-line bg-raise hover:border-info/50",
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
    <SitePreview
      section={section}
      draft={draft}
      viewportHeight={previewHeight}
    />
  </div>
);

export default function Appearance() {
  const [data, setData] = useState<AppearanceResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);

  // One object for all three previews, memoised so the panels are not re-posted
  // on every unrelated render. The navbar preview draws over the hero, so it
  // needs the pending hero choice too.
  const draft: PreviewDraft = useMemo(
    () => ({
      appearance: {
        navbarVariant: data?.navbarVariant,
        heroVariant: data?.heroVariant,
        aboutVariant: data?.aboutVariant,
      },
    }),
    [data?.navbarVariant, data?.heroVariant, data?.aboutVariant],
  );

  useEffect(() => {
    fetchAppearance();
  }, []);

  const fetchAppearance = async () => {
    let message = "Failed to load appearance";
    let isError = true;

    try {
      const response = await appearanceApi.get();

      message = response.data?.message || message;

      if (response.data?.success) {
        isError = false;
        setData(response.data.data);
      }
    } catch (error) {
      if (isAxiosError(error)) {
        message = error.response?.data?.message || message;
      }
    } finally {
      if (isError) {
        toast.error(message);
      }

      setLoading(false);
    }
  };

  const patch = (changes: Partial<AppearanceResponse>) =>
    setData((prev) => (prev ? { ...prev, ...changes } : prev));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data) return;

    let message = "Failed to save appearance";
    let isError = true;

    setSaving(true);

    try {
      // Only the three fields this form edits. It used to PUT back the whole
      // record it fetched, which quietly re-wrote `visibility` from a copy that
      // could be minutes stale — leaving this page open while someone hid a
      // section in About CMS, then saving a variant here, silently unhid it.
      // The header's own content and switches belong to the Navbar page for the
      // same reason.
      const response = await appearanceApi.update({
        navbarVariant: data.navbarVariant,
        heroVariant: data.heroVariant,
        aboutVariant: data.aboutVariant,
      });

      message = response.data?.message || message;

      if (response.data?.success) {
        isError = false;
        message = "Appearance saved successfully";
        // Trust the server's copy over local state, so what the form shows
        // after a save is what was actually stored.
        setData(response.data.data);
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

  if (loading)
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-ink-faint" />
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3 p-4 bg-info/10 border border-info/50 rounded-lg">
        <AlertCircle className="w-5 h-5 text-info flex-shrink-0 mt-0.5" />
        <div className="text-sm text-info">
          Controls which Navbar, Hero, and About style renders on the live site.
          The header's own links and button are set on the Navbar page, and
          which sections a page draws in that page's own CMS. Updates reflect
          immediately (no redeploy needed).
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-ink">Appearance</h2>
        <p className="text-sm text-ink-mute mt-1">
          Choose the layout variants used across the website
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-paper border border-line rounded-xl p-6 space-y-8"
      >
        <SectionHeader
          title="Website Layout"
          description="Choose which Navbar and Hero style renders on the live site"
        />
        <VariantPicker
          label="Navbar Style"
          value={data?.navbarVariant || "clean-modern"}
          section={PreviewSection.NAVBAR}
          draft={draft}
          onChange={(v) => patch({ navbarVariant: v })}
        />
        <VariantPicker
          label="Hero Style"
          value={data?.heroVariant || "floating"}
          section={PreviewSection.HERO}
          draft={draft}
          onChange={(v) => patch({ heroVariant: v })}
        />
        <VariantPicker
          label="About Style"
          value={data?.aboutVariant || "clean-modern"}
          section={PreviewSection.ABOUT}
          draft={draft}
          previewHeight={1400}
          onChange={(v) => patch({ aboutVariant: v })}
        />

        <div className="flex justify-end gap-3 pt-6 border-t border-line">
          <button
            type="button"
            onClick={() => fetchAppearance()}
            className="px-6 py-2 text-ink border border-line rounded-lg font-bold text-sm hover:bg-paper transition-colors"
          >
            Reset
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-info text-white rounded-lg font-bold text-sm hover:bg-info disabled:opacity-50 flex items-center gap-2 transition-colors"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Appearance
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
