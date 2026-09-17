import React, { useEffect, useMemo, useState } from "react";
import { isAxiosError } from "axios";
import toast from "react-hot-toast";
import { AlertCircle, Loader2, Save } from "lucide-react";

import {
  AdvancedTab,
  ContactLocationTab,
  GeneralTab,
  SeoTab,
  SocialLinksTab,
} from "@/components/admin/settings";
import { AdminInfoCallout } from "@/components/common";

import { cn } from "@/utils/utils";
import {
  SETTINGS_TABS,
  SETTINGS_TAB_FIELDS,
  SettingsTab,
} from "@/lib/constants/settings";
import { cmsApi } from "@/services/api";
import type { SettingsTabProps, SiteSettings } from "@/types/settings";

const TAB_CONTENT: Record<
  SettingsTab,
  React.ComponentType<SettingsTabProps>
> = {
  [SettingsTab.GENERAL]: GeneralTab,
  [SettingsTab.CONTACT]: ContactLocationTab,
  [SettingsTab.SOCIAL]: SocialLinksTab,
  [SettingsTab.SEO]: SeoTab,
  [SettingsTab.ADVANCED]: AdvancedTab,
};

const tabOfField = (field: string) =>
  SETTINGS_TABS.find(({ id }) =>
    SETTINGS_TAB_FIELDS[id].some((key) => field.split(".")[0] === key),
  );

const humanize = (field: string) =>
  field
    .split(".")
    .map((part) =>
      part
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (c) => c.toUpperCase())
        .trim(),
    )
    .join(" → ");

export default function Settings() {
  const [data, setData] = useState<SiteSettings | null>(null);
  const [saved, setSaved] = useState<SiteSettings | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<SettingsTab>(SettingsTab.GENERAL);

  // Only what the admin actually changed, and only fields this page owns.
  // PUTting the whole record re-validated every field, so one bad legacy value
  // blocked saving any tab.
  const changes = useMemo<Partial<SiteSettings>>(() => {
    if (!data || !saved) return {};
    return Object.fromEntries(
      Object.values(SETTINGS_TAB_FIELDS)
        .flat()
        .filter(
          (key) => JSON.stringify(data[key]) !== JSON.stringify(saved[key]),
        )
        .map((key) => [key, data[key]]),
    );
  }, [data, saved]);
  const changedFields = Object.keys(changes);
  const changeCount = changedFields.length;

  useEffect(() => {
    if (!changeCount) return;
    const warnBeforeLeaving = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warnBeforeLeaving);
    return () => window.removeEventListener("beforeunload", warnBeforeLeaving);
  }, [changeCount]);

  const adopt = (settings: SiteSettings) => {
    setData(settings);
    setSaved(settings);
    setFieldErrors({});
  };

  const fetchSettings = async () => {
    let message = "Failed to load settings";
    let isError = true;

    try {
      const response = await cmsApi.getSettings();
      message = response.data?.message || message;

      if (response.data?.success) {
        isError = false;
        adopt(response.data.data as SiteSettings);
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

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!changeCount) return;

    let message = "Failed to save settings";
    let isError = true;

    setSaving(true);
    setFieldErrors({});

    try {
      const response = await cmsApi.updateSettings(changes);
      message = response.data?.message || message;

      if (response.data?.success) {
        isError = false;
        adopt(response.data.data as SiteSettings);
        message = "Settings saved";
      }
    } catch (error) {
      if (isAxiosError(error)) {
        message = error.response?.data?.message || message;
        setFieldErrors(error.response?.data?.fields || {});
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

  // The failed load already raised a toast.
  if (!data) return null;

  const patch = (next: Partial<SiteSettings>) => setData({ ...data, ...next });
  const TabContent = TAB_CONTENT[activeTab];
  const flaggedTabs = new Set(
    [...changedFields, ...Object.keys(fieldErrors)].map(
      (field) => tabOfField(field)?.id,
    ),
  );

  return (
    <div className="space-y-6">
      <AdminInfoCallout description="These details are used across the whole website. Changes show on the next page load; page titles and search settings can take up to a minute." />

      <div>
        <h2 className="text-2xl font-bold text-ink">Global Settings</h2>
        <p className="text-sm text-ink-mute mt-1">
          Site-wide details every page reads from one place. Section content,
          buttons and layout are edited on their own pages.
        </p>
      </div>

      <div className="flex gap-2 border-b border-line overflow-x-auto pb-2">
        {SETTINGS_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "px-4 py-2 text-sm font-semibold uppercase tracking-wider whitespace-nowrap transition-colors",
              activeTab === tab.id
                ? "text-ink border-b-2 border-info"
                : "text-ink-mute hover:text-ink-soft",
            )}
          >
            {tab.label}
            {flaggedTabs.has(tab.id) && (
              <span className="ml-1.5 inline-block w-1.5 h-1.5 rounded-full bg-warn align-middle" />
            )}
          </button>
        ))}
      </div>

      {Object.keys(fieldErrors).length > 0 && (
        <div className="flex items-start gap-3 p-4 bg-danger/10 border border-danger/40 rounded-lg">
          <AlertCircle className="w-5 h-5 text-danger shrink-0 mt-0.5" />
          <div className="text-sm text-danger space-y-1">
            <p className="font-bold">Nothing was saved. Fix these first:</p>
            <ul className="space-y-0.5">
              {Object.entries(fieldErrors).map(([field, message]) => (
                <li key={field}>
                  <span className="font-semibold">
                    {tabOfField(field)?.label} · {humanize(field)}
                  </span>{" "}
                  &mdash; {message}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <TabContent data={data} errors={fieldErrors} patch={patch} />

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => saved && adopt(saved)}
            disabled={!changeCount}
            className="px-6 py-2 text-ink border border-line rounded-lg font-bold text-sm hover:bg-paper transition-colors disabled:opacity-50"
          >
            Discard changes
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
                {changeCount
                  ? `Save ${changeCount} change${changeCount > 1 ? "s" : ""}`
                  : "Saved"}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
