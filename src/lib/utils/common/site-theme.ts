import { SECTION_VARIANT_FIELDS } from "@/lib/constants/appearance";
import type {
  AppearanceResponse,
  AppearanceUpdatePayload,
} from "@/types/appearance";
import type { LayoutVariant } from "@/types/common";

/** The one layout every section uses, or null while sections still disagree. */
export const siteThemeOf = (
  appearance: AppearanceResponse,
): LayoutVariant | null => {
  const [first, ...rest] = SECTION_VARIANT_FIELDS.map(
    (field) => appearance[field],
  );
  return rest.every((variant) => variant === first) ? first : null;
};

export const siteThemePayload = (variant: LayoutVariant) =>
  Object.fromEntries(
    SECTION_VARIANT_FIELDS.map((field) => [field, variant]),
  ) as AppearanceUpdatePayload;
