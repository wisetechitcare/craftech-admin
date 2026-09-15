import CursorPreview from "@/components/admin/ui/CursorPreview";

import { CustomCursorVariant } from "@/types/common";
import { cn } from "@/utils/utils";

const CURSOR_VARIANT_OPTIONS: {
  value: CustomCursorVariant;
  label: string;
  description: string;
}[] = [
  {
    value: CustomCursorVariant.NONE,
    label: "No Animation",
    description: "Use the system default pointer with no custom cursor.",
  },
  {
    value: CustomCursorVariant.VARIANT1,
    label: "Dual Ring",
    description: "Smooth inner dot with a trailing ring that expands on hover.",
  },
  {
    value: CustomCursorVariant.VARIANT2,
    label: "Canvas Dot",
    description: "Soft lagging dot drawn on canvas for a fluid follow effect.",
  },
];

interface CursorVariantPickerProps {
  value: CustomCursorVariant;
  onChange: (value: CustomCursorVariant) => void;
}

const CursorVariantPicker = ({ value, onChange }: CursorVariantPickerProps) => (
  <div className="space-y-6">
    <div className="space-y-3">
      <label className="block text-xs font-semibold text-ink-mute uppercase tracking-wider">
        Cursor Style
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {CURSOR_VARIANT_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              "p-4 rounded-lg border-2 text-left transition-colors",
              value === option.value
                ? "border-info bg-info/10"
                : "border-line bg-raise hover:border-info/50",
            )}
          >
            <p className="text-sm font-semibold text-ink">{option.label}</p>
            <p className="text-xs text-ink-mute mt-1">{option.description}</p>
          </button>
        ))}
      </div>
    </div>

    <CursorPreview variant={value} />
  </div>
);

export default CursorVariantPicker;
