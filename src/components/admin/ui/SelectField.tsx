import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import type { FieldError } from "react-hook-form";
import { ChevronDown, Search } from "lucide-react";

import {
  // SELECT_CREATABLE_EMPTY_MESSAGE,
  SELECT_EMPTY_MESSAGE,
  SELECT_LOADING_PLACEHOLDER,
  SELECT_SEARCH_PLACEHOLDER,
} from "@/lib/constants/common";
import { cn } from "@/utils/utils";

import { InfoTooltip } from "./Tooltip";

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
  options: SelectOption[];
  value?: string;
  onValueChange?: (value: string) => void;
  onOptionSelect?: (option: SelectOption) => void;
  placeholder?: string;
  disabled?: boolean;
  loading?: boolean;
  creatable?: boolean;
  searchable?: boolean;
  className?: string;
  triggerClassName?: string;
  "aria-label"?: string;
}

interface SelectFieldWrapperProps {
  label?: string;
  required?: boolean;
  labelClassName?: string;
  tooltip?: ReactNode;
  hasError: boolean;
  resolvedHint?: string;
  className?: string;
  children: ReactNode;
}

function SelectFieldWrapper({
  label,
  required = false,
  labelClassName,
  tooltip,
  hasError,
  resolvedHint,
  className,
  children,
}: SelectFieldWrapperProps) {
  return (
    <div className={className}>
      {(label || tooltip) && (
        <div className="mb-2 flex items-center gap-1.5">
          {label && (
            <label
              className={cn(
                "block text-sm font-medium text-black",
                labelClassName,
              )}
            >
              {label}
              {required && <span className="text-error-500"> *</span>}
            </label>
          )}
          {tooltip && <InfoTooltip content={tooltip} label={label} />}
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
  "w-full cursor-pointer px-4 py-2.5 text-left text-sm transition-colors duration-150 hover:bg-brand-500/10 hover:text-ink",
  "data-[selected=true]:bg-brand-500/15 data-[selected=true]:font-medium data-[selected=true]:text-ink",
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

function useClickOutside(
  containerRef: RefObject<HTMLDivElement | null>,
  onClose: () => void,
) {
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [containerRef, onClose]);
}

interface SelectOptionsListProps {
  filteredOptions: SelectOption[];
  emptyMessage: string;
  onSelectOption: (option: SelectOption) => void;
  isOptionSelected: (option: SelectOption) => boolean;
  loading: boolean;
}

function SelectOptionsList({
  filteredOptions,
  emptyMessage,
  onSelectOption,
  isOptionSelected,
  loading,
}: SelectOptionsListProps) {
  return (
    <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900">
      <ul role="listbox" className="max-h-56 overflow-y-auto py-1">
        {loading ? (
          <li className="px-4 py-2.5 text-sm text-gray-500">
            {SELECT_LOADING_PLACEHOLDER}
          </li>
        ) : filteredOptions.length > 0 ? (
          filteredOptions.map((option) => (
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
          <li className="px-4 py-2.5 text-sm text-gray-500">{emptyMessage}</li>
        )}
      </ul>
    </div>
  );
}

function SearchableSelectDropdown({
  searchQuery,
  onSearchChange,
  filteredOptions,
  emptyMessage,
  onSelectOption,
  isOptionSelected,
  loading,
}: {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filteredOptions: SelectOption[];
  emptyMessage: string;
  onSelectOption: (option: SelectOption) => void;
  isOptionSelected: (option: SelectOption) => boolean;
  loading: boolean;
}) {
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!loading) {
      searchInputRef.current?.focus();
    }
  }, [loading]);

  return (
    <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900">
      {!loading && (
        <div className="border-b border-gray-100 p-2 dark:border-gray-700">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              placeholder={SELECT_SEARCH_PLACEHOLDER}
              onChange={(event) => onSearchChange(event.target.value)}
              className="h-10 w-full rounded-md border border-gray-200 bg-white pl-9 pr-3 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
            />
          </div>
        </div>
      )}

      <ul role="listbox" className="max-h-56 overflow-y-auto py-1">
        {loading ? (
          <li className="px-4 py-2.5 text-sm text-gray-500">
            {SELECT_LOADING_PLACEHOLDER}
          </li>
        ) : filteredOptions.length > 0 ? (
          filteredOptions.map((option) => (
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
          <li className="px-4 py-2.5 text-sm text-gray-500">{emptyMessage}</li>
        )}
      </ul>
    </div>
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
  placeholder,
  disabled,
  loading,
  searchable,
  hasError,
  triggerClassName,
  ariaLabel,
}: DefaultSelectFieldProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((option) => option.value === value);
  const filteredOptions = useMemo(
    () => filterOptions(options, searchQuery),
    [options, searchQuery],
  );

  const closeDropdown = () => {
    setIsOpen(false);
    setSearchQuery("");
  };

  useClickOutside(containerRef, closeDropdown);

  const handleOpenDropdown = () => {
    if (disabled) return;

    setIsOpen(true);
    setSearchQuery("");
  };

  const handleSelectOption = (option: SelectOption) => {
    onValueChange?.(option.value);
    closeDropdown();
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-label={ariaLabel}
        aria-invalid={hasError}
        aria-expanded={isOpen}
        disabled={disabled}
        onClick={handleOpenDropdown}
        className={cn(
          "flex h-11 w-full cursor-pointer items-center justify-between rounded-lg border px-4 py-2.5 text-sm shadow-theme-xs transition-colors duration-200 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90",
          disabled
            ? "cursor-not-allowed border-gray-300 bg-gray-100 text-gray-500 opacity-40 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
            : hasError
              ? "border-error-500 focus:border-error-300 focus:ring-error-500/20 dark:border-error-500 dark:text-error-400 dark:focus:border-error-800"
              : "border-gray-300 bg-transparent text-gray-800 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:text-white/90 dark:focus:border-brand-800",
          triggerClassName,
        )}
      >
        <span className={cn("truncate", !selectedOption && "text-gray-400")}>
          {selectedOption?.label || placeholder}
        </span>
        <ChevronDown
          className={cn(
            "ml-2 size-4 shrink-0 text-gray-500 transition-transform duration-200",
            isOpen && "rotate-180",
          )}
        />
      </button>

      {isOpen &&
        !disabled &&
        (searchable ? (
          <SearchableSelectDropdown
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            filteredOptions={filteredOptions}
            emptyMessage={SELECT_EMPTY_MESSAGE}
            onSelectOption={handleSelectOption}
            isOptionSelected={(option) => option.value === value}
            loading={loading}
          />
        ) : (
          <SelectOptionsList
            filteredOptions={options}
            emptyMessage={SELECT_EMPTY_MESSAGE}
            onSelectOption={handleSelectOption}
            isOptionSelected={(option) => option.value === value}
            loading={loading}
          />
        ))}
    </div>
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

  const filteredOptions = useMemo(
    () => filterOptions(options, value),
    [options, value],
  );

  const closeDropdown = () => {
    setIsOpen(false);
  };

  useClickOutside(containerRef, closeDropdown);

  const handleOpenDropdown = () => {
    if (disabled) return;

    setIsOpen(true);
  };

  const handleSelectOption = (option: SelectOption) => {
    onValueChange?.(option.label);
    onOptionSelect?.(option);
    closeDropdown();
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <input
          type="text"
          role="combobox"
          aria-expanded={isOpen}
          aria-label={ariaLabel}
          aria-invalid={hasError}
          value={value}
          placeholder={placeholder}
          disabled={disabled}
          onFocus={handleOpenDropdown}
          onChange={(event) => {
            onValueChange?.(event.target.value);
            setIsOpen(true);
          }}
          className={cn(
            "h-11 w-full appearance-none rounded-lg border px-4 py-2.5 pr-10 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30",
            disabled
              ? "cursor-not-allowed border-gray-300 bg-gray-100 text-gray-500 opacity-40 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
              : hasError
                ? "border-error-500 focus:border-error-300 focus:ring-error-500/20 dark:border-error-500 dark:text-error-400 dark:focus:border-error-800"
                : "border-gray-300 bg-transparent text-gray-800 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:text-white/90 dark:focus:border-brand-800",
            triggerClassName,
          )}
        />

        <button
          type="button"
          aria-label="Open options"
          disabled={disabled}
          onClick={handleOpenDropdown}
          className="absolute right-0 top-0 flex h-11 w-10 cursor-pointer items-center justify-center text-gray-500"
        >
          <ChevronDown
            className={cn(
              "size-4 transition-transform duration-200",
              isOpen && "rotate-180",
            )}
          />
        </button>
      </div>

      {/* {isOpen && !disabled && (
        <SelectOptionsList
          filteredOptions={filteredOptions}
          emptyMessage={SELECT_CREATABLE_EMPTY_MESSAGE} 
          onSelectOption={handleSelectOption}
          isOptionSelected={(option) => value === option.label}
          loading={loading}
        />
      )} */}
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
