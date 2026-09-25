import React, { useState } from "react";
import { isAxiosError, type AxiosResponse } from "axios";
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
import { Button } from "@/components/ui/button";

import { appearanceApi } from "@/services/api";
import type { SectionCopyField } from "@/types/common";
import { cn } from "@/utils/utils";

interface SectionContentCardProps<T extends { [K in keyof T]: string }> {
  /** The section's name in the card title and the toasts: "FAQ", "Gallery". */
  name: string;
  description: string;
  fields: SectionCopyField<T>[];
  content: T;
  onChange: (content: T) => void;
  onSave: (
    content: T,
  ) => Promise<AxiosResponse<{ success: boolean; message?: string; data: T }>>;
  /** The section's own visibility key; each field toggles `<key>.<field>`. */
  visibilityKey: string;
  /** The whole stored map — Appearance replaces it on write, so the other
   *  pages' flags have to travel with this one. */
  visibility: VisibilityMap;
  onVisibilityChange: (visibility: VisibilityMap) => void;
}

/** A homepage section's own copy, and whether each part of it is drawn. */
const SectionContentCard = <T extends { [K in keyof T]: string }>({
  name,
  description,
  fields,
  content,
  onChange,
  onSave,
  visibilityKey,
  visibility,
  onVisibilityChange,
}: SectionContentCardProps<T>) => {
  const [saving, setSaving] = useState<boolean>(false);

  const patch = (key: keyof T, value: string) =>
    onChange({ ...content, [key]: value });

  // A hidden section takes its parts with it, so their toggles disable.
  const sectionVisible = isVisible(visibility, visibilityKey);
  const fieldToggle = (part: string) => {
    const key = `${visibilityKey}.${part}`;
    return (
      <VisibilityToggle
        visible={sectionVisible && isVisible(visibility, key)}
        disabled={!sectionVisible}
        onChange={(visible) =>
          onVisibilityChange({ ...visibility, [key]: visible })
        }
      />
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let message = `Failed to save the ${name} section content`;
    let isError = true;

    setSaving(true);

    try {
      const response = await onSave(content);

      message = response.data?.message || message;

      if (response.data?.success) {
        onChange(response.data.data);

        // Visibility is Appearance's record, so it is its own request, sent on
        // every save the way the Hero page sends it.
        const saved = message;
        message = `${name} section saved, but its visibility did not. Try again.`;
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
      <SectionCard title={`${name} Section Content`} description={description}>
        {fields.map((field) => {
          const input = field.multiline ? (
            <TextArea
              label={field.label}
              value={content[field.key]}
              onChange={(e) => patch(field.key, e.target.value)}
              placeholder={field.placeholder}
              tooltip={field.tooltip}
              labelAction={fieldToggle(field.key)}
            />
          ) : (
            <InputField
              label={field.label}
              type={field.type}
              value={content[field.key]}
              onChange={(e) => patch(field.key, e.target.value)}
              placeholder={field.placeholder}
              labelAction={fieldToggle(field.key)}
            />
          );
          return (
            <div key={field.key} className={cn(field.narrow && "md:max-w-sm")}>
              {input}
            </div>
          );
        })}
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
      </SectionCard>
    </form>
  );
};

export default SectionContentCard;
