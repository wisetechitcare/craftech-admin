import RichTextField from "@/components/admin/ui/RichTextField";
import SelectField, {
  type SelectOption,
} from "@/components/admin/ui/SelectField";
import InputField from "@/components/admin/ui/InputField";
import {
  VisibilityToggle,
  isVisible,
  type VisibilityMap,
} from "@/components/admin/ui/VisibilityToggle";
import { Switch } from "@/components/ui/switch";

import {
  PROJECT_BUILT_IN_FIELDS,
  PROJECT_FIELD_BODY_DEFAULTS,
  PROJECT_FIELD_LABEL_MAX,
} from "@/lib/constants/projects";
import { richTextToPlain, toRichText } from "@/lib/editor";
import {
  PROJECT_CONTENT_FIELDS,
  ProjectFieldType,
  type ProjectContentField,
  type ProjectCustomValue,
  type ProjectFieldDefinition,
  type ProjectFormState,
  type ProjectMetadata,
} from "@/types/project";
import type { RichTextDocument } from "@/types/rich-text";

interface ProjectDetailsFieldsProps {
  form: ProjectFormState;
  onFormChange: (next: ProjectFormState) => void;
  metadata: ProjectMetadata;
  onMetadataChange: (next: ProjectMetadata) => void;
  typologyOptions: SelectOption[];
  fields: ProjectFieldDefinition[];
}

const fieldToggle = (
  visibility: VisibilityMap,
  key: string,
  onChange: (next: VisibilityMap) => void,
) => (
  <VisibilityToggle
    visible={isVisible(visibility, key)}
    onChange={(visible) => onChange({ ...visibility, [key]: visible })}
  />
);

const fieldValue = (
  field: ProjectFieldDefinition,
  form: ProjectFormState,
  metadata: ProjectMetadata,
): ProjectCustomValue => {
  const usesCustomStorage =
    !PROJECT_BUILT_IN_FIELDS[field.key] ||
    PROJECT_BUILT_IN_FIELDS[field.key] !== field.type;
  if (
    usesCustomStorage &&
    Object.prototype.hasOwnProperty.call(metadata.customValues ?? {}, field.key)
  ) {
    return metadata.customValues?.[field.key] ?? "";
  }
  if (field.key === "shortDescription") {
    return metadata.content?.shortDescription ?? toRichText("");
  }
  if (field.key === "tags") return metadata.tags ?? [];
  const rich = metadata.content?.[field.key as ProjectContentField];
  if (rich) {
    return field.type === ProjectFieldType.RICH_TEXT
      ? rich
      : richTextToPlain(rich);
  }
  if (field.key in form) {
    return form[field.key as keyof ProjectFormState] as string | number;
  }
  return metadata.customValues?.[field.key] ?? "";
};

const plainValue = (value: ProjectCustomValue): string => {
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "object" && value !== null) {
    return richTextToPlain(value);
  }
  return String(value ?? "");
};

export function ProjectDetailsFields({
  form,
  onFormChange,
  metadata,
  onMetadataChange,
  typologyOptions,
  fields,
}: ProjectDetailsFieldsProps) {
  const visibility = metadata.visibility ?? {};
  const setVisibility = (next: VisibilityMap) =>
    onMetadataChange({ ...metadata, visibility: next });

  const patchRich = (key: ProjectContentField, doc: RichTextDocument) => {
    onMetadataChange({
      ...metadata,
      content: { ...metadata.content, [key]: doc },
    });
    if (key === "shortDescription") return;
    if (key in form) {
      const plain = richTextToPlain(doc);
      onFormChange({
        ...form,
        [key]: key === "year" ? plain.replace(/\D/g, "").slice(0, 4) : plain,
      });
    }
  };

  const patchCustom = (key: string, value: ProjectCustomValue) =>
    onMetadataChange({
      ...metadata,
      customValues: { ...metadata.customValues, [key]: value },
    });

  const patchButtonLabel = (key: string, label: string) =>
    onMetadataChange({
      ...metadata,
      buttonLabels: { ...metadata.buttonLabels, [key]: label },
    });

  const patchValue = (
    field: ProjectFieldDefinition,
    value: ProjectCustomValue,
  ) => {
    const usesNativeStorage = PROJECT_BUILT_IN_FIELDS[field.key] === field.type;
    if (!usesNativeStorage) {
      patchCustom(field.key, value);
    } else if (field.key === "tags") {
      onMetadataChange({ ...metadata, tags: value as string[] });
    } else if (field.key in form) {
      onFormChange({ ...form, [field.key]: value });
      if (PROJECT_CONTENT_FIELDS.includes(field.key as ProjectContentField)) {
        onMetadataChange({
          ...metadata,
          content: {
            ...metadata.content,
            [field.key]: toRichText(String(value ?? "")),
          },
        });
      }
    } else {
      patchCustom(field.key, value);
    }
  };

  const renderField = (field: ProjectFieldDefinition) => {
    const value = fieldValue(field, form, metadata);
    const toggle = fieldToggle(visibility, field.key, setVisibility);
    const usesNativeStorage = PROJECT_BUILT_IN_FIELDS[field.key] === field.type;

    if (field.key === "category" && usesNativeStorage) {
      return (
        <SelectField
          label={field.label}
          required={field.required}
          creatable
          value={form.category}
          onValueChange={(category) => patchValue(field, category)}
          options={typologyOptions}
          placeholder="Type or choose from the list"
          labelAction={toggle}
        />
      );
    }

    if (field.type === ProjectFieldType.RICH_TEXT) {
      const rich =
        typeof value === "object" && value !== null && !Array.isArray(value)
          ? value
          : toRichText(String(value ?? ""));
      return (
        <RichTextField
          label={field.label}
          required={field.required}
          value={rich}
          onChange={(doc) =>
            usesNativeStorage &&
            (field.key === "shortDescription" || field.key === "description")
              ? patchRich(field.key, doc)
              : patchCustom(field.key, doc)
          }
          defaults={PROJECT_FIELD_BODY_DEFAULTS}
          labelAction={toggle}
          className={field.key === "description" ? "min-h-40" : undefined}
        />
      );
    }

    if (field.type === ProjectFieldType.SELECT) {
      return (
        <SelectField
          label={field.label}
          required={field.required}
          value={plainValue(value)}
          onValueChange={(next) => patchValue(field, next)}
          options={(field.options ?? []).map((option) => ({
            value: option,
            label: option,
          }))}
          labelAction={toggle}
        />
      );
    }

    if (field.type === ProjectFieldType.URL) {
      return (
        <div className="grid gap-4 md:grid-cols-2">
          <InputField
            label={field.label}
            required={field.required}
            type="url"
            value={plainValue(value)}
            onChange={(event) => patchValue(field, event.target.value)}
            placeholder="https://example.com"
            labelAction={toggle}
          />
          <InputField
            label="Button label"
            value={metadata.buttonLabels?.[field.key] ?? ""}
            maxLength={PROJECT_FIELD_LABEL_MAX}
            maxChars={PROJECT_FIELD_LABEL_MAX}
            onChange={(event) =>
              patchButtonLabel(field.key, event.target.value)
            }
            placeholder={field.buttonLabel?.trim() || "Visit website"}
          />
        </div>
      );
    }

    if (field.type === ProjectFieldType.BOOLEAN) {
      return (
        <div className="flex min-h-11 items-center justify-between rounded-lg border border-line bg-paper px-4 py-3">
          <span className="text-sm font-medium text-ink">{field.label}</span>
          <div className="flex items-center gap-3">
            {toggle}
            <Switch
              checked={
                value === true ||
                ["true", "yes", "1"].includes(plainValue(value).toLowerCase())
              }
              onCheckedChange={(next) => patchValue(field, next)}
            />
          </div>
        </div>
      );
    }

    const list = plainValue(value);
    return (
      <InputField
        label={field.label}
        required={field.required}
        type={
          field.type === ProjectFieldType.NUMBER
            ? "number"
            : field.type === ProjectFieldType.DATE
              ? "date"
              : "text"
        }
        value={list}
        onChange={(event) => {
          const next = event.target.value;
          patchValue(
            field,
            field.type === ProjectFieldType.MULTI_SELECT
              ? next
                  .split(",")
                  .map((item) => item.trim())
                  .filter(Boolean)
              : field.type === ProjectFieldType.NUMBER
                ? next === ""
                  ? ""
                  : Number(next)
                : next,
          );
        }}
        placeholder={
          field.type === ProjectFieldType.MULTI_SELECT
            ? "Comma-separated values"
            : undefined
        }
        labelAction={toggle}
      />
    );
  };

  return (
    <div className="space-y-4">
      <RichTextField
        label="Project title"
        required
        value={metadata.content?.title ?? toRichText(form.title)}
        onChange={(doc) => patchRich("title", doc)}
        defaults={PROJECT_FIELD_BODY_DEFAULTS}
        labelAction={fieldToggle(visibility, "title", setVisibility)}
      />
      {fields
        .filter((field) => field.enabled)
        .sort((a, b) => a.order - b.order)
        .map((field) => (
          <div key={field.key}>{renderField(field)}</div>
        ))}
    </div>
  );
}
