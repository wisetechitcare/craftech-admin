import { useRef, useState, type PointerEvent, type ReactNode } from "react";
import { Image, LayoutGrid, MousePointer2, Type } from "lucide-react";

import { KaiznovaLogo } from "@/components/common/KaiznovaBrand";

import { cn } from "@/utils/utils";

interface Point {
  x: number;
  y: number;
}

interface DraggableBlockProps {
  placeClass: string;
  className?: string;
  children: ReactNode;
}

function DraggableBlock({
  placeClass,
  className,
  children,
}: DraggableBlockProps) {
  const [pos, setPos] = useState<Point | null>(null);
  const dragRef = useRef<{
    pointerX: number;
    pointerY: number;
    originX: number;
    originY: number;
  } | null>(null);

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    let origin = pos;
    if (!origin) {
      origin = {
        x: event.currentTarget.offsetLeft,
        y: event.currentTarget.offsetTop,
      };
      setPos(origin);
    }

    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      pointerX: event.clientX,
      pointerY: event.clientY,
      originX: origin.x,
      originY: origin.y,
    };
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current) return;
    const { pointerX, pointerY, originX, originY } = dragRef.current;
    setPos({
      x: originX + event.clientX - pointerX,
      y: originY + event.clientY - pointerY,
    });
  };

  const endDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (dragRef.current) {
      dragRef.current = null;
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  return (
    <div
      className={cn(
        "absolute touch-none cursor-grab active:cursor-grabbing select-none",
        pos === null && placeClass,
        className,
      )}
      style={pos ? { left: pos.x, top: pos.y } : undefined}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    >
      {children}
    </div>
  );
}

const blockShell =
  "rounded-xl border border-line bg-paper p-3 shadow-sm ring-1 ring-line/60";

const LoginBuilderBackdrop = () => (
  <div className="relative hidden lg:flex lg:col-span-3 flex-col justify-between overflow-hidden border-r border-line bg-canvas">
    <div className="relative z-10 p-10 xl:p-14 space-y-4">
      <KaiznovaLogo className="max-w-md" />
      <p className="text-xl text-ink font-semibold max-w-sm">
        Drag the blocks below — same freedom you get when building pages.
      </p>
    </div>

    <div className="relative z-10 flex-1 min-h-64 mx-10 xl:mx-14 mb-10">
      <DraggableBlock placeClass="left-0 top-8" className="-rotate-6">
        <div className={cn(blockShell, "w-52 border-cyan-400/30")}>
          <div className="flex items-center gap-1.5 mb-2 text-ink-soft">
            <LayoutGrid className="size-3.5 text-cyan-500" />
            <span className="text-xs font-semibold uppercase tracking-wide">
              Hero
            </span>
          </div>
          <div className="h-2 w-20 rounded bg-violet-500/50 mb-2" />
          <div className="h-2 w-full rounded bg-raise mb-3" />
          <div className="h-16 rounded-lg border border-dashed border-line bg-raise" />
        </div>
      </DraggableBlock>

      <DraggableBlock placeClass="left-1/3 top-0" className="rotate-3">
        <div className={cn(blockShell, "w-44")}>
          <div className="flex items-center gap-1.5 mb-2 text-ink-soft">
            <Type className="size-3.5 text-brand" />
            <span className="text-xs font-semibold uppercase tracking-wide">
              Copy
            </span>
          </div>
          <div className="space-y-1.5">
            <div className="h-1.5 w-full rounded bg-line" />
            <div className="h-1.5 w-4/5 rounded bg-line-2" />
            <div className="h-1.5 w-3/5 rounded bg-raise" />
          </div>
        </div>
      </DraggableBlock>

      <DraggableBlock placeClass="right-4 top-16" className="rotate-6">
        <div className={cn(blockShell, "w-40 p-2")}>
          <div className="flex items-center gap-1.5 mb-2 px-1 text-ink-soft">
            <Image className="size-3.5 text-violet-600" />
            <span className="text-xs font-semibold uppercase tracking-wide">
              Gallery
            </span>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            <div className="aspect-square rounded-md bg-brand/35 border border-line" />
            <div className="aspect-square rounded-md bg-violet-500/30 border border-line" />
            <div className="aspect-square rounded-md bg-raise border border-line" />
            <div className="aspect-square rounded-md bg-cyan-400/25 border border-line" />
          </div>
        </div>
      </DraggableBlock>

      <DraggableBlock placeClass="left-12 bottom-4">
        <div
          className={cn(
            blockShell,
            "w-56 border-violet-500/45 ring-2 ring-violet-500/25 shadow-md",
          )}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
              Section
            </span>
            <MousePointer2 className="size-3.5 text-cyan-500" />
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            <div className="h-8 rounded bg-raise border border-line" />
            <div className="h-8 rounded bg-raise border border-line" />
            <div className="h-8 rounded bg-violet-500/35 border border-violet-500/40" />
          </div>
        </div>
      </DraggableBlock>
    </div>
  </div>
);

export default LoginBuilderBackdrop;
