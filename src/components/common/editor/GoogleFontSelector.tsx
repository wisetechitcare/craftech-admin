import { useCallback, useMemo, useRef, useState } from "react";
import { ChevronDown, Loader2, Search } from "lucide-react";

import DropdownPanel from "@/components/admin/ui/DropdownPanel";

import { useGoogleFonts, useGoogleFontStyles } from "@/hooks";
import {
  DEFAULT_RICH_TEXT_CONFIG,
  inheritedLabel,
} from "@/lib/constants/rich-text";
import {
  FONT_CATEGORIES,
  FONT_SORTS,
  type FontCategory,
  type FontSort,
} from "@/types/rich-text";
import { cn } from "@/utils/utils";

export interface GoogleFontSelectorProps {
  /** The family in force, or null when the text inherits the site's font. */
  value: string | null;
  onChange: (family: string | null) => void;
  /** Named in place of "Default", so the control says what the text is
   *  actually drawn in today. */
  inheritedFamily?: string;
  disabled?: boolean;
  allowedCategories?: FontCategory[];
  defaultSort?: FontSort;
  pageSize?: number;
  label?: string;
  className?: string;
}

interface FontListProps extends Omit<
  GoogleFontSelectorProps,
  "disabled" | "label" | "className"
> {
  onPicked: () => void;
}

const SORT_LABELS: Record<FontSort, string> = {
  popularity: "Popular",
  alpha: "A–Z",
};

const chipClassName = (active: boolean) =>
  cn(
    "rounded-full px-2.5 py-1 text-xs font-semibold transition-colors",
    active
      ? "bg-brand-500 text-white"
      : "bg-gray-100 text-gray-500 hover:text-ink",
  );

/** Its own component so the catalogue request only happens while the control
 *  is open — there is one editor per CMS field. */
function FontList({
  value,
  onChange,
  onPicked,
  inheritedFamily,
  allowedCategories,
  defaultSort = "popularity",
  pageSize = DEFAULT_RICH_TEXT_CONFIG.fontPageSize,
}: FontListProps) {
  const [search, setSearch] = useState<string>("");
  const [category, setCategory] = useState<FontCategory | undefined>(undefined);
  const [sort, setSort] = useState<FontSort>(defaultSort);

  const categories = allowedCategories ?? [...FONT_CATEGORIES];
  const { fonts, hasMore, loading, loadMore } = useGoogleFonts({
    search,
    category,
    sort,
    limit: pageSize,
  });

  // Regular weight only: a preview shows the shape of the face, and nine
  // weights of twenty-four families is a page of downloads nobody reads.
  const usage = useMemo(
    () =>
      fonts.map((font) => ({
        family: font.family,
        weights: [400],
        italic: false,
      })),
    [fonts],
  );
  useGoogleFontStyles(usage);

  const pick = (family: string | null) => {
    onChange(family);
    onPicked();
  };

  return (
    <div>
      <div className="space-y-2 border-b border-gray-100 p-2">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            autoFocus
            value={search}
            placeholder="Search all Google fonts"
            onChange={(event) => setSearch(event.target.value)}
            className="h-9 w-full rounded-md border border-gray-200 bg-white pl-9 pr-3 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </div>

        <div className="flex flex-wrap gap-1">
          {FONT_SORTS.map((option) => (
            <button
              key={option}
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => setSort(option)}
              className={chipClassName(sort === option)}
            >
              {SORT_LABELS[option]}
            </button>
          ))}
          {categories.map((option) => (
            <button
              key={option}
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() =>
                setCategory((current) =>
                  current === option ? undefined : option,
                )
              }
              className={chipClassName(category === option)}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <ul role="listbox" className="py-1">
        {inheritedFamily && (
          <li>
            <button
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => pick(null)}
              className={cn(
                "w-full px-4 py-2 text-left text-sm transition-colors hover:bg-brand-500/10",
                value === null ? "font-medium text-ink" : "text-gray-500",
              )}
            >
              {inheritedLabel(inheritedFamily)}
            </button>
          </li>
        )}

        {fonts.map((font) => (
          <li key={font.family}>
            <button
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => pick(font.family)}
              style={{ fontFamily: `"${font.family}", sans-serif` }}
              className={cn(
                "flex w-full items-baseline justify-between gap-2 px-4 py-2 text-left text-sm transition-colors hover:bg-brand-500/10",
                font.family === value
                  ? "bg-brand-500/15 text-ink"
                  : "text-gray-800",
              )}
            >
              <span className="truncate">{font.family}</span>
              <span className="shrink-0 font-sans text-xs text-gray-400">
                {font.category}
              </span>
            </button>
          </li>
        ))}

        {loading && (
          <li className="flex justify-center py-3">
            <Loader2 className="size-4 animate-spin text-gray-400" />
          </li>
        )}

        {!loading && !fonts.length && (
          <li className="px-4 py-2 text-sm text-gray-500">No fonts match.</li>
        )}

        {hasMore && !loading && (
          <li>
            <button
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={loadMore}
              className="w-full px-4 py-2 text-xs font-semibold text-brand-500 transition-colors hover:bg-brand-500/10"
            >
              Load more
            </button>
          </li>
        )}
      </ul>
    </div>
  );
}

/**
 * Picks a Google font family from Craftech's own catalogue endpoint, so the API
 * key stays on the server and search, filtering and paging happen once. Give it
 * a value and an onChange and it works in any CMS form.
 */
export default function GoogleFontSelector({
  value,
  onChange,
  inheritedFamily,
  disabled = false,
  allowedCategories,
  defaultSort,
  pageSize,
  label = "Font family",
  className,
}: GoogleFontSelectorProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => setIsOpen(false), []);
  const shown = value ?? inheritedFamily ?? "";

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        title={label}
        aria-label={label}
        aria-expanded={isOpen}
        disabled={disabled}
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => !disabled && setIsOpen((previous) => !previous)}
        className={cn(
          "flex h-8 items-center justify-between gap-1 rounded border border-gray-300 bg-white px-2 text-sm text-gray-800 transition-colors hover:border-brand-300",
          disabled && "cursor-not-allowed bg-gray-100 opacity-40",
          className,
        )}
      >
        <span
          className={cn("truncate", !value && "text-gray-500")}
          style={shown ? { fontFamily: `"${shown}", sans-serif` } : undefined}
        >
          {value ?? (inheritedFamily ? inheritedLabel(inheritedFamily) : "")}
        </span>
        <ChevronDown className="size-3 shrink-0 text-gray-500" />
      </button>

      <DropdownPanel
        anchorRef={triggerRef}
        open={isOpen && !disabled}
        onClose={close}
        className="w-72"
      >
        <FontList
          value={value}
          onChange={onChange}
          onPicked={close}
          inheritedFamily={inheritedFamily}
          allowedCategories={allowedCategories}
          defaultSort={defaultSort}
          pageSize={pageSize}
        />
      </DropdownPanel>
    </>
  );
}
