import { useEffect, useMemo, useState } from "react";
import { isAxiosError } from "axios";
import toast from "react-hot-toast";
import { AlertCircle, Loader2, Save } from "lucide-react";

import LayoutVariantPicker from "@/components/admin/ui/LayoutVariantPicker";
import { PreviewSection } from "@/components/admin/ui/SitePreview";

import { appearanceApi } from "@/services/api";
import {
  type AppearanceResponse,
  type AppearanceUpdatePayload,
} from "@/types/appearance";
import { LayoutVariant } from "@/types/common";

export default function SiteIdentityNavigation() {
  const [data, setData] = useState<AppearanceResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);

  const draft = useMemo(
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
    let message = "Failed to load navigation style";
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

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!data) return;

    let message = "Failed to save navigation style";
    let isError = true;

    setSaving(true);

    const payload: AppearanceUpdatePayload = {
      navbarVariant: data.navbarVariant,
    };

    try {
      const response = await appearanceApi.update(payload);
      message = response.data?.message || message;

      if (response.data?.success) {
        isError = false;
        message = "Navigation style saved successfully";
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
          The navigation style applies globally on every page. Link labels and
          the call-to-action are edited on the Navbar content page.
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-paper border border-line rounded-xl p-6 space-y-8"
      >
        <LayoutVariantPicker
          label="Navigation Style"
          value={data?.navbarVariant ?? LayoutVariant.CLEAN_MODERN}
          section={PreviewSection.NAVBAR}
          draft={draft}
          onChange={(value) =>
            setData((prev) => (prev ? { ...prev, navbarVariant: value } : prev))
          }
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
                Save Navigation Style
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
