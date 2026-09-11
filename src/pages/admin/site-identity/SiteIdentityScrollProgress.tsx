import { useEffect, useState } from "react";
import { isAxiosError } from "axios";
import toast from "react-hot-toast";
import { AlertCircle, Loader2, Save } from "lucide-react";

import ScrollProgressPreview from "@/components/admin/ui/ScrollProgressPreview";
import {
  VisibilityToggle,
  isVisible,
  type VisibilityMap,
} from "@/components/admin/ui/VisibilityToggle";

import { appearanceApi } from "@/services/api";

const SCROLL_PROGRESS_KEY = "site.scrollProgress";

export default function SiteIdentityScrollProgress() {
  const [visibility, setVisibility] = useState<VisibilityMap>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);

  useEffect(() => {
    fetchAppearance();
  }, []);

  const fetchAppearance = async () => {
    let message = "Failed to load scroll progress settings";
    let isError = true;

    try {
      const response = await appearanceApi.get();
      message = response.data?.message || message;

      if (response.data?.success) {
        isError = false;
        setVisibility(response.data.data.visibility ?? {});
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

    let message = "Failed to save scroll progress settings";
    let isError = true;

    setSaving(true);

    try {
      const response = await appearanceApi.update({ visibility });
      message = response.data?.message || message;

      if (response.data?.success) {
        isError = false;
        message = "Scroll progress settings saved successfully";
        setVisibility(response.data.data.visibility ?? {});
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
          The scroll progress bar appears below the navigation on every page.
          Turn it off to use the system default with no top progress indicator.
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-paper border border-line rounded-xl p-6 space-y-6"
      >
        <div className="flex items-start justify-between gap-4 pb-6 border-b border-line">
          <div>
            <h3 className="text-lg font-bold text-ink">Scroll Progress Bar</h3>
            <p className="text-sm text-ink-mute mt-1">
              Show or hide the scroll progress indicator across the live site.
            </p>
          </div>
          <VisibilityToggle
            visible={isVisible(visibility, SCROLL_PROGRESS_KEY)}
            onChange={(visible) =>
              setVisibility((prev) => ({
                ...prev,
                [SCROLL_PROGRESS_KEY]: visible,
              }))
            }
          />
        </div>

        <ScrollProgressPreview
          visible={isVisible(visibility, SCROLL_PROGRESS_KEY)}
        />

        <div className="flex justify-end gap-3">
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
                Save Scroll Progress
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
