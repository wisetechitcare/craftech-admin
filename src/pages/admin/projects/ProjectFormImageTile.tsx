import { Loader2, Trash2 } from "lucide-react";

import {
  DragHandle,
  dragStateClasses,
  useDragItem,
} from "@/components/admin/ui/DragList";

import { DragList } from "@/lib/constants/drag-lists";
import { cn } from "@/utils/utils";

interface ProjectFormImageTileProps {
  src: string;
  index: number;
  count: number;
  listId: DragList.PROJECT_IMAGES | DragList.PROJECT_IMAGES_PENDING;
  onMove: (from: number, to: number) => void;
  onDelete: () => void;
  deleting?: boolean;
}

export function ProjectFormImageTile({
  src,
  index,
  count,
  listId,
  onMove,
  onDelete,
  deleting = false,
}: ProjectFormImageTileProps) {
  const { ref, handleProps, isDragging, isTarget } = useDragItem({
    listId,
    index,
    onMove,
    disabled: count < 2,
  });

  return (
    <div
      ref={ref}
      className={cn("space-y-1", dragStateClasses(isDragging, isTarget))}
    >
      <div
        className={cn(
          "relative aspect-square overflow-hidden rounded-lg border border-line bg-raise",
          index === 0 && "ring-2 ring-brand",
        )}
      >
        <img
          src={src}
          alt=""
          draggable={false}
          className="h-full w-full object-cover"
        />
        {index === 0 ? (
          <span className="absolute bottom-2 left-2 rounded-md bg-brand px-2 py-0.5 text-xs font-bold text-white">
            Cover
          </span>
        ) : (
          <span className="absolute bottom-2 left-2 rounded-md bg-paper px-2 py-0.5 text-xs font-bold text-ink">
            {index + 1}
          </span>
        )}
        <DragHandle
          {...handleProps}
          label={`Image ${index + 1}`}
          className="absolute left-2 top-2 rounded-md bg-paper"
        />
        <button
          type="button"
          onClick={onDelete}
          disabled={deleting}
          className="absolute right-2 top-2 rounded-lg bg-danger/90 p-1.5 text-white"
          aria-label="Remove image"
        >
          {deleting ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <Trash2 className="size-3.5" />
          )}
        </button>
      </div>
    </div>
  );
}
