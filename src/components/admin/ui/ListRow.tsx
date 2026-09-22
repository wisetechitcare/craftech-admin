import React from "react";
import { Trash2 } from "lucide-react";

import {
  DRAG_GRIP_ON_CARD_CLASS,
  DragHandle,
  dragStateClasses,
  useDragItem,
} from "./DragList";

import { Button } from "@/components/ui/button";
import { cn } from "@/utils/utils";

export type ListRowChrome = "default" | "grip";

interface ListRowProps {
  /** Used in the default header and for reorder affordance labels. */
  title?: string;
  index: number;
  count: number;
  onMove: (from: number, to: number) => void;
  onRemove: (index: number) => void;
  listId?: string;
  canRemove?: boolean;
  /** When false, the remove control is not rendered (e.g. Navbar links). Default true. */
  showRemove?: boolean;
  /** default: optional title row plus drag handle and delete. grip: edge grip (About / Navbar-style). */
  chrome?: ListRowChrome;
  /** Hides the default header title; drag handle and delete stay unless chrome is grip. */
  showTitle?: boolean;
  children: React.ReactNode;
}

export default function ListRow({
  title = "Item",
  index,
  count,
  onMove,
  onRemove,
  listId,
  canRemove = true,
  showRemove = true,
  chrome = "default",
  showTitle = true,
  children,
}: ListRowProps) {
  const name = `${title} ${index + 1}`;
  const draggable = Boolean(listId) && count > 1;
  const gripChrome = chrome === "grip";

  const { ref, handleProps, isDragging, isTarget } = useDragItem({
    listId: listId ?? "",
    index,
    onMove,
    disabled: !draggable,
  });

  const cardClassName = cn(
    "bg-raise border border-line rounded-xl p-4",
    !gripChrome && "space-y-1",
    !gripChrome && dragStateClasses(isDragging, isTarget),
  );

  const removeButton = (
    <Button
      type="button"
      variant="none"
      onClick={() => onRemove(index)}
      disabled={!canRemove}
      aria-label={`Remove ${name}`}
      className="p-1.5 text-ink-faint hover:text-danger disabled:opacity-30 disabled:cursor-not-allowed"
    >
      <Trash2 className="size-5" />
    </Button>
  );

  if (gripChrome) {
    return (
      <div
        ref={ref}
        className={cn(
          "relative rounded-xl",
          dragStateClasses(isDragging, isTarget),
        )}
      >
        {draggable && (
          <DragHandle
            {...handleProps}
            label={title}
            className={DRAG_GRIP_ON_CARD_CLASS}
          />
        )}
        <div className={cardClassName}>
          {showRemove && (
            <div className="mb-2 flex justify-end">{removeButton}</div>
          )}
          {children}
        </div>
      </div>
    );
  }

  return (
    <div ref={ref} className={cardClassName}>
      <div className="flex items-center justify-between">
        {showTitle ? (
          <span className="text-base font-medium uppercase">{name}</span>
        ) : (
          <span className="sr-only">{name}</span>
        )}
        <div className={cn("flex items-center gap-1", !showTitle && "ml-auto")}>
          {listId && <DragHandle {...handleProps} label={name} />}
          {showRemove && removeButton}
        </div>
      </div>
      {children}
    </div>
  );
}
