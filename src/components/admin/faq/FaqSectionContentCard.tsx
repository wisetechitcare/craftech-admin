import React, { useState } from "react";
import { isAxiosError } from "axios";
import toast from "react-hot-toast";
import { Loader2, Save } from "lucide-react";

import InputField from "@/components/admin/ui/InputField";
import { SectionCard } from "@/components/admin/ui/SectionCard";
import TextArea from "@/components/admin/ui/TextArea";
import {
  VisibilityToggle,
  isVisible,
  type VisibilityMap,
} from "@/components/admin/ui/VisibilityToggle";

import { FAQ_SECTION_DEFAULTS } from "@/lib/constants/faq";
import { appearanceApi, faqApi } from "@/services/api";
import type { FaqSectionContent } from "@/types/faq";

const VISIBILITY_KEY = "home.faq";

interface FaqSectionContentCardProps {
  content: FaqSectionContent;
  onChange: (content: FaqSectionContent) => void;
  /** The whole stored map — Appearance replaces it on write, so the other
   *  pages' flags have to travel with this one. */
  visibility: VisibilityMap;
  onVisibilityChange: (visibility: VisibilityMap) => void;
}

/** The FAQ section's heading, supporting text and contact email — the copy
 *  every FAQ style draws above its questions — and whether it is drawn at all. */
const FaqSectionContentCard = ({
  content,
  onChange,
  visibility,
  onVisibilityChange,
}: FaqSectionContentCardProps) => {
  const [saving, setSaving] = useState<boolean>(false);

  const patch = (changes: Partial<FaqSectionContent>) =>
    onChange({ ...content, ...changes });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let message = "Failed to save the FAQ section content";
    let isError = true;

    setSaving(true);

    try {
      const response = await faqApi.updateSection(content);

      message = response.data?.message || message;

      if (response.data?.success) {
        onChange(response.data.data);

        // Visibility is Appearance's record, so it is its own request, sent on
        // every save the way the Hero page sends it.
        const saved = message;
        message = "FAQ section saved, but its visibility did not. Try again.";
        const { data: appearance } = await appearanceApi.update({ visibility });
        onVisibilityChange(appearance.data.visibility ?? {});

        isError = false;
        message = saved;
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

  return (
    <form onSubmit={handleSubmit}>
      <SectionCard
        title="FAQ Section Content"
        description="Shown above the questions in every FAQ style. Leave a field empty to keep the text shown as its placeholder. The switch hides the whole section; nothing is deleted."
        controls={
          <VisibilityToggle
            visible={isVisible(visibility, VISIBILITY_KEY)}
            onChange={(visible) =>
              onVisibilityChange({ ...visibility, [VISIBILITY_KEY]: visible })
            }
          />
        }
      >
        <InputField
          label="Title"
          value={content.title}
          onChange={(e) => patch({ title: e.target.value })}
          placeholder={FAQ_SECTION_DEFAULTS.title}
        />
        <TextArea
          label="Supporting text"
          value={content.description}
          onChange={(e) => patch({ description: e.target.value })}
          placeholder={FAQ_SECTION_DEFAULTS.description}
          tooltip="The contact email is added at the end of this text as a link."
        />
        <InputField
          className="md:max-w-sm"
          label="Contact email"
          type="email"
          value={content.email}
          onChange={(e) => patch({ email: e.target.value })}
          placeholder={FAQ_SECTION_DEFAULTS.email}
          hint="Only set this if FAQ questions should go to a different address than the site's email in Global Settings."
        />
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-info hover:bg-info text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save Changes
          </button>
        </div>
      </SectionCard>
    </form>
  );
};

export default FaqSectionContentCard;
