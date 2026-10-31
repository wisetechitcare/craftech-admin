import { useEffect, useState } from "react";
import { isAxiosError } from "axios";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";

import ProjectFieldsCard from "./ProjectFieldsCard";

import {
  PROJECT_CARD_FIELD_LIMIT,
  PROJECT_FIELD_LABEL_MAX,
  PROJECT_FIELD_LIMIT,
  PROJECT_FIELD_OPTION_LIMIT,
  PROJECT_FIELD_OPTION_MAX,
  PROJECT_TAGS_FIELD_KEY,
} from "@/lib/constants/projects";
import { newProjectField, usesCardSlot } from "@/lib/utils/projects";
import { portfolioSectionApi } from "@/services/api";
import { ProjectFieldType, type ProjectFieldDefinition } from "@/types/project";

const validationMessage = (fields: ProjectFieldDefinition[]): string | null => {
  if (fields.length > PROJECT_FIELD_LIMIT) {
    return `A website can configure at most ${PROJECT_FIELD_LIMIT} project fields`;
  }
  const labels = fields.map((field) => field.label.trim().toLowerCase());
  if (
    labels.some((label) => !label || label.length > PROJECT_FIELD_LABEL_MAX)
  ) {
    return `Field labels must be 1-${PROJECT_FIELD_LABEL_MAX} characters`;
  }
  if (new Set(labels).size !== labels.length) {
    return "Field labels must be unique";
  }
  if (
    fields.some(
      (field) =>
        [ProjectFieldType.SELECT, ProjectFieldType.MULTI_SELECT].includes(
          field.type,
        ) &&
        !(
          field.key === PROJECT_TAGS_FIELD_KEY &&
          field.type === ProjectFieldType.MULTI_SELECT
        ) &&
        !field.options?.length,
    )
  ) {
    return "Select fields need at least one option";
  }
  if (
    fields.some((field) => {
      const options = field.options?.map((option) => option.toLowerCase());
      return options && new Set(options).size !== options.length;
    })
  ) {
    return "Field options must be unique";
  }
  if (
    fields.some(
      (field) =>
        (field.options?.length ?? 0) > PROJECT_FIELD_OPTION_LIMIT ||
        field.options?.some(
          (option) =>
            !option.trim() || option.length > PROJECT_FIELD_OPTION_MAX,
        ),
    )
  ) {
    return `Fields can have up to ${PROJECT_FIELD_OPTION_LIMIT} options of ${PROJECT_FIELD_OPTION_MAX} characters each`;
  }
  if (fields.filter(usesCardSlot).length > PROJECT_CARD_FIELD_LIMIT) {
    return `At most ${PROJECT_CARD_FIELD_LIMIT} text fields can be shown on project cards`;
  }
  return null;
};

interface ProjectFieldsManagerProps {
  /** Opens with a blank field expanded (the project form's Add field). */
  startWithNewField?: boolean;
  onSaved?: (fields: ProjectFieldDefinition[]) => void;
}

export default function ProjectFieldsManager({
  startWithNewField = false,
  onSaved,
}: ProjectFieldsManagerProps) {
  const [fields, setFields] = useState<ProjectFieldDefinition[]>([]);
  const [savedFields, setSavedFields] = useState<ProjectFieldDefinition[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const dirty = JSON.stringify(fields) !== JSON.stringify(savedFields);

  useEffect(() => {
    portfolioSectionApi
      .getSection()
      .then((response) => {
        const loaded = (response.data.data.fields ?? []).map((field) =>
          field.showOnCard || field.showOnDetail
            ? field
            : { ...field, showOnDetail: true },
        );
        setSavedFields(loaded);
        setFields(
          startWithNewField && loaded.length < PROJECT_FIELD_LIMIT
            ? [...loaded, newProjectField(loaded.length)]
            : loaded,
        );
      })
      .catch(() => toast.error("Failed to load project fields"))
      .finally(() => setLoading(false));
  }, [startWithNewField]);

  const save = async () => {
    const error = validationMessage(fields);
    if (error) {
      toast.error(error);
      return;
    }
    let message = "Failed to save project fields";
    let isError = true;
    setSaving(true);

    try {
      const response = await portfolioSectionApi.updateFields(fields);

      message = response.data?.message || message;

      if (response.data?.success) {
        isError = false;
        setFields(response.data.data);
        setSavedFields(response.data.data);
        onSaved?.(response.data.data);
      }
    } catch (error) {
      if (isAxiosError<{ message?: string }>(error)) {
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
      <div className="flex justify-center py-10">
        <Loader2 className="size-6 animate-spin text-brand" />
      </div>
    );
  }

  return (
    <ProjectFieldsCard
      fields={fields}
      onChange={setFields}
      onSave={save}
      onDiscard={() => setFields(savedFields)}
      saving={saving}
      dirty={dirty}
      defaultOpenKey={startWithNewField ? fields.at(-1)?.key : undefined}
    />
  );
}
