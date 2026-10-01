import { type VisibilityMap } from "@/components/admin/ui/VisibilityToggle";

import { CLIENTS_VISIBILITY } from "@/lib/constants/clients";

export const isClientsGlobalOn = (visibility: VisibilityMap) =>
  visibility[CLIENTS_VISIBILITY.GLOBAL] === true;

export const isAnyClientsPlacementOn = (visibility: VisibilityMap) =>
  visibility[CLIENTS_VISIBILITY.GLOBAL] === true ||
  visibility[CLIENTS_VISIBILITY.HOME] === true ||
  visibility[CLIENTS_VISIBILITY.ABOUT] === true;

export const setClientsGlobalMode = (
  visibility: VisibilityMap,
  global: boolean,
): VisibilityMap => {
  if (global) {
    return {
      ...visibility,
      [CLIENTS_VISIBILITY.GLOBAL]: true,
      [CLIENTS_VISIBILITY.HOME]: false,
      [CLIENTS_VISIBILITY.ABOUT]: false,
    };
  }
  return { ...visibility, [CLIENTS_VISIBILITY.GLOBAL]: false };
};
