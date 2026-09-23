import { useCallback, useRef, useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";

import DropdownPanel from "@/components/admin/ui/DropdownPanel";

import { RICH_TEXT_AUTOMATIC_LABEL } from "@/lib/constants/rich-text";
import { cn } from "@/utils/utils";

export interface ColorPickerProps {
  label: string;
  icon: ReactNode;
  swatches: string[];
  /** The colour in force, or null when the text inherits. */
  value: string | null;
  disabled?: boolean;
  onChange: (color: string | null) => void;
}

/**
 * Text colour and highlight are this one control with a different icon and
 * swatch list. Free choice is `<input type="color">` — the browser already
 * ships a picker with an eyedropper and keyboard support.
 */
export default function ColorPicker({
  label,
  icon,
  swatches,
  value,
  disabled = false,
  onChange,
}: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => setIsOpen(false), []);

  const pick = (color: string | null) => {
    onChange(color);
    close();
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        title={label}
        aria-label={label}
        aria-expanded={isOpen}
        disabled={disabled}
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => !disabled && setIsOpen((previous) => !previous)}
        className={cn(
          "flex h-8 items-center gap-0.5 rounded px-1 text-gray-800 transition-colors hover:bg-gray-200",
          disabled && "cursor-not-allowed opacity-40",
          isOpen && "bg-gray-200",
        )}
      >
        <span className="flex flex-col items-center gap-0.5">
          {icon}
          <span
            className={cn(
              "h-1 w-4 rounded-xs border border-gray-300",
              !value && "bg-white",
            )}
            style={value ? { backgroundColor: value } : undefined}
          />
        </span>
        <ChevronDown className="size-3 text-gray-500" />
      </button>

      <DropdownPanel
        anchorRef={triggerRef}
        open={isOpen && !disabled}
        onClose={close}
        className="w-56 p-3"
      >
        <div className="space-y-3">
          <div className="grid grid-cols-6 gap-1.5">
            {swatches.map((swatch) => (
              <button
                key={swatch}
                type="button"
                title={swatch}
                aria-label={swatch}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => pick(swatch)}
                className={cn(
                  "size-6 rounded border transition-transform hover:scale-110",
                  swatch === value
                    ? "border-brand-500 ring-2 ring-brand-500/20"
                    : "border-gray-300",
                )}
                style={{ backgroundColor: swatch }}
              />
            ))}
          </div>

          <label className="flex items-center justify-between gap-2 text-xs font-medium text-gray-500">
            Custom colour
            <input
              type="color"
              value={value ?? "#000000"}
              onChange={(event) => onChange(event.target.value)}
              className="h-7 w-12 cursor-pointer rounded border border-gray-300 bg-white p-0.5"
            />
          </label>

          <button
            type="button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => pick(null)}
            className="w-full rounded border border-gray-300 px-2 py-1.5 text-xs font-semibold text-gray-500 transition-colors hover:bg-gray-100 hover:text-ink"
          >
            {RICH_TEXT_AUTOMATIC_LABEL}
          </button>
        </div>
      </DropdownPanel>
    </>
  );
}
