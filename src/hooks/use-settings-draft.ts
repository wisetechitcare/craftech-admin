import { useEffect, useMemo, useState } from "react";
import { isAxiosError } from "axios";
import toast from "react-hot-toast";

import { cmsApi } from "@/services/api";
import type { SiteSettings } from "@/types/settings";

/**
 * The Global Settings row as a page edits it. Only `fields` are compared and
 * sent back, so a page can never overwrite settings it does not show — Global
 * Settings and Contact CMS both write the same row this way. Pass a module
 * constant: the list is a memo dependency.
 */
export function useSettingsDraft(fields: readonly (keyof SiteSettings)[]) {
  const [data, setData] = useState<SiteSettings | null>(null);
  const [saved, setSaved] = useState<SiteSettings | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<boolean>(true);

  // Only what the admin actually changed. PUTting the whole record re-validated
  // every field, so one bad legacy value blocked saving anything.
  const changes = useMemo<Partial<SiteSettings>>(() => {
    if (!data || !saved) return {};
    return Object.fromEntries(
      fields
        .filter(
          (key) => JSON.stringify(data[key]) !== JSON.stringify(saved[key]),
        )
        .map((key) => [key, data[key]]),
    );
  }, [data, saved, fields]);

  const adopt = (settings: SiteSettings) => {
    setData(settings);
    setSaved(settings);
    setFieldErrors({});
  };

  useEffect(() => {
    const load = async () => {
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

    void load();
  }, []);

  return {
    data,
    changes,
    changedFields: Object.keys(changes),
    fieldErrors,
    setFieldErrors,
    loading,
    adopt,
    patch: (next: Partial<SiteSettings>) =>
      setData((current) => (current ? { ...current, ...next } : current)),
    discard: () => {
      if (saved) adopt(saved);
    },
  };
}
