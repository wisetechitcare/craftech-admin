import React from 'react';

interface HeroFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  /** Character limit for this field under the ACTIVE Hero variant. Served with
   *  the Hero payload, never hardcoded here — see types/hero.ts. */
  max?: number;
  helper?: React.ReactNode;
  /** Server-side message for this field, keyed by its zod path. */
  error?: string;
  /** Non-blocking note — e.g. a title with more than one comma. */
  warning?: string;
  multiline?: boolean;
  rows?: number;
  placeholder?: string;
}

/**
 * One labelled Hero input with a live character counter measured against the
 * limit the server will actually enforce. Going over is allowed while typing —
 * the counter turns red and Save is blocked — rather than silently truncating,
 * so an admin pasting long copy can see exactly how much has to go.
 */
export default function HeroField({
  label, value, onChange, max, helper, error, warning, multiline, rows = 2, placeholder,
}: HeroFieldProps) {
  const over = max !== undefined && value.length > max;
  const inputClass = `w-full px-3 py-2 bg-paper border rounded-lg text-ink text-sm transition-colors ${
    error || over ? 'border-danger' : 'border-line'
  }`;

  return (
    <div>
      <div className="flex items-baseline justify-between mb-1.5 gap-3">
        <label className="block text-[10px] font-bold text-ink-faint uppercase tracking-wider">
          {label}
        </label>
        {max !== undefined && (
          <span className={`text-[10px] font-semibold tabular-nums ${over ? 'text-danger' : 'text-ink-faint'}`}>
            {value.length} / {max}
          </span>
        )}
      </div>

      {multiline ? (
        <textarea rows={rows} className={inputClass} value={value} placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input type="text" className={inputClass} value={value} placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)} />
      )}

      {error && <p className="mt-1 text-[11px] text-danger">{error}</p>}
      {!error && over && max !== undefined && (
        <p className="mt-1 text-[11px] text-danger">
          {value.length - max} character{value.length - max === 1 ? '' : 's'} over the limit for this Hero style.
        </p>
      )}
      {!error && !over && warning && <p className="mt-1 text-[11px] text-warn">{warning}</p>}
      {helper && <p className="mt-1 text-[11px] text-ink-faint leading-relaxed">{helper}</p>}
    </div>
  );
}
