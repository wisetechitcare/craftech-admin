import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { isAxiosError } from "axios";
import toast from "react-hot-toast";
import { Loader2, Palette } from "lucide-react";

import ContactSectionContentCard from "@/components/admin/contact/ContactSectionContentCard";
import PreviewPanel from "@/components/admin/ui/PreviewPanel";
import { PreviewSection } from "@/components/admin/ui/SitePreview";
import {
  SectionVisibilitySwitch,
  isVisible,
  type VisibilityMap,
  type VisibilitySection,
} from "@/components/admin/ui/VisibilityToggle";
import { AdminInfoCallout, PageHeader } from "@/components/common";

import { HOME_VISIBILITY_GROUP } from "@/lib/constants/hero";
import { CONTACT_VISIBILITY_KEY } from "@/lib/constants/contact";
import { appearanceApi, contactApi } from "@/services/api";
import {
  EMPTY_CONTACT_SECTION,
  type ContactSectionContent,
} from "@/types/contact";

export default function ContactCMS() {
  const [content, setContent] = useState<ContactSectionContent>(
    EMPTY_CONTACT_SECTION,
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [visibility, setVisibility] = useState<VisibilityMap>({});
  const [sections, setSections] = useState<VisibilitySection[]>([]);

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

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="size-8 animate-spin text-ink-faint" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Contact CMS"
        description="Section heading, form labels and how submissions are sent. Channel details (email, phone, map, social) are edited under Global Settings."
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
        icon={Palette}
        description="Which Contact layout is shown is set under Appearance → Contact."
        action={
          <Link
            to="/admin/appearance/contact"
            className="text-xs font-bold text-info underline underline-offset-2"
          >
            Change in Appearance
          </Link>
        }
      />

      <AdminInfoCallout
        description={
          <>
            Phone, email, address, map embed and social URLs are not duplicated
            here — they come from{" "}
            <Link to="/admin/settings" className="font-semibold underline">
              Global Settings → Contact &amp; Location
            </Link>
            .
          </>
        }
      />

      <PreviewPanel
        section={PreviewSection.CONTACT}
        placement="above"
        draft={{
          contactContent: { section: content },
          appearance: { visibility },
        }}
        caption="The live Contact section from what is on this page. Nothing is saved until you press Save."
        sectionHidden={!sectionVisible}
        onShowSection={() => patchVisibility(CONTACT_VISIBILITY_KEY, true)}
      >
        <ContactSectionContentCard
          content={content}
          onChange={setContent}
          visibility={visibility}
          onVisibilityChange={setVisibility}
        />
      </PreviewPanel>
    </div>
  );
}
