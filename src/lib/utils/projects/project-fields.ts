import { PROJECT_CARD_SLOT_FREE_TYPES } from "@/lib/constants/projects";
import { ProjectFieldType, type ProjectFieldDefinition } from "@/types/project";

/** A blank custom field, as "Add custom field" creates it. */
export const newProjectField = (order: number): ProjectFieldDefinition => ({
  key: `customField${Date.now()}`,
  label: "",
  type: ProjectFieldType.TEXT,
  required: false,
  enabled: true,
  showOnCard: false,
  showOnDetail: true,
  order,
});

export const takesCardSlot = (field: Pick<ProjectFieldDefinition, "type">) =>
  !PROJECT_CARD_SLOT_FREE_TYPES.includes(field.type);

export const usesCardSlot = (field: ProjectFieldDefinition) =>
  field.enabled && field.showOnCard && takesCardSlot(field);
