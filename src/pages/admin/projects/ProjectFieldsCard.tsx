import { useState } from "react";
import {
  Asterisk,
  ChevronDown,
  EyeOff,
  LayoutGrid,
  Lock,
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
  PROJECT_FIELD_PILL_CLASS,
  PROJECT_FIELD_PLACEMENTS,
  PROJECT_FIELD_TYPE_LABELS,
  PROJECT_FIELD_TYPE_OPTIONS,
  PROJECT_UNTITLED_FIELD_LABEL,
} from "@/lib/constants/projects";
import { DragList } from "@/lib/constants/drag-lists";
import {
  ProjectFieldPlacement,
  ProjectFieldType,
  type ProjectFieldDefinition,
} from "@/types/project";
import { takesCardSlot, usesCardSlot } from "@/lib/utils/projects";
import { cn, move } from "@/utils/utils";

interface ProjectFieldsCardProps {
  fields: ProjectFieldDefinition[];
  onChange: (fields: ProjectFieldDefinition[]) => void;
  onSave: () => void;
  onDiscard: () => void;
  saving: boolean;
  dirty: boolean;
}

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
  const cardCount = fields.filter(usesCardSlot).length;
  const detailCount = fields.filter(
    (field) => field.enabled && field.showOnDetail,
  ).length;
  const cardSlotsFull = cardCount >= PROJECT_CARD_FIELD_LIMIT;

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
          <span
            title={`Up to ${PROJECT_CARD_FIELD_LIMIT} text fields can show on project cards. Links and multi-select tags don't count.`}
            className={cn(
              PROJECT_FIELD_PILL_CLASS,
              "gap-2 px-3 py-1.5",
              cardSlotsFull
                ? "bg-warn/10 text-warn ring-warn/25"
                : "bg-brand/10 text-brand ring-brand/25",
            )}
          >
            <LayoutGrid className="size-3.5" />
            Card fields {cardCount}/{PROJECT_CARD_FIELD_LIMIT}
            <span className="flex gap-1" aria-hidden>
              {Array.from({ length: PROJECT_CARD_FIELD_LIMIT }, (_, slot) => (
                <span
                  key={slot}
                  className={cn(
                    "size-1.5 rounded-full",
                    slot < cardCount ? "bg-current" : "bg-current/25",
                  )}
                />
              ))}
            </span>
          </span>
        }
      >
        <div className="space-y-3">
          {fields.map((field, index) => {
            const builtIn = Boolean(PROJECT_BUILT_IN_FIELDS[field.key]);
            const open = openKey === field.key;
            const placement = placementOf(field);
            const placementOption = PROJECT_FIELD_PLACEMENTS.find(
              (item) => item.value === placement,
            );
            const PlacementIcon = placementOption?.icon;
            const cardLimitReached =
              cardSlotsFull && takesCardSlot(field) && !usesCardSlot(field);
            const fieldLabel = field.label || PROJECT_UNTITLED_FIELD_LABEL;

            return (
              <DragBlock
                key={field.key}
                listId={DragList.PROJECT_FIELDS}
                index={index}
                label={fieldLabel}
                onMove={moveField}
              >
                <div className="rounded-xl border border-line bg-raise pt-2">
                  <Button
                    variant="none"
                    className="flex w-full justify-start gap-3 rounded-xl px-4 py-3 text-left"
                    onClick={() => setOpenKey(open ? null : field.key)}
                    aria-expanded={open}
                  >
                    <span className="min-w-0 flex-1">
                      <span
                        className={cn(
                          "block truncate text-sm font-semibold text-ink",
                          !field.enabled && "text-ink-mute line-through",
                        )}
                      >
                        {fieldLabel}
                      </span>
                      <span className="mt-2 flex flex-wrap items-center gap-2">
                        {placementOption && PlacementIcon ? (
                          <span
                            className={cn(
                              PROJECT_FIELD_PILL_CLASS,
                              placementOption.className,
                            )}
                          >
                            <PlacementIcon className="size-3.5" />
                            {placementOption.label}
                          </span>
                        ) : null}
                        {field.required ? (
                          <span
                            className={cn(
                              PROJECT_FIELD_PILL_CLASS,
                              "bg-danger/10 text-danger ring-danger/25",
                            )}
                          >
                            <Asterisk className="size-3.5" />
                            Required
                          </span>
                        ) : null}
                        {!field.enabled ? (
                          <span
                            className={cn(
                              PROJECT_FIELD_PILL_CLASS,
                              "bg-paper text-ink-mute ring-line",
                            )}
                          >
                            <EyeOff className="size-3.5" />
                            Hidden
                          </span>
                        ) : null}
                        {builtIn ? (
                          <span
                            title="Default fields can't be deleted"
                            className={cn(
                              PROJECT_FIELD_PILL_CLASS,
                              "bg-paper text-ink-soft ring-line",
                            )}
                          >
                            <Lock className="size-3" />
                            Default
                          </span>
                        ) : null}
                      </span>
                    </span>
                    <ChevronDown
                      className={cn(
                        "size-4 text-ink-mute transition-transform",
                        open && "rotate-180",
                      )}
                    />
                  </Button>

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
                            value={PROJECT_FIELD_TYPE_LABELS[field.type]}
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
                          <legend className="mb-2 text-sm font-medium text-ink">
                            Show on
                          </legend>
                          <div className="flex flex-wrap gap-2">
                            {PROJECT_FIELD_PLACEMENTS.map((option) => {
                              const OptionIcon = option.icon;
                              const selected = placement === option.value;
                              const disabled =
                                option.value !== ProjectFieldPlacement.DETAIL &&
                                cardLimitReached;
                              return (
                                <Button
                                  key={option.value}
                                  variant="none"
                                  size="xs"
                                  disabled={disabled}
                                  aria-pressed={selected}
                                  onClick={() =>
                                    patch(index, placementFlags(option.value))
                                  }
                                  startIcon={
                                    <OptionIcon className="size-3.5" />
                                  }
                                  className={cn(
                                    "font-semibold ring-1 ring-inset",
                                    selected
                                      ? option.className
                                      : "bg-paper text-ink-soft ring-line hover:ring-brand/40",
                                  )}
                                >
                                  {option.label}
                                </Button>
                              );
                            })}
                          </div>
                          {cardLimitReached ? (
                            <p className="mt-1.5 text-xs text-warn">
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
          <p className="text-sm text-danger">
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
