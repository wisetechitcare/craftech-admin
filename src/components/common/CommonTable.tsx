import React from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/common/table";
import { cn } from "@/lib/utils";

type Align = "left" | "center" | "right";

export type Column<T> = {
  /** Unique id (useful for the action column or when you don’t have accessorKey) */
  id?: string;
  /** Column header label or custom node */
  header: React.ReactNode;
  /** If you want to read from a field on the item directly */
  accessorKey?: keyof T;
  /** If you need full control to render the cell */
  cell?: (row: T, rowIndex: number) => React.ReactNode;
  /** Optional classes for header and cell */
  headerClassName?: string;
  cellClassName?: string;
  /** Alignment shortcut */
  align?: Align;
  /** Optional fixed width (Tailwind class or inline style via class) */
  widthClassName?: string;
  /** Whether this is the “Actions” column (skip text wrapping rules etc.) */
  isActions?: boolean;
};

export interface CommonTableProps<T> {
  columns: Array<Column<T>>;
  data: Array<T>;
  /** Used as React key for <TableRow> */
  rowKey?: (row: T, index: number) => string | number;
  getRowKey?: (row: T, index: number) => string | number;
  /** Loading states */
  loading?: boolean;
  loadingMessage?: string; // e.g., "Loading staff users…"
  /** Empty state */
  emptyMessage?: string; // e.g., "No staff users found"
  showEmptyMessage?: boolean;
  showPaginationEmptyState?: boolean;
  /** Server-side pagination (optional) */
  page?: number;
  perPage?: number;
  total?: number;
  onPageChange?: (page: number) => void;
  /** Skeleton rows to render when loading and data is empty */
  skeletonRowCount?: number;
  /** Compact density (smaller vertical padding) */
  dense?: boolean;
  /** Callback for when the rows per page dropdown is changed */
  onPerPageChange?: (perPage: number) => void;
  /** Optional class names per data row */
  rowClassName?: (row: T, rowIndex: number) => string | undefined;
  /** Optional class names on the table element */
  tableClassName?: string;
  /** Optional class names on the outer wrapper */
  className?: string;
}

const baseCell =
  "px-5 text-start text-theme-sm font-medium text-hms-ink dark:text-gray-200";
const densePad = "py-2.5";
const comfyPad = "py-4";
const headerPad = "py-3";
const alignMap: Record<Align, string> = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

export default function CommonTable<T>({
  columns,
  data,
  rowKey,
  getRowKey,
  loading = false,
  emptyMessage = "No data found",
  showEmptyMessage = false,
  skeletonRowCount = 5,
  dense = false,
  rowClassName,
  tableClassName,
  className,
}: CommonTableProps<T>) {
  const resolveRowKey = rowKey ?? getRowKey;
  const cellPad = dense ? densePad : comfyPad;

  const headerCellClass = (col: Column<T>) =>
    cn(
      "px-5 text-theme-xs font-semibold uppercase tracking-wide text-hms-cream dark:text-hms-gold",
      headerPad,
      col.align ? alignMap[col.align] : "text-left",
      col.widthClassName,
      col.headerClassName,
    );

  const cellClass = (col: Column<T>) =>
    cn(
      baseCell,
      cellPad,
      col.align ? alignMap[col.align] : "text-left",
      col.widthClassName,
      col.cellClassName,
      !col.isActions && "break-words max-w-55",
    );
  const renderCell = (col: Column<T>, row: T, rowIndex: number) => {
    if (col.cell) return col.cell(row, rowIndex);
    if (col.accessorKey) {
      const val = row[col.accessorKey];
      return val as React.ReactNode;
    }
    return null;
  };

  const showSkeleton = loading && data.length === 0;

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-hms-gold-dark/30 bg-white shadow-hms-card dark:border-gray-800 dark:bg-white/3",
        className,
      )}
    >
      <div className="max-w-full overflow-x-auto">
        <Table className={cn("min-w-full table-fixed", tableClassName)}>
          <TableHeader className="border-b border-hms-gold-dark bg-hms-gold-dark dark:border-hms-gold dark:bg-hms-ink">
            <TableRow>
              {columns.map((col, i) => (
                <TableCell
                  key={col.id ?? i}
                  isHeader
                  className={headerCellClass(col)}
                >
                  {col.header}
                </TableCell>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-hms-gold/10 dark:divide-gray-800">
            {showSkeleton &&
              Array.from({ length: skeletonRowCount }).map((_, sk) => (
                <TableRow key={`skeleton-${sk}`}>
                  {columns.map((col, i) => (
                    <TableCell
                      key={`skeleton-cell-${sk}-${col.id ?? i}`}
                      className={cellClass(col)}
                    >
                      <div className="h-3 w-24 animate-pulse rounded bg-hms-cream dark:bg-white/10" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}

            {!showSkeleton &&
              data.map((row, rIndex) => (
                <TableRow
                  key={resolveRowKey ? resolveRowKey(row, rIndex) : rIndex}
                  className={cn(
                    "border-b border-hms-gold/10 transition-colors last:border-b-0",
                    rIndex % 2 === 0 ? "bg-white" : "bg-hms-cream/40",
                    "hover:bg-hms-gold/10 dark:border-gray-800 dark:hover:bg-hms-gold/15",
                    rowClassName?.(row, rIndex),
                  )}
                >
                  {columns.map((col, cIndex) => (
                    <TableCell
                      key={col.id ?? cIndex}
                      className={cellClass(col)}
                    >
                      {renderCell(col, row, rIndex)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}

            {!loading && data.length === 0 && showEmptyMessage && (
              <TableRow>
                <TableCell
                  className={cn(
                    baseCell,
                    cellPad,
                    "text-center text-hms-muted dark:text-gray-400",
                  )}
                  colSpan={columns.length}
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export type TableColumn<T> = Column<T>;
