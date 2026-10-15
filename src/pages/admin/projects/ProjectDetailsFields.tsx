import RichTextField from "@/components/admin/ui/RichTextField";
import SelectField from "@/components/admin/ui/SelectField";
import {
  VisibilityToggle,
  isVisible,
  type VisibilityMap,
} from "@/components/admin/ui/VisibilityToggle";

import { richTextToPlain, toRichText } from "@/lib/editor";
import {
  PROJECT_FIELD_BODY_DEFAULTS,
  PROJECT_RICH_FIELDS,
} from "@/lib/constants/projects";
import type { ProjectContentField, ProjectMetadata } from "@/types/project";
import type { RichTextDocument } from "@/types/rich-text";
import type { SelectOption } from "@/components/admin/ui/SelectField";

interface ProjectFormState {
  title: string;
  category: string;
  description: string;
  client: string;
  year: number | string;
  location: string;
  area: string;
  withCollaboration: string;
}

interface ProjectDetailsFieldsProps {
  form: ProjectFormState;
  onFormChange: (next: ProjectFormState) => void;
  metadata: ProjectMetadata;
  onMetadataChange: (next: ProjectMetadata) => void;
  typologyOptions: SelectOption[];
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

const richForField = (
  metadata: ProjectMetadata,
  key: ProjectContentField,
  plain: string,
): RichTextDocument => metadata.content?.[key] ?? toRichText(plain);

export function ProjectDetailsFields({
  form,
  onFormChange,
  metadata,
  onMetadataChange,
  typologyOptions,
}: ProjectDetailsFieldsProps) {
  const visibility = metadata.visibility ?? {};

  const setVisibility = (next: VisibilityMap) =>
    onMetadataChange({ ...metadata, visibility: next });

  const patchRich = (key: ProjectContentField, doc: RichTextDocument) => {
    const plain = richTextToPlain(doc);
    const content = { ...metadata.content, [key]: doc };
    onMetadataChange({ ...metadata, content });
    const next = { ...form };
    switch (key) {
      case "title":
        next.title = plain;
        break;
      case "category":
        next.category = plain;
        break;
      case "client":
        next.client = plain;
        break;
      case "year":
        next.year = plain.replace(/\D/g, "").slice(0, 4) || plain;
        break;
      case "location":
        next.location = plain;
        break;
      case "area":
        next.area = plain;
        break;
      case "withCollaboration":
        next.withCollaboration = plain;
        break;
      case "description":
        next.description = plain;
        break;
      default: {
        const _exhaustive: never = key;
        return _exhaustive;
      }
    }
    onFormChange(next);
  };

  return (
    <div className=" space-y-4">
      {PROJECT_RICH_FIELDS.map((field) => {
        const toggle = fieldToggle(visibility, field.key, setVisibility);
        const wrapClass = field.wide ? "sm:col-span-2" : undefined;

        if (field.key === "category") {
          return (
            <div key={field.key} className={wrapClass}>
              <SelectField
                label={field.label}
                required={field.required}
                creatable
                value={form.category}
                onValueChange={(category) =>
                  onFormChange({ ...form, category })
                }
                options={typologyOptions}
                placeholder="Type or choose from the list"
                tooltip="Start typing for a new typology, or pick one from the dropdown. Saved projects add to the list."
                labelAction={toggle}
              />
            </div>
          );
        }

        const plain =
          field.key === "year"
            ? String(form.year)
            : String(form[field.key] ?? "");

        return (
          <div key={field.key} className={wrapClass}>
            <RichTextField
              label={field.label}
              required={field.required}
              value={richForField(metadata, field.key, plain)}
              onChange={(doc) => patchRich(field.key, doc)}
              defaults={PROJECT_FIELD_BODY_DEFAULTS}
              placeholder={field.placeholder}
              tooltip={field.tooltip}
              labelAction={toggle}
              className={field.key === "description" ? "min-h-40" : undefined}
            />
          </div>
        );
      })}
    </div>
  );
}
