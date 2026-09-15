import SitePreview, {
  PreviewSection,
  type PreviewDraft,
} from "@/components/admin/ui/SitePreview";

import { LayoutVariant } from "@/types/common";
import { cn } from "@/utils/utils";

const LAYOUT_VARIANT_OPTIONS: { value: LayoutVariant; label: string }[] = [
  { value: LayoutVariant.PREMIUM_GLASS, label: "Premium Glass" },
  { value: LayoutVariant.CLEAN_MODERN, label: "Clean Modern" },
  { value: LayoutVariant.FLOATING, label: "Floating" },
];

interface LayoutVariantPickerProps {
  label: string;
  value: LayoutVariant;
  section: PreviewSection;
  draft: PreviewDraft;
  previewHeight?: number;
  onChange: (value: LayoutVariant) => void;
}

const LayoutVariantPicker = ({
  label,
  value,
  section,
  draft,
  previewHeight,
  onChange,
}: LayoutVariantPickerProps) => (
  <div className="space-y-3">
    <label className="block text-xs font-semibold text-ink-mute uppercase tracking-wider">
      {label}
    </label>
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {LAYOUT_VARIANT_OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={cn(
            "p-3 rounded-lg border-2 text-sm font-semibold text-ink transition-colors",
            value === option.value
              ? "border-info bg-info/10"
              : "border-line bg-raise hover:border-info/50",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
    <SitePreview
      section={section}
      draft={draft}
      viewportHeight={previewHeight}
    />
  </div>
);

export default LayoutVariantPicker;
