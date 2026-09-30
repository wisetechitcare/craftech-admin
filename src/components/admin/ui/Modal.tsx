import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";

import { cn } from "@/utils/utils";

interface ModalProps {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  /** The action row, right-aligned under the body. */
  footer?: ReactNode;
  /** Width, e.g. "max-w-4xl"; a confirm-sized dialog otherwise. */
  className?: string;
  children: ReactNode;
}

/** A centred dialog. Portalled to <body> like DropdownPanel, so a picker opened
 *  from inside it still paints above it. Escape closes; a click on the backdrop
 *  does not, so a half-written form is never lost to a stray click. */
const Modal = ({
  open,
  title,
  description,
  onClose,
  footer,
  className,
  children,
}: ModalProps) => {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/45 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          "flex max-h-full w-full max-w-md flex-col rounded-xl border border-line bg-paper",
          className,
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-line px-6 py-4">
          <div>
            <h3 className="font-semibold text-ink">{title}</h3>
            {description && (
              <p className="mt-1 text-xs text-ink-faint">{description}</p>
            )}
          </div>
          <Button
            variant="none"
            size="xs"
            onClick={onClose}
            aria-label="Close"
            className="text-ink-faint hover:text-ink"
          >
            <X className="size-5" />
          </Button>
        </div>
        <div className="overflow-y-auto px-6 py-5">{children}</div>
        {footer && (
          <div className="flex justify-end gap-3 border-t border-line px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
};

export default Modal;
