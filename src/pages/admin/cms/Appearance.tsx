import React, { useState, useEffect } from "react";
import { appearanceApi } from "../../../services/api";
import toast from "react-hot-toast";
import { Save, Loader2, AlertCircle } from "lucide-react";

const SectionHeader = ({ title, description }: any) => (
  <div className="mb-6 pb-4 border-b border-line">
    <h3 className="text-lg font-bold text-ink mb-1">{title}</h3>
    {description && <p className="text-sm text-ink-mute">{description}</p>}
  </div>
);

// Must match the 3 variant keys in craftech-frontend-next's Navbar/HeroSection config.ts
const VARIANT_OPTIONS = [
  { value: "premium-glass", label: "Premium Glass" },
  { value: "clean-modern", label: "Clean Modern" },
  { value: "floating", label: "Floating" },
];

const NavbarPreview = ({ variant }: { variant: string }) => {
  if (variant === "premium-glass")
    return (
      <div className="h-10 rounded-xl bg-ink flex items-center justify-between px-3">
        <div className="w-2 h-2 rounded-full bg-paper" />
        <div className="flex gap-1.5">
          <div className="w-4 h-1 rounded bg-paper/70" />
          <div className="w-4 h-1 rounded bg-paper/70" />
          <div className="w-4 h-1 rounded bg-paper/70" />
        </div>
        <div className="w-6 h-2.5 rounded-full bg-info" />
      </div>
    );
  if (variant === "clean-modern")
    return (
      <div className="h-10 bg-paper border-b-2 border-ink flex items-center justify-between px-3">
        <div className="w-3 h-3 rounded-sm bg-ink" />
        <div className="flex gap-1.5">
          <div className="w-4 h-1 rounded bg-ink-mute" />
          <div className="w-4 h-1 rounded bg-ink-mute" />
          <div className="w-4 h-1 rounded bg-ink-mute" />
        </div>
        <div className="w-6 h-2.5 rounded-sm bg-info" />
      </div>
    );
  return (
    <div className="h-10 flex items-center px-2 bg-raise">
      <div className="flex-1 h-6 rounded-full bg-paper border border-line shadow-sm flex items-center justify-between px-3">
        <div className="w-2 h-2 rounded-full bg-ink" />
        <div className="flex gap-1.5">
          <div className="w-3 h-1 rounded bg-ink-mute" />
          <div className="w-3 h-1 rounded bg-ink-mute" />
        </div>
        <div className="w-5 h-2 rounded-full bg-info" />
      </div>
    </div>
  );
};

const HeroPreview = ({ variant }: { variant: string }) => {
  if (variant === "premium-glass")
    return (
      <div className="h-20 rounded-lg bg-ink flex flex-col items-center justify-center gap-1.5">
        <div className="w-20 h-1.5 rounded bg-paper/80" />
        <div className="w-14 h-1.5 rounded bg-paper/60" />
        <div className="w-10 h-2.5 rounded-full bg-info mt-1" />
      </div>
    );
  if (variant === "clean-modern")
    return (
      <div className="h-20 rounded-lg overflow-hidden flex">
        <div className="flex-1 bg-paper border border-line flex flex-col items-start justify-center gap-1.5 px-3">
          <div className="w-14 h-1.5 rounded bg-ink" />
          <div className="w-10 h-1.5 rounded bg-ink-mute" />
          <div className="w-8 h-2.5 rounded-sm bg-info mt-1" />
        </div>
        <div className="flex-1 bg-raise" />
      </div>
    );
  return (
    <div className="h-20 rounded-lg bg-raise relative overflow-hidden">
      <div className="absolute left-2 bottom-2 w-24 h-10 rounded-lg bg-paper border border-line shadow-md p-2 flex flex-col justify-center gap-1">
        <div className="w-12 h-1.5 rounded bg-ink" />
        <div className="w-8 h-2 rounded-full bg-info mt-1" />
      </div>
    </div>
  );
};

const AboutPreview = ({ variant }: { variant: string }) => {
  if (variant === "premium-glass")
    return (
      <div className="h-20 rounded-lg bg-ink flex flex-col items-center justify-center gap-1.5">
        <div className="w-16 h-1.5 rounded bg-paper/80" />
        <div className="w-20 h-1.5 rounded bg-paper/60" />
        <div className="flex gap-2 mt-1.5">
          <div className="w-6 h-2 rounded bg-info" />
          <div className="w-6 h-2 rounded bg-info" />
        </div>
      </div>
    );
  if (variant === "clean-modern")
    return (
      <div className="h-20 rounded-lg bg-paper border border-line p-2.5 flex flex-col gap-1.5">
        <div className="w-14 h-1.5 rounded bg-ink" />
        <div className="flex gap-1">
          <div className="w-3.5 h-3.5 rounded bg-raise border border-line" />
          <div className="w-3.5 h-3.5 rounded bg-raise border border-line" />
          <div className="w-3.5 h-3.5 rounded bg-raise border border-line" />
          <div className="w-3.5 h-3.5 rounded bg-raise border border-line" />
        </div>
        <div className="w-10 h-2 rounded-sm bg-info mt-0.5" />
      </div>
    );
  return (
    <div className="h-20 rounded-lg bg-raise relative overflow-hidden p-2">
      <div className="absolute left-2 top-2 right-8 bottom-6 rounded-md bg-ink-faint/40" />
      <div className="absolute right-2 top-2 w-6 h-2.5 rounded-full bg-paper border border-line shadow-sm" />
      <div className="absolute left-2 bottom-2 w-10 h-2.5 rounded-full bg-paper border border-line shadow-sm" />
    </div>
  );
};

const VariantPicker = ({
  label,
  value,
  onChange,
  renderPreview,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  renderPreview: (variant: string) => React.ReactNode;
}) => (
  <div>
    <label className="block text-xs font-semibold text-ink-mute uppercase tracking-wider mb-2">
      {label}
    </label>
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {VARIANT_OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`text-left p-3 rounded-lg border-2 transition-colors ${
            value === opt.value
              ? "border-info bg-info/10"
              : "border-line bg-raise hover:border-info/50"
          }`}
        >
          {renderPreview(opt.value)}
          <div className="mt-2 text-sm font-semibold text-ink">{opt.label}</div>
        </button>
      ))}
    </div>
  </div>
);

export default function Appearance() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchAppearance();
  }, []);

  const fetchAppearance = async () => {
    try {
      const res = await appearanceApi.get();
      setData(res.data.data);
    } catch (err) {
      toast.error("Failed to load appearance");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await appearanceApi.update(data);
      toast.success("Appearance saved successfully");
    } catch (err) {
      toast.error("Failed to save appearance");
    } finally {
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
    <div className="max-w-5xl space-y-6">
      <div className="flex items-start gap-3 p-4 bg-info/10 border border-info/50 rounded-lg">
        <AlertCircle className="w-5 h-5 text-info flex-shrink-0 mt-0.5" />
        <div className="text-sm text-info">
          Controls which Navbar, Hero, and About style renders on the live site.
          Updates reflect immediately (no redeploy needed).
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
          onChange={(v) => setData({ ...data, navbarVariant: v })}
          renderPreview={(v) => <NavbarPreview variant={v} />}
        />
        <VariantPicker
          label="Hero Style"
          value={data?.heroVariant || "floating"}
          onChange={(v) => setData({ ...data, heroVariant: v })}
          renderPreview={(v) => <HeroPreview variant={v} />}
        />
        <VariantPicker
          label="About Style"
          value={data?.aboutVariant || "clean-modern"}
          onChange={(v) => setData({ ...data, aboutVariant: v })}
          renderPreview={(v) => <AboutPreview variant={v} />}
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
