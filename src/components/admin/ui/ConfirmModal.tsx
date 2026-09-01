import React from 'react';
import { AlertTriangle, X, Loader2 } from 'lucide-react';

interface ConfirmModalProps {
  open: boolean;
  title?: string;
  message?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  loading?: boolean;
  danger?: boolean;
}

export default function ConfirmModal({ open, title, message, onConfirm, onCancel, loading, danger = true }: ConfirmModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/45">
      <div className="card w-full max-w-md">
        <div className="card-header flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${danger ? 'bg-danger/10' : 'bg-navy/10'}`}>
              <AlertTriangle className={`w-5 h-5 ${danger ? 'text-danger' : 'text-navy'}`} />
            </div>
            <h3 className="font-semibold text-ink">{title}</h3>
          </div>
          <button onClick={onCancel} className="text-ink-faint hover:text-ink">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="card-body space-y-4">
          <p className="text-ink-soft text-sm">{message}</p>
          <div className="flex gap-3 justify-end">
            <button onClick={onCancel} className="btn-ghost" disabled={loading}>Cancel</button>
            <button
              onClick={onConfirm}
              className={danger ? 'btn-danger' : 'btn-primary'}
              disabled={loading}
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Deleting...' : 'Confirm Delete'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
