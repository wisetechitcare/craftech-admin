import React from "react";
import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";

import { DragHandle, dragStateClasses, useDragItem } from "./DragList";

import { cn } from "@/utils/utils";

interface ListRowProps {
  title: string;
  index: number;
  count: number;
  onMove: (from: number, to: number) => void;
  onRemove: (index: number) => void;
  /** Turns on drag-to-reorder, scoped to rows sharing this id. Optional: a list
   *  is perfectly usable on the buttons alone, and adopting drag is this prop
   *  and no other change. */
  listId?: string;
  /** Greys the delete control, for a list the server gives a minimum length. */
  canRemove?: boolean;
  children: React.ReactNode;
}

/**
 * One entry in an ordered CMS list, with its reorder and delete controls.
 *
 * The arrow buttons are not a fallback for the handle but the other half of it:
 * they work on touch and from the keyboard. Both end in the same
 * `onMove(from, to)`, and order is the array's own order, so nothing here has
 * to be renumbered either way.
 */
export default function ListRow({
  title,
  index,
  count,
  onMove,
  onRemove,
  listId,
  canRemove = true,
  children,
}: ListRowProps) {
  const name = `${title} ${index + 1}`;
  const { ref, handleProps, isDragging, isTarget } = useDragItem({
    listId: listId ?? "",
    index,
    onMove,
    disabled: !listId || count < 2,
  });

  return (
    <div
      ref={ref}
      className={cn(
        "bg-raise border border-line rounded-xl p-4 space-y-4",
        dragStateClasses(isDragging, isTarget),
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-base font-medium uppercase">{name}</span>
        <div className="flex items-center gap-1">
          {listId && <DragHandle {...handleProps} label={name} />}
          <button
            type="button"
            onClick={() => onMove(index, index - 1)}
            disabled={index === 0}
            aria-label={`Move ${name} up`}
            className="p-1.5 text-ink-faint hover:text-ink disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onMove(index, index + 1)}
            disabled={index === count - 1}
            aria-label={`Move ${name} down`}
            className="p-1.5 text-ink-faint hover:text-ink disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ArrowDown className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onRemove(index)}
            disabled={!canRemove}
            aria-label={`Remove ${name}`}
            className="p-1.5 text-ink-faint hover:text-danger disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      {children}
    </div>
  );
}
