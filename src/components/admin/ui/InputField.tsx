import { forwardRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import type { FieldError } from "react-hook-form";

import { cn } from "../../../utils/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  required?: boolean;
  labelClassName?: string;
  error?: boolean | FieldError;
  hint?: React.ReactNode;
  warning?: React.ReactNode;
  maxChars?: number;
  multiline?: boolean;
  rows?: number;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      type = "text",
      name,
      placeholder,
      value,
      onChange,
      className,
      autoComplete,
      min,
      max,
      step,
      disabled = false,
      label,
      required = false,
      labelClassName,
      error,
      hint,
      warning,
      maxChars,
      multiline = false,
      rows = 2,
      ...rest
    },
    ref,
  ) => {
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const isPasswordField = !multiline && type === "password";
    const inputType = isPasswordField && showPassword ? "text" : type;
    const length = String(value ?? "").length;
    const over = maxChars !== undefined && length > maxChars;
    const hasError =
      over || (typeof error === "boolean" ? error : Boolean(error));
    const resolvedHint =
      hint ?? (typeof error === "object" && error ? error.message : undefined);

    const fieldClassName = cn(
      "w-full appearance-none rounded-lg border px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30",
      multiline ? "resize-y" : "h-11",
      isPasswordField && "pr-11",
      disabled &&
        "cursor-not-allowed border-gray-300 bg-gray-100 text-gray-500 opacity-40 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400",
      !disabled &&
        hasError &&
        "border-error-500 focus:border-error-300 focus:ring-error-500/20 dark:border-error-500 dark:text-error-400 dark:focus:border-error-800",
      !disabled &&
        !hasError &&
        "border-gray-300 bg-transparent text-gray-800 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:text-white/90 dark:focus:border-brand-800",
      className,
    );

    return (
      <div>
        {(label || maxChars !== undefined) && (
          <div className="mb-2 flex items-baseline justify-between gap-3">
            <label
              className={cn(
                "block text-sm font-medium text-black",
                labelClassName,
              )}
            >
              {label}
              {required && <span className="text-error-500"> *</span>}
            </label>
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
          {multiline ? (
            <textarea
              ref={ref as unknown as React.Ref<HTMLTextAreaElement>}
              name={name}
              placeholder={placeholder}
              value={value}
              onChange={
                onChange as unknown as React.ChangeEventHandler<HTMLTextAreaElement>
              }
              rows={rows}
              disabled={disabled}
              autoComplete={autoComplete}
              className={fieldClassName}
              {...(rest as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
            />
          ) : (
            <input
              ref={ref}
              type={inputType}
              name={name}
              placeholder={placeholder}
              value={value}
              onChange={onChange}
              min={min}
              max={max}
              step={step}
              disabled={disabled}
              autoComplete={autoComplete}
              className={fieldClassName}
              {...rest}
            />
          )}

          {isPasswordField && (
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 transition-colors duration-200 hover:text-gray-700 focus:outline-none dark:text-gray-400 dark:hover:text-gray-200"
            >
              {showPassword ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </button>
          )}
        </div>

        {resolvedHint && (
          <p
            className={cn(
              "mt-1.5 text-xs leading-relaxed",
              hasError ? "text-error-500" : "text-gray-500",
            )}
          >
            {resolvedHint}
          </p>
        )}
        {!hasError && warning && (
          <p className="mt-1.5 text-xs text-warn">{warning}</p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";

export default Input;
