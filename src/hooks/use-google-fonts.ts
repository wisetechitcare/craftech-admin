import { useEffect, useMemo, useRef, useState } from "react";
import { isAxiosError } from "axios";
import toast from "react-hot-toast";

import { DEFAULT_RICH_TEXT_CONFIG } from "@/lib/constants/rich-text";
import { googleFontsHrefs } from "@/lib/editor";
import { fontsApi } from "@/services/api";
import type {
  CraftechFont,
  FontCategory,
  FontSort,
  FontUsage,
} from "@/types/rich-text";

const SEARCH_DEBOUNCE_MS = 300;

export interface UseGoogleFontsOptions {
  search?: string;
  category?: FontCategory;
  sort?: FontSort;
  limit?: number;
  /** Skips fetching entirely — a closed dropdown should not spend a request. */
  enabled?: boolean;
}

export interface UseGoogleFontsResult {
  fonts: CraftechFont[];
  total: number;
  hasMore: boolean;
  loading: boolean;
  loadMore: () => void;
}

/**
 * The font catalogue, paged, from Craftech's API. Searching and filtering
 * happen on the server: the full Google list is ~1800 families.
 */
export function useGoogleFonts({
  search = "",
  category,
  sort = "popularity",
  limit = DEFAULT_RICH_TEXT_CONFIG.fontPageSize,
  enabled = true,
}: UseGoogleFontsOptions = {}): UseGoogleFontsResult {
  const [fonts, setFonts] = useState<CraftechFont[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [debouncedSearch, setDebouncedSearch] = useState<string>(search);

  useEffect(() => {
    const timer = setTimeout(
      () => setDebouncedSearch(search),
      SEARCH_DEBOUNCE_MS,
    );
    return () => clearTimeout(timer);
  }, [search]);

  // The page number is stored WITH the query it belongs to, so it reads back as
  // 1 the moment the query moves on. Resetting it from an effect would render
  // one frame asking page 4 of a search nobody typed.
  const queryKey = `${debouncedSearch}|${category ?? ""}|${sort}|${limit}`;
  const [cursor, setCursor] = useState<{ key: string; page: number }>({
    key: queryKey,
    page: 1,
  });
  const page = cursor.key === queryKey ? cursor.page : 1;

  // Only the latest request may write state — a fast typist outruns the
  // network, and a stale response landing last would show the wrong list.
  const requestId = useRef<number>(0);

  useEffect(() => {
    if (!enabled) return;

    const id = ++requestId.current;
    let message = "Failed to load fonts";
    let isError = true;

    const load = async () => {
      setLoading(true);

      try {
        const response = await fontsApi.list({
          search: debouncedSearch || undefined,
          category,
          sort,
          page,
          limit,
        });

        message = response.data?.message || message;

        if (response.data?.success) {
          isError = false;
          if (id !== requestId.current) return;

          const { fonts: batch, total: matches } = response.data.data;
          setTotal(matches);
          setFonts((prev) => (page === 1 ? batch : [...prev, ...batch]));
        }
      } catch (error) {
        if (isAxiosError(error)) {
          message = error.response?.data?.message || message;
        }
      } finally {
        if (isError && id === requestId.current) {
          toast.error(message);
        }
        if (id === requestId.current) {
          setLoading(false);
        }
      }
    };

    void load();
  }, [enabled, debouncedSearch, category, sort, page, limit]);

  return {
    fonts,
    total,
    hasMore: fonts.length < total,
    loading,
    loadMore: () => setCursor({ key: queryKey, page: page + 1 }),
  };
}

/**
 * Loads the Google stylesheets a set of families needs, for as long as the
 * caller is mounted, so the editor draws text in the family it will ship in.
 *
 * These are global @font-face rules, so the admin's own Tailwind stacks name
 * system faces only — see tailwind.config.js. Naming a Google family there
 * would mean picking it in the CMS restyled the whole admin.
 */
export function useGoogleFontStyles(usage: FontUsage[]): void {
  const hrefs = useMemo(() => googleFontsHrefs(usage).sort(), [usage]);
  const key = hrefs.join("|");

  useEffect(() => {
    if (!key) return;

    const links = key.split("|").map((href) => {
      const existing = document.head.querySelector<HTMLLinkElement>(
        `link[data-craftech-font][href="${CSS.escape(href)}"]`,
      );
      if (existing) {
        existing.dataset.refs = String(Number(existing.dataset.refs ?? 0) + 1);
        return existing;
      }

      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = href;
      link.dataset.craftechFont = "";
      link.dataset.refs = "1";
      document.head.appendChild(link);
      return link;
    });

    return () => {
      // Reference counted: two editors on one page often want the same family,
      // and the first to unmount must not pull the stylesheet out from under
      // the second.
      links.forEach((link) => {
        const refs = Number(link.dataset.refs ?? 1) - 1;
        if (refs > 0) {
          link.dataset.refs = String(refs);
        } else {
          link.remove();
        }
      });
    };
  }, [key]);
}
