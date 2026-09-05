import React from 'react';
import { ArrowDown, ArrowUp, Trash2 } from 'lucide-react';

interface ListRowProps {
  title: string;
  index: number;
  count: number;
  onMove: (from: number, to: number) => void;
  onRemove: (index: number) => void;
  children: React.ReactNode;
}

/**
 * One entry in an ordered About list, with its reorder and delete controls.
 *
 * Move is a pair of buttons rather than drag-and-drop on purpose: the lists are
 * short (4-12 rows), the buttons work on touch and with a keyboard for free,
 * and there is no library to add. Order is the array's own order — the server
 * stores the list as written, so there is nothing to renumber here.
 */
export default function ListRow({ title, index, count, onMove, onRemove, children }: ListRowProps) {
  return (
    <div className="bg-raise border border-line rounded-xl p-4 space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold text-ink-faint uppercase tracking-wider">
          {title} {index + 1}
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onMove(index, index - 1)}
            disabled={index === 0}
            aria-label={`Move ${title} ${index + 1} up`}
            className="p-1.5 text-ink-faint hover:text-ink disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onMove(index, index + 1)}
            disabled={index === count - 1}
            aria-label={`Move ${title} ${index + 1} down`}
            className="p-1.5 text-ink-faint hover:text-ink disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ArrowDown className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onRemove(index)}
            aria-label={`Remove ${title} ${index + 1}`}
            className="p-1.5 text-ink-faint hover:text-danger"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      {children}
    </div>
  );
}
