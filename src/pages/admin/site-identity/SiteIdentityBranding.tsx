import { useEffect, useMemo, useState } from "react";
import { isAxiosError } from "axios";
import toast from "react-hot-toast";
import { AlertCircle, Loader2, Save } from "lucide-react";

import BrandingTab from "@/components/admin/BrandingTab";

import { cmsApi } from "@/services/api";

const BRANDING_FIELDS = [
  "logoUrl",
  "faviconUrl",
  "brandColor",
  "accentColor",
  "brandPalette",
  "themeColors",
] as const;

type BrandingField = (typeof BRANDING_FIELDS)[number];

type BrandingSettings = Partial<Record<BrandingField, unknown>>;

export default function SiteIdentityBranding() {
  const [data, setRawData] = useState<BrandingSettings | null>(null);
  const [saved, setSaved] = useState<BrandingSettings | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);

  const setData = (next: BrandingSettings) => {
    setRawData(next);
  };

  const changes = useMemo(() => {
    if (!data || !saved) return {};
    return Object.fromEntries(
      BRANDING_FIELDS.filter(
        (key) => JSON.stringify(data[key]) !== JSON.stringify(saved[key]),
      ).map((key) => [key, data[key]]),
    );
  }, [data, saved]);

  const changeCount = Object.keys(changes).length;

  useEffect(() => {
    fetchBranding();
  }, []);

  const fetchBranding = async () => {
    let message = "Failed to load branding";
    let isError = true;

    try {
      const response = await cmsApi.getSettings();
      message = response.data?.message || message;

      if (response.data?.success) {
        isError = false;
        const settings = response.data.data as BrandingSettings;
        setRawData(settings);
        setSaved(settings);
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

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!changeCount) return;

    let message = "Failed to save branding";
    let isError = true;

    setSaving(true);

    try {
      const response = await cmsApi.updateSettings(changes);
      message = response.data?.message || message;

      if (response.data?.success) {
        isError = false;
        const settings = response.data.data as BrandingSettings;
        setRawData(settings);
        setSaved(settings);
        message = "Branding saved successfully";
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

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-ink-faint" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3 p-4 bg-info/10 border border-info/50 rounded-lg">
        <AlertCircle className="w-5 h-5 text-info shrink-0 mt-0.5" />
        <div className="text-sm text-info">
          Logo, palette, and theme colours apply site-wide. Changes reflect on
          the live website immediately without a redeploy.
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-paper border border-line rounded-xl p-6 space-y-6"
      >
        <BrandingTab data={data} setData={setData} />

        <div className="flex justify-end gap-3 pt-6 border-t border-line">
          <button
            type="button"
            onClick={() => fetchBranding()}
            className="px-6 py-2 text-ink border border-line rounded-lg font-bold text-sm hover:bg-paper transition-colors"
          >
            Reset
          </button>
          <button
            type="submit"
            disabled={saving || !changeCount}
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
                Save Branding
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
