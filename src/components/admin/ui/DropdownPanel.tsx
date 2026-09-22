import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";

import { cn } from "@/utils/utils";

export interface DropdownPanelProps {
  anchorRef: RefObject<HTMLElement | null>;
  open: boolean;
  onClose: () => void;
  /** Widths and padding. The panel is at least as wide as its anchor. */
  className?: string;
  children: ReactNode;
}

const GAP = 4;
// Below this the panel opens upwards instead, if there is more room there.
const MIN_SPACE_BELOW = 220;

/**
 * A floating panel portalled into `document.body` and positioned against its
 * anchor. An absolutely positioned dropdown is clipped by the first ancestor
 * with `overflow: hidden` — a card, a list row, the editor's bordered box; a
 * portal has no ancestors to be clipped by.
 */
export default function DropdownPanel({
  anchorRef,
  open,
  onClose,
  className,
  children,
}: DropdownPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<CSSProperties | null>(null);

  // Position can only be measured from the live DOM, so this is state set from
  // an effect on purpose — the anchor's rect is the external system.
  useLayoutEffect(() => {
    if (!open) {
      setStyle(null);
      return;
    }

    const place = () => {
      const anchor = anchorRef.current;
      if (!anchor) return;

      const rect = anchor.getBoundingClientRect();
      const below = window.innerHeight - rect.bottom - GAP;
      const above = rect.top - GAP;
      const flip = below < MIN_SPACE_BELOW && above > below;

      setStyle({
        position: "fixed",
        left: rect.left,
        minWidth: rect.width,
        maxHeight: Math.max(0, (flip ? above : below) - GAP),
        ...(flip
          ? { bottom: window.innerHeight - rect.top + GAP }
          : { top: rect.bottom + GAP }),
      });
    };

    place();
    window.addEventListener("resize", place);
    // Capture, so a scroll in ANY ancestor repositions the panel — the admin
    // scrolls <main>, not the window.
    window.addEventListener("scroll", place, true);

    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open, anchorRef]);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (anchorRef.current?.contains(target)) return;
      if (panelRef.current?.contains(target)) return;
      onClose();
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, anchorRef, onClose]);

  if (!open || !style) return null;

  return createPortal(
    <div
      ref={panelRef}
      style={style}
      className={cn(
        "z-50 overflow-auto rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900",
        className,
      )}
    >
      {children}
    </div>,
    document.body,
  );
}
