import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { MoreVertical, Pencil, Trash2, Eye } from "lucide-react";

import {
  DragHandle,
  dragStateClasses,
  useDragItem,
} from "@/components/admin/ui/DragList";
import { ImageCarousel } from "@/components/common/Carousel";

import { DragList } from "@/lib/constants/drag-lists";
import { cn } from "@/utils/utils";

export interface AdminProjectRow {
  _id: string;
  title: string;
  slug?: string;
  category: string;
  client: string;
  location: string;
  year: number | string;
  area?: string;
  withCollaboration?: string;
  description?: string;
  thumbnail?: string;
  images?: string[];
  status?: string;
}

interface ProjectAdminCardProps {
  project: AdminProjectRow;
  index: number;
  count: number;
  onMove: (from: number, to: number) => void;
  reorderEnabled: boolean;
  onDelete: () => void;
}

export function projectCarouselImages(project: AdminProjectRow): string[] {
  const list = [
    ...(project.thumbnail ? [project.thumbnail] : []),
    ...(project.images ?? []),
  ];
  return [...new Set(list)];
}

export default function ProjectAdminCard({
  project,
  index,
  count,
  onMove,
  reorderEnabled,
  onDelete,
}: ProjectAdminCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const images = projectCarouselImages(project);
  const detailHref = `/admin/projects/${project._id}`;
  const { ref, handleProps, isDragging, isTarget } = useDragItem({
    listId: DragList.PROJECT_CARDS,
    index,
    onMove,
    disabled: !reorderEnabled || count < 2,
  });

  useEffect(() => {
    if (!menuOpen) return;
    const close = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [menuOpen]);

  return (
    <article
      ref={ref}
      className={cn(
        "overflow-hidden rounded-2xl border border-line bg-paper shadow-sm transition-shadow hover:shadow-md",
        dragStateClasses(isDragging, isTarget),
      )}
    >
      <div className="relative">
        {reorderEnabled ? (
          <DragHandle
            {...handleProps}
            label={project.title}
            className="absolute left-2 top-2 z-10 rounded-lg bg-paper"
          />
        ) : null}
        <Link to={detailHref} className="block">
          <ImageCarousel
            images={images}
            className="h-48 w-full shrink rounded-none sm:h-52"
          />
        </Link>
      </div>

      <div className="space-y-3 p-4">
        <div className="flex items-start gap-2 border-b border-line pb-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-mute">
              Project
            </p>
            <Link
              to={detailHref}
              className="mt-0.5 block text-base font-bold leading-snug text-ink line-clamp-2 hover:text-brand"
            >
              {project.title}
            </Link>
          </div>
          <div className="relative shrink-0" ref={menuRef}>
            <button
              type="button"
              aria-label="Project actions"
              onClick={() => setMenuOpen((open) => !open)}
              className="rounded-lg border border-line p-2 text-ink-mute transition-colors hover:bg-raise hover:text-ink"
            >
              <MoreVertical className="size-4" />
            </button>
            {menuOpen ? (
              <div className="absolute right-0 top-full z-20 mt-1 min-w-36 overflow-hidden rounded-xl border border-line bg-paper py-1 shadow-lg">
                <Link
                  to={detailHref}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-ink hover:bg-raise"
                  onClick={() => setMenuOpen(false)}
                >
                  <Eye className="size-3.5" /> View
                </Link>
                <Link
                  to={`/admin/projects/${project._id}/edit`}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-ink hover:bg-raise"
                  onClick={() => setMenuOpen(false)}
                >
                  <Pencil className="size-3.5" /> Edit
                </Link>
                <button
                  type="button"
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-danger hover:bg-raise"
                  onClick={() => {
                    setMenuOpen(false);
                    onDelete();
                  }}
                >
                  <Trash2 className="size-3.5" /> Delete
                </button>
              </div>
            ) : null}
          </div>
        </div>

        <p className="text-sm text-ink-mute">
          <span className="font-semibold text-ink">Client :</span>{" "}
          {project.client}
        </p>
        <p className="text-sm text-ink-mute">
          <span className="font-semibold text-ink">Location :</span>{" "}
          {project.location}
        </p>
        <p className="text-xs text-ink-faint">
          {project.category} · {project.year}
        </p>
      </div>
    </article>
  );
}
