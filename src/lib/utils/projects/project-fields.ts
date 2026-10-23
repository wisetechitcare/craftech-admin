import { PROJECT_CARD_SLOT_FREE_TYPES } from "@/lib/constants/projects";
import type { ProjectFieldDefinition } from "@/types/project";

export const takesCardSlot = (field: Pick<ProjectFieldDefinition, "type">) =>
  !PROJECT_CARD_SLOT_FREE_TYPES.includes(field.type);

export const usesCardSlot = (field: ProjectFieldDefinition) =>
  field.enabled && field.showOnCard && takesCardSlot(field);
