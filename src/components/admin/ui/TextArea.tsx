import { forwardRef } from "react";
import type { FieldError } from "react-hook-form";

import { InfoTooltip } from "./Tooltip";

import { cn } from "@/utils/utils";

export interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  required?: boolean;
  labelClassName?: string;
  error?: boolean | FieldError;
  hint?: React.ReactNode;
  maxChars?: number;
  tooltip?: React.ReactNode;
}

const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  (
    {
      placeholder,
      rows = 3,
      value,
      onChange,
      className,
      disabled = false,
      label,
      required = false,
      labelClassName,
      error,
      hint,
      maxChars,
      tooltip,
      ...rest
    },
    ref,
  ) => {
    const length = String(value ?? "").length;
    const over = maxChars !== undefined && length > maxChars;
    const hasError =
      over || (typeof error === "boolean" ? error : Boolean(error));
    const resolvedHint =
      hint ?? (typeof error === "object" && error ? error.message : undefined);

    return (
      <div>
        {(label || tooltip || maxChars !== undefined) && (
          <div className="mb-2 flex items-baseline justify-between gap-3">
            <div className="flex items-center gap-1.5">
              <label
                className={cn(
                  "block text-sm font-medium text-black",
                  labelClassName,
                )}
              >
                {label}
                {required && <span className="text-error-500"> *</span>}
              </label>
              {tooltip && <InfoTooltip content={tooltip} label={label} />}
            </div>
            {maxChars !== undefined && (
              <span
                className={cn(
                  "text-xs font-semibold tabular-nums",
                  over ? "text-error-500" : "text-gray-500",
                )}
              >
                {length} / {maxChars}
              </span>
            )}
          </div>
        )}

        <div className="relative">
          <textarea
            ref={ref}
            placeholder={placeholder}
            rows={rows}
            value={value}
            onChange={onChange}
            disabled={disabled}
            required={required}
            className={cn(
              "w-full rounded-lg border px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30",
              disabled &&
                "cursor-not-allowed border-gray-300 bg-gray-100 text-gray-500 opacity-40 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400",
              !disabled &&
                hasError &&
                "border-error-500 focus:border-error-300 focus:ring-error-500/20 dark:border-error-500 dark:text-error-400 dark:focus:border-error-800",
              !disabled &&
                !hasError &&
                "border-gray-300 bg-transparent text-gray-800 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:text-white/90 dark:focus:border-brand-800",
              className,
            )}
            {...rest}
          />
        </div>

        {resolvedHint && (
          <p
            className={cn(
              "mt-1.5 text-xs",
              hasError ? "text-error-500" : "text-gray-500",
            )}
          >
            {resolvedHint}
          </p>
        )}
      </div>
    );
  },
);

TextArea.displayName = "TextArea";

export default TextArea;
