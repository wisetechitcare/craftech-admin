import { useEffect, useState } from "react";
import { isAxiosError } from "axios";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";

import { PageHeader } from "@/components/common";
import ProjectFieldsCard from "./ProjectFieldsCard";

import {
  PROJECT_CARD_FIELD_LIMIT,
  PROJECT_FIELD_LABEL_MAX,
  PROJECT_FIELD_LIMIT,
} from "@/lib/constants/projects";
import { portfolioSectionApi } from "@/services/api";
import { ProjectFieldType, type ProjectFieldDefinition } from "@/types/project";

const FIELD_OPTION_LIMIT = 50;
const FIELD_OPTION_MAX = 80;

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
          field.key === "tags" && field.type === ProjectFieldType.MULTI_SELECT
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
        (field.options?.length ?? 0) > FIELD_OPTION_LIMIT ||
        field.options?.some(
          (option) => !option.trim() || option.length > FIELD_OPTION_MAX,
        ),
    )
  ) {
    return `Fields can have up to ${FIELD_OPTION_LIMIT} options of ${FIELD_OPTION_MAX} characters each`;
  }
  if (
    fields.filter((field) => field.enabled && field.showOnCard).length >
    PROJECT_CARD_FIELD_LIMIT
  ) {
    return `At most ${PROJECT_CARD_FIELD_LIMIT} fields can be shown on project cards`;
  }
  return null;
};

export default function ProjectFieldsManager() {
  const [fields, setFields] = useState<ProjectFieldDefinition[]>([]);
  const [savedFields, setSavedFields] = useState<ProjectFieldDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
        setFields(loaded);
        setSavedFields(loaded);
      })
      .catch(() => toast.error("Failed to load project fields"))
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    const error = validationMessage(fields);
    if (error) {
      toast.error(error);
      return;
    }
    setSaving(true);
    try {
      const response = await portfolioSectionApi.updateFields(fields);
      const saved = response.data.data;
      setFields(saved);
      setSavedFields(saved);
      toast.success(response.data.message || "Project fields saved");
    } catch (error) {
      const message = isAxiosError<{ message?: string }>(error)
        ? error.response?.data?.message
        : undefined;
      toast.error(message || "Failed to save project fields");
    } finally {
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
    <div className="space-y-6">
      <PageHeader
        title="Project fields"
        description="Configure reusable project information without changing the Projects section copy."
      />
      <ProjectFieldsCard
        fields={fields}
        onChange={setFields}
        onSave={save}
        onDiscard={() => setFields(savedFields)}
        saving={saving}
        dirty={dirty}
      />
    </div>
  );
}
