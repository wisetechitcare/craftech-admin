import { useEffect, useRef, useState, type ReactNode } from "react";

import InputField from "@/components/admin/ui/InputField";
import ListRow from "@/components/admin/ui/ListRow";
import { AddButton } from "@/components/admin/ui/SectionCard";
import { InfoTooltip } from "@/components/admin/ui/Tooltip";

import {
  editorPointsToTrustStrip,
  trustStripToEditorPoints,
} from "./trust-strip";

import { DragList } from "@/lib/constants/drag-lists";
import { cn, move, removeAt } from "@/utils/utils";

interface TrustStripFieldsProps {
  value: string;
  segmentMax: number;
  itemsMax: number;
  totalMax: number;
  error?: boolean;
  hint?: string;
  labelAction?: ReactNode;
  onChange: (trustStrip: string) => void;
}

export default function TrustStripFields({
  value,
  segmentMax,
  itemsMax,
  totalMax,
  error,
  hint,
  labelAction,
  onChange,
}: TrustStripFieldsProps) {
  const [points, setPoints] = useState<string[]>(() =>
    trustStripToEditorPoints(value),
  );
  const lastEmitted = useRef(value);

  useEffect(() => {
    if (value !== lastEmitted.current) {
      setPoints(trustStripToEditorPoints(value));
      lastEmitted.current = value;
    }
  }, [value]);

  const emit = (next: string[]) => {
    setPoints(next);
    const formatted = editorPointsToTrustStrip(next);
    lastEmitted.current = formatted;
    onChange(formatted);
  };

  const storedLength = editorPointsToTrustStrip(points).length;
  const atItemCap = points.length >= itemsMax;

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5">
          <label className="block text-sm font-medium text-black">
            Trust strip{" "}
            <span className="font-normal text-ink-faint">
              ({points.length}/{itemsMax})
            </span>
          </label>
          <InfoTooltip
            content={
              <>
                Up to {itemsMax} claims. Premium Glass scrolls them as a
                marquee; Clean Modern and Floating show chips of up to{" "}
                {segmentMax} characters each.
              </>
            }
            label="Trust strip"
          />
        </div>
        {labelAction}
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs text-ink-mute">
          Add a line for each badge — separators are filled in for you.
        </p>
        <AddButton
          label="Add claim"
          disabled={atItemCap || storedLength >= totalMax}
          onClick={() => emit([...points, ""])}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {points.map((point, index) => (
          <div
            key={index}
            className={
              index === points.length - 1 && points.length % 2 === 1
                ? "md:col-span-2"
                : undefined
            }
          >
            <ListRow
              chrome="grip"
              index={index}
              count={points.length}
              listId={DragList.HERO_TRUST_STRIP}
              canRemove={points.length > 1}
              onMove={(from, to) => emit(move(points, from, to))}
              onRemove={() => emit(removeAt(points, index))}
            >
              <InputField
                label={`Claim ${index + 1}`}
                value={point}
                onChange={(e) =>
                  emit(
                    points.map((segment, i) =>
                      i === index ? e.target.value : segment,
                    ),
                  )
                }
                maxChars={segmentMax}
                error={error && point.trim().length > segmentMax}
              />
            </ListRow>
          </div>
        ))}
      </div>
      {hint && (
        <p
          className={cn(
            "mt-1.5 text-xs",
            error ? "text-error-500" : "text-gray-500",
          )}
        >
          {hint}
        </p>
      )}
    </div>
  );
}
