import { AlertTriangle, Loader2 } from "lucide-react";

import Modal from "@/components/admin/ui/Modal";

import { cn } from "@/utils/utils";

interface ConfirmModalProps {
  open: boolean;
  title: string;
  message?: string;
  onConfirm?: () => void;
  onCancel: () => void;
  loading?: boolean;
  danger?: boolean;
  confirmLabel?: string;
}

export default function ConfirmModal({
  open,
  title,
  message,
  onConfirm,
  onCancel,
  loading,
  danger = true,
  confirmLabel = "Confirm Delete",
}: ConfirmModalProps) {
  return (
    <Modal
      open={open}
      title={title}
      onClose={onCancel}
      footer={
        <>
          <button onClick={onCancel} className="btn-ghost" disabled={loading}>
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={danger ? "btn-danger" : "btn-primary"}
            disabled={loading}
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? "Deleting..." : confirmLabel}
          </button>
        </>
      }
    >
      <div className="flex items-start gap-3">
        <AlertTriangle
          className={cn(
            "w-5 h-5 shrink-0",
            danger ? "text-danger" : "text-navy",
          )}
        />
        <p className="text-ink-soft text-sm">{message}</p>
      </div>
    </Modal>
  );
}
