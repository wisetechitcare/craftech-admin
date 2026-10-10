import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import type { FieldError } from "react-hook-form";
import { ChevronDown, Search } from "lucide-react";

import DropdownPanel from "./DropdownPanel";
import { InfoTooltip } from "./Tooltip";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  selectContentClassName,
  selectItemClassName,
  selectTriggerClassName,
} from "@/components/ui/select";
import { useClickOutside } from "@/hooks";
import {
  SELECT_CREATABLE_EMPTY_MESSAGE,
  SELECT_EMPTY_MESSAGE,
  SELECT_LOADING_PLACEHOLDER,
  SELECT_SEARCH_PLACEHOLDER,
} from "@/lib/constants/common";
import { cn } from "@/utils/utils";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectFieldProps {
  label?: string;
  required?: boolean;
  labelClassName?: string;
  error?: boolean | FieldError;
  hint?: string;
  tooltip?: ReactNode;
  labelAction?: ReactNode;
  options: SelectOption[];
  value?: string;
  onValueChange?: (value: string) => void;
  onOptionSelect?: (option: SelectOption) => void;
  placeholder?: string;
  disabled?: boolean;
  loading?: boolean;
  /** Text input + dropdown: type a new value or pick an existing option. */
  creatable?: boolean;
  searchable?: boolean;
  className?: string;
  triggerClassName?: string;
  "aria-label"?: string;
}

export interface SelectFieldWrapperProps {
  label?: string;
  required?: boolean;
  labelClassName?: string;
  tooltip?: ReactNode;
  labelAction?: ReactNode;
  disabled?: boolean;
  hasError: boolean;
  resolvedHint?: string;
  className?: string;
  children: ReactNode;
}

/** Exported so anything that opens a dropdown — the rich-text toolbar's font
 *  and colour controls — carries the same label, hint and error row as a
 *  SelectField sitting beside it. */
export function SelectFieldWrapper({
  label,
  required = false,
  labelClassName,
  tooltip,
  labelAction,
  disabled = false,
  hasError,
  resolvedHint,
  className,
  children,
}: SelectFieldWrapperProps) {
  return (
    <div className={className}>
      {(label || tooltip || labelAction) && (
        <div className="mb-2 flex min-h-8 items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            {label && (
              <label
                className={cn(
                  "block text-sm font-medium text-black",
                  disabled &&
                    "cursor-not-allowed text-gray-500 opacity-40 dark:text-gray-400",
                  labelClassName,
                )}
              >
                {label}
                {required && <span className="text-error-500"> *</span>}
              </label>
            )}
            {tooltip && <InfoTooltip content={tooltip} label={label} />}
          </div>
          {labelAction}
        </div>
      )}

      {children}

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
}

const optionButtonClassName = cn(
  selectItemClassName,
  "text-left data-[selected=true]:bg-violet-500/15 data-[selected=true]:font-medium",
);

function filterOptions(options: SelectOption[], query: string) {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return options;
  }

  return options.filter((option) =>
    option.label.toLowerCase().includes(normalizedQuery),
  );
}

function buildCreatableOptions(options: SelectOption[], value: string) {
  const filtered = filterOptions(options, value);
  const trimmed = value.trim();
  if (!trimmed) return filtered;

  const exists = options.some(
    (option) => option.label.toLowerCase() === trimmed.toLowerCase(),
  );
  if (exists) return filtered;

  const createOption = { value: trimmed, label: trimmed };
  if (
    filtered.some(
      (option) => option.label.toLowerCase() === trimmed.toLowerCase(),
    )
  ) {
    return filtered;
  }

  return [createOption, ...filtered];
}

interface SelectDropdownProps {
  anchorRef: RefObject<HTMLElement | null>;
  open: boolean;
  onClose: () => void;
  options: SelectOption[];
  onSelectOption: (option: SelectOption) => void;
  isOptionSelected: (option: SelectOption) => boolean;
  loading: boolean;
  /** Absent means the list is not searchable. */
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  emptyMessage?: string;
}

// One list for both the plain and the searchable select: the two were the same
// markup twice, differing only in whether a search box sat above it.
function SelectDropdown({
  anchorRef,
  open,
  onClose,
  options,
  onSelectOption,
  isOptionSelected,
  loading,
  searchQuery,
  onSearchChange,
  emptyMessage = SELECT_EMPTY_MESSAGE,
}: SelectDropdownProps) {
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchable = onSearchChange !== undefined;

  useEffect(() => {
    if (open && !loading) {
      searchInputRef.current?.focus();
    }
  }, [open, loading]);

  return (
    <DropdownPanel
      anchorRef={anchorRef}
      open={open}
      onClose={onClose}
      className={selectContentClassName}
    >
      {searchable && !loading && (
        <div className="border-b border-gray-100 p-2 dark:border-gray-700">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery ?? ""}
              placeholder={SELECT_SEARCH_PLACEHOLDER}
              onChange={(event) => onSearchChange?.(event.target.value)}
              className="h-10 w-full rounded-md border border-gray-200 bg-white pl-9 pr-3 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
            />
          </div>
        </div>
      )}

      <ul role="listbox" className="py-1">
        {loading ? (
          <li className="px-4 py-2.5 text-sm text-ink-mute">
            {SELECT_LOADING_PLACEHOLDER}
          </li>
        ) : options.length > 0 ? (
          options.map((option) => (
            <li key={option.value}>
              <button
                type="button"
                role="option"
                data-selected={isOptionSelected(option)}
                aria-selected={isOptionSelected(option)}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => onSelectOption(option)}
                className={optionButtonClassName}
              >
                {option.label}
              </button>
            </li>
          ))
        ) : (
          <li className="px-4 py-2.5 text-sm text-ink-mute">{emptyMessage}</li>
        )}
      </ul>
    </DropdownPanel>
  );
}

interface DefaultSelectFieldProps {
  options: SelectOption[];
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder: string;
  disabled: boolean;
  loading: boolean;
  searchable: boolean;
  hasError: boolean;
  triggerClassName?: string;
  ariaLabel?: string;
}

function DefaultSelectField({
  options,
  value,
  onValueChange,
  onOptionSelect,
  placeholder,
  disabled,
  loading,
  searchable,
  hasError,
  triggerClassName,
  ariaLabel,
}: DefaultSelectFieldProps & {
  onOptionSelect?: (option: SelectOption) => void;
}) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const triggerRef = useRef<HTMLButtonElement>(null);

  const selectedOption = options.find((option) => option.value === value);
  const filteredOptions = useMemo(
    () => filterOptions(options, searchQuery),
    [options, searchQuery],
  );

  const closeDropdown = useCallback(() => {
    setIsOpen(false);
    setSearchQuery("");
  }, []);

  const handleToggleDropdown = () => {
    if (disabled) return;

    setIsOpen((previous) => !previous);
    setSearchQuery("");
  };

  const handleSelectOption = (option: SelectOption) => {
    onValueChange?.(option.value);
    onOptionSelect?.(option);
    closeDropdown();
  };

  if (searchable) {
    return (
      <>
        <button
          ref={triggerRef}
          type="button"
          aria-label={ariaLabel}
          aria-invalid={hasError}
          aria-expanded={isOpen}
          disabled={disabled}
          onClick={handleToggleDropdown}
          className={selectTriggerClassName({
            disabled,
            hasError,
            className: triggerClassName,
          })}
        >
          <span className={cn("truncate", !selectedOption && "text-ink-mute")}>
            {selectedOption?.label || placeholder}
          </span>
          <ChevronDown
            className={cn(
              "size-4 shrink-0 text-ink-mute transition-transform duration-200",
              isOpen && "rotate-180",
            )}
          />
        </button>

        <SelectDropdown
          anchorRef={triggerRef}
          open={isOpen && !disabled}
          onClose={closeDropdown}
          options={filteredOptions}
          onSelectOption={handleSelectOption}
          isOptionSelected={(option) => option.value === value}
          loading={loading}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
      </>
    );
  }

  const radixValue =
    value && options.some((option) => option.value === value)
      ? value
      : undefined;

  return (
    <Select
      value={radixValue}
      onValueChange={(next) => {
        onValueChange?.(next);
        const option = options.find((row) => row.value === next);
        if (option) onOptionSelect?.(option);
      }}
      disabled={disabled || loading}
    >
      <SelectTrigger
        hasError={hasError}
        className={triggerClassName}
        aria-label={ariaLabel}
        aria-invalid={hasError}
      >
        <SelectValue
          placeholder={loading ? SELECT_LOADING_PLACEHOLDER : placeholder}
        />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

interface CreatableSelectFieldProps {
  options: SelectOption[];
  value: string;
  onValueChange?: (value: string) => void;
  onOptionSelect?: (option: SelectOption) => void;
  placeholder: string;
  disabled: boolean;
  loading: boolean;
  hasError: boolean;
  triggerClassName?: string;
  ariaLabel?: string;
}

function CreatableSelectField({
  options,
  value,
  onValueChange,
  onOptionSelect,
  placeholder,
  disabled,
  loading,
  hasError,
  triggerClassName,
  ariaLabel,
}: CreatableSelectFieldProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  const listOptions = useMemo(
    () => buildCreatableOptions(options, value),
    [options, value],
  );

  const closeDropdown = () => {
    setIsOpen(false);
  };

  useClickOutside(containerRef, closeDropdown);

  const toggleDropdown = () => {
    if (disabled) return;
    setIsOpen((open) => !open);
  };

  const handleSelectOption = (option: SelectOption) => {
    onValueChange?.(option.value);
    onOptionSelect?.(option);
    closeDropdown();
  };

  return (
    <div ref={containerRef} className="relative">
      <div ref={triggerRef} className="relative">
        <input
          type="text"
          role="combobox"
          aria-expanded={isOpen}
          aria-autocomplete="list"
          aria-label={ariaLabel}
          aria-invalid={hasError}
          value={value}
          placeholder={placeholder}
          disabled={disabled}
          onFocus={() => !disabled && setIsOpen(true)}
          onChange={(event) => {
            onValueChange?.(event.target.value);
            setIsOpen(true);
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") closeDropdown();
          }}
          className={selectTriggerClassName({
            disabled,
            hasError,
            className: cn(
              "cursor-text appearance-none pr-10 placeholder:text-ink-mute",
              triggerClassName,
            ),
          })}
        />

        <button
          type="button"
          aria-label="Open options"
          disabled={disabled}
          onClick={toggleDropdown}
          className="absolute right-0 top-0 flex h-11 w-10 cursor-pointer items-center justify-center text-ink-mute"
        >
          <ChevronDown
            className={cn(
              "size-4 transition-transform duration-200",
              isOpen && "rotate-180",
            )}
          />
        </button>
      </div>

      <SelectDropdown
        anchorRef={triggerRef}
        open={isOpen && !disabled}
        onClose={closeDropdown}
        options={listOptions}
        onSelectOption={handleSelectOption}
        isOptionSelected={(option) => value === option.value}
        loading={loading}
        emptyMessage={SELECT_CREATABLE_EMPTY_MESSAGE}
      />
    </div>
  );
}

export default function SelectField({
  label,
  required = false,
  labelClassName,
  error,
  hint,
  tooltip,
  labelAction,
  options,
  value,
  onValueChange,
  onOptionSelect,
  placeholder = "Select an option",
  disabled = false,
  loading = false,
  creatable = false,
  searchable = false,
  className,
  triggerClassName,
  "aria-label": ariaLabel,
}: SelectFieldProps) {
  const hasError = typeof error === "boolean" ? error : Boolean(error);
  const resolvedHint =
    hint ?? (typeof error === "object" && error ? error.message : undefined);

  return (
    <SelectFieldWrapper
      label={label}
      required={required}
      labelClassName={labelClassName}
      tooltip={tooltip}
      labelAction={labelAction}
      disabled={disabled}
      hasError={hasError}
      resolvedHint={resolvedHint}
      className={className}
    >
      {creatable ? (
        <CreatableSelectField
          options={options}
          value={value ?? ""}
          onValueChange={onValueChange}
          onOptionSelect={onOptionSelect}
          placeholder={placeholder}
          disabled={disabled}
          loading={loading}
          hasError={hasError}
          triggerClassName={triggerClassName}
          ariaLabel={ariaLabel ?? label}
        />
      ) : (
        <DefaultSelectField
          options={options}
          value={value}
          onValueChange={onValueChange}
          onOptionSelect={onOptionSelect}
          placeholder={placeholder}
          disabled={disabled}
          loading={loading}
          searchable={searchable}
          hasError={hasError}
          triggerClassName={triggerClassName}
          ariaLabel={ariaLabel ?? label}
        />
      )}
    </SelectFieldWrapper>
  );
}
