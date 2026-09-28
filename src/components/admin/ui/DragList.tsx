import { forwardRef, useEffect, useRef, useState } from "react";
import { GripVertical, Lock } from "lucide-react";
import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import {
  draggable,
  dropTargetForElements,
} from "@atlaskit/pragmatic-drag-and-drop/element/adapter";

import { Tooltip } from "./Tooltip";

import { cn } from "@/utils/utils";

/** A symbol, so files dragged in from the desktop can never look like a row. */
const DRAG_ITEM = Symbol("dragItem");

/** Pressing one of these never picks the card up — it types, selects text or
 *  clicks instead. Kept in step with the grab-cursor rule in index.css. */
const CONTROLS = "input, textarea, select, button, a, [contenteditable='true']";

type DragItemData = { listId: string; index: number };

const isDragItem = (
  data: Record<string | symbol, unknown>,
): data is DragItemData => data[DRAG_ITEM] === true;

interface DragItemOptions {
  /** Rows may only be dropped on rows sharing this id. Unique per list. */
  listId: string;
  index: number;
  onMove: (from: number, to: number) => void;
  disabled?: boolean;
}

export function useDragItem<T extends HTMLElement = HTMLDivElement>({
  listId,
  index,
  onMove,
  disabled = false,
}: DragItemOptions) {
  const ref = useRef<T>(null);
  const handleRef = useRef<HTMLButtonElement>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isTarget, setIsTarget] = useState<boolean>(false);

  // Callers pass an inline arrow, so keeping onMove in the effect's deps would
  // tear the adapter down on every render, mid-drag included.
  const move = useRef(onMove);
  useEffect(() => {
    move.current = onMove;
  });

  useEffect(() => {
    const element = ref.current;
    if (!element || disabled) return;

    const payload = () => ({ [DRAG_ITEM]: true, listId, index });

    // The whole card is the drag source. Toggling `draggable` rather than
    // refusing in canDrag is what keeps text selectable inside its fields:
    // Firefox never starts a selection inside a draggable element.
    const allowDragFrom = (event: PointerEvent) => {
      const target = event.target as Element;
      element.draggable =
        !!handleRef.current?.contains(target) || !target.closest(CONTROLS);
    };
    const restoreDrag = () => {
      element.draggable = true;
    };
    element.addEventListener("pointerdown", allowDragFrom, true);
    document.addEventListener("pointerup", restoreDrag);

    return combine(
      () => {
        element.removeEventListener("pointerdown", allowDragFrom, true);
        document.removeEventListener("pointerup", restoreDrag);
      },
      draggable({
        element,
        getInitialData: payload,
        onDragStart: () => setIsDragging(true),
        onDrop: () => setIsDragging(false),
      }),
      dropTargetForElements({
        element,
        getData: payload,
        canDrop: ({ source }) =>
          isDragItem(source.data) &&
          source.data.listId === listId &&
          source.data.index !== index,
        onDragEnter: () => setIsTarget(true),
        onDragLeave: () => setIsTarget(false),
        onDrop: ({ source }) => {
          setIsTarget(false);
          if (isDragItem(source.data)) move.current(source.data.index, index);
        },
      }),
    );
  }, [listId, index, disabled]);

  return {
    ref,
    handleProps: {
      ref: handleRef,
      disabled,
      onKeyDown: (event: React.KeyboardEvent<HTMLButtonElement>) => {
        const to =
          event.key === "ArrowUp"
            ? index - 1
            : event.key === "ArrowDown"
              ? index + 1
              : null;
        if (to === null) return;
        event.preventDefault();
        move.current(index, to);
      },
    },
    isDragging,
    isTarget,
  };
}

export const DRAG_GRIP_ON_CARD_CLASS =
  "absolute -top-2 left-4 z-10 rounded-md border border-line bg-raise p-1 shadow-sm hover:border-info";

interface DragHandleProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
}

export const DragHandle = forwardRef<HTMLButtonElement, DragHandleProps>(
  ({ label, className, ...props }, ref) => (
    <Tooltip content="Drag anywhere on this item to reorder it.">
      <button
        ref={ref}
        type="button"
        aria-label={`Reorder ${label}. Use the arrow keys, or drag.`}
        className={cn(
          "p-1.5 text-ink-faint hover:text-ink cursor-grab active:cursor-grabbing",
          "disabled:opacity-30 disabled:cursor-not-allowed",
          className,
        )}
        {...props}
      >
        <GripVertical className="w-4 h-4" />
      </button>
    </Tooltip>
  ),
);

DragHandle.displayName = "DragHandle";

export const dragStateClasses = (isDragging: boolean, isTarget: boolean) =>
  cn(
    isDragging && "opacity-40",
    isTarget && "ring-2 ring-info ring-offset-2 ring-offset-canvas",
  );

interface DragBlockProps {
  listId: string;
  index: number;
  label: string;
  onMove: (from: number, to: number) => void;
  /** Why this block cannot be moved. Shown in place of the handle, because a
   *  block that simply has no handle reads as an oversight. */
  pinnedReason?: string;
  children: React.ReactNode;
}

/** Drag-to-reorder around a whole card, where the handle has to sit on the
 *  card's edge instead of inside a header the card already owns. */
export const DragBlock = ({
  listId,
  index,
  label,
  onMove,
  pinnedReason,
  children,
}: DragBlockProps) => {
  const { ref, handleProps, isDragging, isTarget } = useDragItem({
    listId,
    index,
    onMove,
    disabled: !!pinnedReason,
  });

  return (
    <div
      ref={ref}
      className={cn(
        "relative rounded-xl",
        dragStateClasses(isDragging, isTarget),
      )}
    >
      {pinnedReason ? (
        <span
          title={pinnedReason}
          className="absolute -top-2 left-4 z-10 flex items-center gap-1 rounded-md border border-line bg-raise px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-ink-faint"
        >
          <Lock className="w-3 h-3" /> Fixed here
        </span>
      ) : (
        <DragHandle
          {...handleProps}
          label={label}
          className={DRAG_GRIP_ON_CARD_CLASS}
        />
      )}
      {children}
    </div>
  );
};
