import { Trash2, Type } from "lucide-react";

import {
  DragHandle,
  dragStateClasses,
  useDragItem,
} from "@/components/admin/ui/DragList";
import { Button } from "@/components/ui/button";

import { DragList } from "@/lib/constants/drag-lists";
import { richTextToPlain } from "@/lib/editor";
import type { GalleryImage } from "@/types/gallery";
import { cn } from "@/utils/utils";

interface GalleryTileProps {
  image: GalleryImage;
  index: number;
  count: number;
  onMove: (from: number, to: number) => void;
  onDelete: (id: string) => void;
  selected: boolean;
  onSelect: (id: string, selected: boolean) => void;
  /** Off while Image Style's "Caption on hover" is, since nothing would show. */
  showCaption: boolean;
  onEditCaption: (id: string) => void;
}

const GalleryTile = ({
  image,
  index,
  count,
  onMove,
  onDelete,
  selected,
  onSelect,
  showCaption,
  onEditCaption,
}: GalleryTileProps) => {
  const { ref, handleProps, isDragging, isTarget } = useDragItem({
    listId: DragList.GALLERY_IMAGES,
    index,
    onMove,
    disabled: count < 2,
  });
  const caption =
    richTextToPlain(image.title) || richTextToPlain(image.description);

  return (
    <div
      ref={ref}
      className={cn("space-y-2", dragStateClasses(isDragging, isTarget))}
    >
      <div
        className={cn(
          "relative aspect-square overflow-hidden rounded-xl border border-line bg-raise",
          selected && "ring-2 ring-danger",
        )}
      >
        <img
          src={image.url}
          alt={image.name}
          draggable={false}
          className="h-full w-full object-cover"
        />
        <span className="absolute bottom-2 left-2 rounded-md bg-paper px-2 py-0.5 text-xs font-bold text-ink">
          {index + 1}
        </span>
        <input
          type="checkbox"
          checked={selected}
          onChange={(e) => onSelect(image._id, e.target.checked)}
          aria-label={`Select ${image.name}`}
          className="absolute bottom-2 right-2 size-4 rounded border-line"
        />
        <DragHandle
          {...handleProps}
          label={image.name}
          className="absolute left-2 top-2 rounded-md bg-paper"
        />
        <Button
          variant="none"
          onClick={() => onDelete(image._id)}
          className="absolute right-2 top-2 rounded-lg bg-danger/10 p-2 text-danger transition-colors hover:bg-danger/15"
          title="Delete"
        >
          <Trash2 size={16} />
        </Button>
      </div>
      {showCaption && (
        <Button
          variant="none"
          size="xs"
          onClick={() => onEditCaption(image._id)}
          startIcon={<Type className="size-4 shrink-0" />}
          className={cn(
            "w-full justify-start gap-2 rounded-lg border px-3 text-xs",
            caption
              ? "border-line bg-paper text-ink hover:bg-raise"
              : "border-dashed border-line text-ink-faint hover:text-ink",
          )}
        >
          <span className="truncate">{caption || "Add caption"}</span>
        </Button>
      )}
    </div>
  );
};

export default GalleryTile;
