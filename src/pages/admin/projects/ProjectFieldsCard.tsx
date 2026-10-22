import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Plus,
  RotateCcw,
  Save,
  Trash2,
} from "lucide-react";

import ConfirmModal from "@/components/admin/ui/ConfirmModal";
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
import {
  ProjectFieldPlacement,
  ProjectFieldType,
  type ProjectFieldDefinition,
} from "@/types/project";
import { cn, move } from "@/utils/utils";

interface ProjectFieldsCardProps {
  fields: ProjectFieldDefinition[];
  onChange: (fields: ProjectFieldDefinition[]) => void;
  onSave: () => void;
  onDiscard: () => void;
  saving: boolean;
  dirty: boolean;
}

const PLACEMENTS = [
  { value: ProjectFieldPlacement.CARD, label: "Card only" },
  { value: ProjectFieldPlacement.DETAIL, label: "Detail only" },
  { value: ProjectFieldPlacement.BOTH, label: "Card + Detail" },
] as const;

const typeLabel = (type: ProjectFieldType): string =>
  PROJECT_FIELD_TYPE_OPTIONS.find((option) => option.value === type)?.label ??
  (type === ProjectFieldType.RICH_TEXT ? "Long text" : "Boolean");

const placementOf = (field: ProjectFieldDefinition): ProjectFieldPlacement => {
  if (field.showOnCard && field.showOnDetail) return ProjectFieldPlacement.BOTH;
  if (field.showOnCard) return ProjectFieldPlacement.CARD;
  return ProjectFieldPlacement.DETAIL;
};

const placementFlags = (placement: ProjectFieldPlacement) => ({
  showOnCard: placement !== ProjectFieldPlacement.DETAIL,
  showOnDetail: placement !== ProjectFieldPlacement.CARD,
});

const ProjectFieldsCard = ({
  fields,
  onChange,
  onSave,
  onDiscard,
  saving,
  dirty,
}: ProjectFieldsCardProps) => {
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [deleteKey, setDeleteKey] = useState<string | null>(null);
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
    const key = `customField${Date.now()}`;
    onChange([
      ...fields,
      {
        key,
        label: "",
        type: ProjectFieldType.TEXT,
        required: false,
        enabled: true,
        showOnCard: false,
        showOnDetail: true,
        order: fields.length,
      },
    ]);
    setOpenKey(key);
  };

  const moveField = (from: number, to: number) =>
    onChange(
      move(fields, from, to).map((field, order) => ({ ...field, order })),
    );

  const confirmDelete = () => {
    if (!deleteKey) return;
    onChange(
      fields
        .filter((field) => field.key !== deleteKey)
        .map((field, order) => ({ ...field, order })),
    );
    if (openKey === deleteKey) setOpenKey(null);
    setDeleteKey(null);
  };

  return (
    <>
      <SectionCard
        title="Project fields"
        count={fields.length}
        max={PROJECT_FIELD_LIMIT}
        description="Choose the information each project can store and where it appears. Drag any row to reorder it."
        controls={
          <span className="rounded-full bg-raise px-3 py-1 text-xs font-semibold text-ink-soft">
            Card fields {cardCount}/{PROJECT_CARD_FIELD_LIMIT}
          </span>
        }
      >
        <div className="space-y-3">
          {fields.map((field, index) => {
            const builtIn = Boolean(PROJECT_BUILT_IN_FIELDS[field.key]);
            const open = openKey === field.key;
            const placement = placementOf(field);
            const fieldUsesCard = field.enabled && field.showOnCard;
            const cardLimitReached =
              cardCount >= PROJECT_CARD_FIELD_LIMIT && !fieldUsesCard;
            const fieldTypeLabel = typeLabel(field.type);

            return (
              <DragBlock
                key={field.key}
                listId={DragList.PROJECT_FIELDS}
                index={index}
                label={field.label || "Untitled field"}
                onMove={moveField}
              >
                <div className="rounded-xl border border-line bg-raise pt-2">
                  <button
                    type="button"
                    className="flex w-full items-center gap-3 px-4 py-3 text-left"
                    onClick={() => setOpenKey(open ? null : field.key)}
                    aria-expanded={open}
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-ink">
                        {field.label || "Untitled field"}
                      </span>
                      <span className="mt-1 flex flex-wrap items-center gap-2 text-xs text-ink-mute">
                        {builtIn ? (
                          <span className="rounded-full bg-paper px-2 py-0.5 font-semibold text-ink-soft ring-1 ring-line">
                            Built-in
                          </span>
                        ) : null}
                        <span>
                          {
                            PLACEMENTS.find((item) => item.value === placement)
                              ?.label
                          }
                        </span>
                      </span>
                    </span>
                    {open ? (
                      <ChevronUp className="size-4 text-ink-mute" />
                    ) : (
                      <ChevronDown className="size-4 text-ink-mute" />
                    )}
                  </button>

                  {open ? (
                    <div className="space-y-4 border-t border-line p-4">
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
                        {builtIn ? (
                          <InputField
                            label="Field type"
                            value={fieldTypeLabel}
                            disabled
                          />
                        ) : (
                          <SelectField
                            label="Field type"
                            value={field.type}
                            options={PROJECT_FIELD_TYPE_OPTIONS}
                            onValueChange={(value) => {
                              const type = value as ProjectFieldType;
                              patch(index, {
                                type,
                                ...(![
                                  ProjectFieldType.SELECT,
                                  ProjectFieldType.MULTI_SELECT,
                                ].includes(type)
                                  ? { options: undefined }
                                  : {}),
                              });
                            }}
                          />
                        )}
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

                      <div className="flex flex-wrap items-end gap-x-6 gap-y-4 text-sm text-ink">
                        <label className="flex min-h-11 items-center gap-2">
                          <Switch
                            checked={field.enabled}
                            disabled={
                              !field.enabled &&
                              field.showOnCard &&
                              cardLimitReached
                            }
                            onCheckedChange={(enabled) =>
                              patch(index, { enabled })
                            }
                          />
                          Enabled
                        </label>
                        <label className="flex min-h-11 items-center gap-2">
                          <Switch
                            checked={field.required}
                            onCheckedChange={(required) =>
                              patch(index, { required })
                            }
                          />
                          Required
                        </label>
                        <fieldset className="min-w-0 flex-1">
                          <legend className="mb-2 text-sm font-medium text-black">
                            Show on
                          </legend>
                          <div className="flex flex-wrap gap-2">
                            {PLACEMENTS.map((option) => {
                              const cardBearing =
                                option.value !== ProjectFieldPlacement.DETAIL;
                              const disabled = cardBearing && cardLimitReached;
                              return (
                                <button
                                  key={option.value}
                                  type="button"
                                  disabled={disabled}
                                  onClick={() =>
                                    patch(index, placementFlags(option.value))
                                  }
                                  className={cn(
                                    "rounded-lg border px-3 py-2 text-xs font-semibold transition-colors",
                                    placement === option.value
                                      ? "border-violet-500 bg-violet-500/10 text-violet-700"
                                      : "border-line bg-paper text-ink-soft hover:border-violet-400",
                                    disabled &&
                                      "cursor-not-allowed opacity-40 hover:border-line",
                                  )}
                                >
                                  {option.label}
                                </button>
                              );
                            })}
                          </div>
                          {cardLimitReached ? (
                            <p className="mt-1.5 text-xs text-gray-500">
                              Card limit reached ({cardCount}/
                              {PROJECT_CARD_FIELD_LIMIT})
                            </p>
                          ) : null}
                        </fieldset>
                      </div>

                      {!builtIn ? (
                        <div className="flex justify-end">
                          <Button
                            variant="outline"
                            size="xs"
                            onClick={() => setDeleteKey(field.key)}
                            aria-label={`Delete ${field.label || "field"}`}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              </DragBlock>
            );
          })}
        </div>

        {detailCount > PROJECT_DETAIL_FIELD_WARNING_LIMIT ? (
          <p className="text-sm text-red-600">
            More than {PROJECT_DETAIL_FIELD_WARNING_LIMIT} detail fields may
            make project pages feel crowded.
          </p>
        ) : null}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button
            size="sm"
            onClick={addField}
            disabled={fields.length >= PROJECT_FIELD_LIMIT}
            startIcon={<Plus />}
          >
            Add custom field
          </Button>

          {dirty ? (
            <div className="flex gap-3">
              <Button
                size="sm"
                variant="outline"
                onClick={onDiscard}
                disabled={saving}
                startIcon={<RotateCcw />}
              >
                Discard
              </Button>
              <Button
                size="sm"
                onClick={onSave}
                disabled={saving}
                startIcon={<Save />}
              >
                {saving ? "Saving..." : "Save fields"}
              </Button>
            </div>
          ) : null}
        </div>
      </SectionCard>

      <ConfirmModal
        open={deleteKey !== null}
        title="Delete custom field?"
        message="This removes the field from project forms and public project pages. Existing stored values are left untouched."
        confirmLabel="Delete field"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteKey(null)}
      />
    </>
  );
};

export default ProjectFieldsCard;
