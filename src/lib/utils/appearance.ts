import type { VisibilityMap } from "@/components/admin/ui/VisibilityToggle";

import { appearanceApi } from "@/services/api";
import type { AppearanceUpdatePayload } from "@/types/appearance";

const mergeAppearanceVisibility = (
  stored: VisibilityMap | null | undefined,
  patch: VisibilityMap,
): VisibilityMap => ({
  ...(stored ?? {}),
  ...patch,
});

async function mergedVisibilityPatch(
  patch: VisibilityMap,
): Promise<VisibilityMap> {
  const current = await appearanceApi.get();
  return mergeAppearanceVisibility(current.data?.data?.visibility, patch);
}

export async function updateAppearanceVisibility(
  patch: VisibilityMap,
): Promise<VisibilityMap> {
  const merged = await mergedVisibilityPatch(patch);
  const { data } = await appearanceApi.update({ visibility: merged });
  return data.data.visibility ?? merged;
}

export async function updateAppearance(patch: AppearanceUpdatePayload) {
  const payload = patch.visibility
    ? {
        ...patch,
        visibility: await mergedVisibilityPatch(patch.visibility),
      }
    : patch;
  return appearanceApi.update(payload);
}
