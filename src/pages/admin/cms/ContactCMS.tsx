import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { isAxiosError } from "axios";
import toast from "react-hot-toast";
import { Loader2, Save } from "lucide-react";

import ContactSectionContentCard from "@/components/admin/contact/ContactSectionContentCard";
import {
  ContactLocationTab,
  SocialLinksTab,
} from "@/components/admin/settings";
import PreviewPanel from "@/components/admin/ui/PreviewPanel";
import { PreviewSection } from "@/components/admin/ui/SitePreview";
import {
  SectionVisibilitySwitch,
  isVisible,
  type VisibilityMap,
  type VisibilitySection,
} from "@/components/admin/ui/VisibilityToggle";
import { AdminInfoCallout, PageHeader } from "@/components/common";
import { Button } from "@/components/ui/button";

import { useSettingsDraft } from "@/hooks";
import { HOME_VISIBILITY_GROUP } from "@/lib/constants/hero";
import { CONTACT_VISIBILITY_KEY } from "@/lib/constants/contact";
import { SETTINGS_TAB_FIELDS, SettingsTab } from "@/lib/constants/settings";
import { appearanceApi, cmsApi, contactApi } from "@/services/api";
import {
  EMPTY_CONTACT_SECTION,
  type ContactSectionContent,
} from "@/types/contact";
import type { SiteSettings } from "@/types/settings";

/** The Global Settings fields this page edits — the same row, not a copy. */
const CONTACT_SETTINGS_FIELDS = [
  ...SETTINGS_TAB_FIELDS[SettingsTab.CONTACT],
  ...SETTINGS_TAB_FIELDS[SettingsTab.SOCIAL],
];

export default function ContactCMS() {
  const [content, setContent] = useState<ContactSectionContent>(
    EMPTY_CONTACT_SECTION,
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [visibility, setVisibility] = useState<VisibilityMap>({});
  const [sections, setSections] = useState<VisibilitySection[]>([]);
  const {
    data: settings,
    changes,
    changedFields,
    fieldErrors,
    setFieldErrors,
    loading: settingsLoading,
    adopt,
    patch,
  } = useSettingsDraft(CONTACT_SETTINGS_FIELDS);

  useEffect(() => {
    const loadContent = async () => {
      let message = "Failed to load Contact section content";
      let isError = true;

      try {
        const response = await contactApi.getSection();

        if (response.data?.success) {
          isError = false;
          setContent(response.data.data);
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

    const loadVisibility = async () => {
      let message = "Failed to load section visibility";
      let isError = true;

      try {
        const response = await appearanceApi.get();
        message = response.data?.message || message;

        if (response.data?.success) {
          isError = false;
          const record = response.data.data;
          setVisibility(record.visibility ?? {});
          setSections(
            record.visibilityOptions?.find(
              (group) => group.key === HOME_VISIBILITY_GROUP,
            )?.sections ?? [],
          );
        }
      } catch (error) {
        if (isAxiosError(error)) {
          message = error.response?.data?.message || message;
        }
      } finally {
        if (isError) {
          toast.error(message);
        }
      }
    };

    void loadContent();
    void loadVisibility();
  }, []);

  const contactSection = sections.find(
    (section) => section.key === CONTACT_VISIBILITY_KEY,
  );

  const sectionVisible = isVisible(visibility, CONTACT_VISIBILITY_KEY);

  const patchVisibility = (key: string, visible: boolean) =>
    setVisibility((prev) => ({ ...prev, [key]: visible }));

  // Section copy, then the shared contact details, then visibility. Each step
  // names what already saved, so a failure part-way never reads as success.
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    let message = "Failed to save the Contact section content";
    let isError = true;
    let sectionSaved = false;

    setSaving(true);
    setFieldErrors({});

    try {
      const response = await contactApi.updateSection(content);
      message = response.data?.message || message;

      if (response.data?.success) {
        sectionSaved = true;
        setContent(response.data.data);
        const saved = message;

        if (changedFields.length) {
          message =
            "Contact section saved, but the contact details and social links did not. Fix them and save again.";
          const settingsResponse = await cmsApi.updateSettings(changes);
          if (!settingsResponse.data?.success) return;
          adopt(settingsResponse.data.data as SiteSettings);
        }

        message =
          "Contact content saved, but what is shown and hidden did not. Try again.";
        const { data: appearance } = await appearanceApi.update({ visibility });
        setVisibility(appearance.data.visibility ?? {});

        isError = false;
        message = saved;
      }
    } catch (error) {
      if (isAxiosError(error)) {
        if (sectionSaved) {
          setFieldErrors(error.response?.data?.fields || {});
        } else {
          message = error.response?.data?.message || message;
        }
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

  if (loading || settingsLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="size-8 animate-spin text-ink-faint" />
      </div>
    );
  }

  const tabProps = settings && {
    data: settings,
    errors: fieldErrors,
    patch,
    visibility,
    patchVisibility,
    setVisibility,
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Contact CMS"
        description="Everything the Contact section shows: heading, form, contact details and social links."
        action={
          contactSection ? (
            <SectionVisibilitySwitch
              visible={sectionVisible}
              onChange={(visible) =>
                patchVisibility(CONTACT_VISIBILITY_KEY, visible)
              }
            />
          ) : undefined
        }
      />

      <AdminInfoCallout
        description={
          <>
            Contact information, addresses, the map and social links are shared
            with{" "}
            <Link to="/admin/settings" className="font-semibold underline">
              Global Settings → Contact &amp; Location
            </Link>
            . A change here changes them there, and everywhere they appear on
            the website.
          </>
        }
      />

      <PreviewPanel
        section={PreviewSection.CONTACT}
        placement="above"
        draft={{
          contactContent: { section: content },
          settings: settings ?? undefined,
          appearance: { visibility },
        }}
        caption="The live Contact section from what is on this page. Nothing is saved until you press Save."
        sectionHidden={!sectionVisible}
        onShowSection={() => patchVisibility(CONTACT_VISIBILITY_KEY, true)}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <ContactSectionContentCard
            content={content}
            onChange={setContent}
            visibility={visibility}
            onVisibilityChange={setVisibility}
          />

          {tabProps && (
            <>
              <ContactLocationTab {...tabProps} />
              <SocialLinksTab {...tabProps} />
            </>
          )}

          <div className="flex justify-end">
            <Button
              type="submit"
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
          </div>
        </form>
      </PreviewPanel>
    </div>
  );
}
