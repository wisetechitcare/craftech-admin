import { LAYOUT_VARIANT_LABELS } from "@/lib/constants/appearance";
import type { LayoutVariant } from "@/types/common";
import { cn } from "@/utils/utils";

interface LayoutVariantPickerProps {
  label: string;
  /** Null selects nothing, e.g. while sections still use different layouts. */
  value: LayoutVariant | null;
  onChange: (value: LayoutVariant) => void;
}

const LayoutVariantPicker = ({
  label,
  value,
  onChange,
}: LayoutVariantPickerProps) => (
  <div className="space-y-3">
    <label className="block text-xs font-semibold text-ink-mute uppercase tracking-wider">
      {label}
    </label>
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {(Object.keys(LAYOUT_VARIANT_LABELS) as LayoutVariant[]).map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className={cn(
            "p-3 rounded-lg border-2 text-sm font-semibold text-ink transition-colors",
            value === option
              ? "border-info bg-info/10"
              : "border-line bg-raise hover:border-info/50",
          )}
        >
          {LAYOUT_VARIANT_LABELS[option]}
        </button>
      ))}
    </div>
  </div>
);

export default LayoutVariantPicker;
