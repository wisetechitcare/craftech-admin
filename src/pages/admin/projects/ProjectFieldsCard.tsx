import { Plus, Save, Trash2 } from "lucide-react";

import { DragBlock } from "@/components/admin/ui/DragList";
import InputField from "@/components/admin/ui/InputField";
import SelectField from "@/components/admin/ui/SelectField";
import { SectionCard } from "@/components/admin/ui/SectionCard";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

import {
  PROJECT_BUILT_IN_FIELDS,
  PROJECT_CARD_FIELD_LIMIT,
  PROJECT_DETAIL_FIELD_WARNING_LIMIT,
  PROJECT_FIELD_LABEL_MAX,
  PROJECT_FIELD_LIMIT,
  PROJECT_FIELD_TYPE_OPTIONS,
} from "@/lib/constants/projects";
import { DragList } from "@/lib/constants/drag-lists";
import { ProjectFieldType, type ProjectFieldDefinition } from "@/types/project";
import { move } from "@/utils/utils";

interface ProjectFieldsCardProps {
  fields: ProjectFieldDefinition[];
  onChange: (fields: ProjectFieldDefinition[]) => void;
  onSave: () => void;
  saving: boolean;
}

const ProjectFieldsCard = ({
  fields,
  onChange,
  onSave,
  saving,
}: ProjectFieldsCardProps) => {
  const cardCount = fields.filter(
    (field) => field.enabled && field.showOnCard,
  ).length;
  const detailCount = fields.filter(
    (field) => field.enabled && field.showOnDetail,
  ).length;

  const patch = (index: number, value: Partial<ProjectFieldDefinition>) =>
    onChange(
      fields.map((field, fieldIndex) =>
        fieldIndex === index ? { ...field, ...value } : field,
      ),
    );

  const addField = () => {
    if (fields.length >= PROJECT_FIELD_LIMIT) return;
    onChange([
      ...fields,
      {
        key: `customField${Date.now()}`,
        label: "New field",
        type: ProjectFieldType.TEXT,
        required: false,
        enabled: true,
        showOnCard: false,
        showOnDetail: true,
        order: fields.length,
      },
    ]);
  };

  const moveField = (from: number, to: number) =>
    onChange(
      move(fields, from, to).map((field, order) => ({ ...field, order })),
    );

  return (
    <SectionCard
      title="Project fields"
      count={cardCount}
      max={PROJECT_FIELD_LIMIT}
      description="Configure the information available on project entries. Existing built-in fields keep using their current database columns."
    >
      <div className="space-y-4">
        {fields.map((field, index) => {
          const builtIn = Boolean(PROJECT_BUILT_IN_FIELDS[field.key]);
          return (
            <DragBlock
              key={field.key}
              listId={DragList.PROJECT_FIELDS}
              index={index}
              label={field.label}
              onMove={moveField}
            >
              <div className="space-y-4 rounded-xl border border-line bg-raise p-4 pt-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <InputField
                    label="Label"
                    value={field.label}
                    maxLength={PROJECT_FIELD_LABEL_MAX}
                    maxChars={PROJECT_FIELD_LABEL_MAX}
                    onChange={(event) =>
                      patch(index, { label: event.target.value })
                    }
                  />
                  <SelectField
                    label="Field type"
                    value={field.type}
                    options={PROJECT_FIELD_TYPE_OPTIONS}
                    onValueChange={(type) =>
                      patch(index, { type: type as ProjectFieldType })
                    }
                  />
                </div>

                {field.type === ProjectFieldType.SELECT ||
                field.type === ProjectFieldType.MULTI_SELECT ? (
                  <InputField
                    label="Options"
                    value={(field.options ?? []).join(", ")}
                    onChange={(event) =>
                      patch(index, {
                        options: event.target.value
                          .split(",")
                          .map((option) => option.trim())
                          .filter(Boolean),
                      })
                    }
                    placeholder="Option one, Option two"
                  />
                ) : null}

                <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-ink">
                  {[
                    ["Enabled", "enabled"],
                    ["Required", "required"],
                    ["Project cards", "showOnCard"],
                    ["Detail pages", "showOnDetail"],
                  ].map(([label, key]) => {
                    const disabled =
                      key === "showOnCard" &&
                      !field.showOnCard &&
                      field.enabled &&
                      cardCount >= PROJECT_CARD_FIELD_LIMIT;
                    return (
                      <label key={key} className="flex items-center gap-2">
                        <Switch
                          checked={Boolean(
                            field[key as keyof ProjectFieldDefinition],
                          )}
                          disabled={disabled}
                          onCheckedChange={(checked) =>
                            patch(index, { [key]: checked })
                          }
                        />
                        {label}
                      </label>
                    );
                  })}
                </div>

                <div className="flex items-center justify-end gap-2">
                  {!builtIn ? (
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={() =>
                        onChange(
                          fields
                            .filter((_, fieldIndex) => fieldIndex !== index)
                            .map((item, order) => ({ ...item, order })),
                        )
                      }
                      aria-label={`Delete ${field.label}`}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  ) : null}
                </div>
              </div>
            </DragBlock>
          );
        })}
      </div>

      <div className="space-y-2 pt-2 text-xs text-ink-mute">
        {detailCount > PROJECT_DETAIL_FIELD_WARNING_LIMIT ? (
          <p className="text-red-600 text-base ">
            More than {PROJECT_DETAIL_FIELD_WARNING_LIMIT} detail fields may
            make project pages feel crowded.
          </p>
        ) : null}
      </div>

      <div className="flex flex-wrap justify-between gap-3 pt-2">
        <Button
          size="sm"
          onClick={addField}
          disabled={fields.length >= PROJECT_FIELD_LIMIT}
          startIcon={<Plus />}
        >
          Add custom field
        </Button>
        <Button
          size="sm"
          onClick={onSave}
          disabled={saving}
          startIcon={<Save />}
        >
          Save fields
        </Button>
      </div>
    </SectionCard>
  );
};

export default ProjectFieldsCard;
