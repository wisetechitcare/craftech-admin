import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const PHONE_MIN_DIGITS = 10;
const PHONE_MAX_DIGITS = 18;

const PHONE_PATTERN = new RegExp(
  `^\\+?\\d{${PHONE_MIN_DIGITS},${PHONE_MAX_DIGITS}}$`,
);

// What a phone field may hold: digits, and a leading + for the country code.
// Applied on change so pasted text is cleaned the same way typed text is.
export const sanitizePhoneValue = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, PHONE_MAX_DIGITS);
  return value.trimStart().startsWith("+") ? `+${digits}` : digits;
};

export const isValidPhone = (value: string) => PHONE_PATTERN.test(value.trim());

// A plain list of strings as SelectField wants it. The label IS the value for
// every caller — categories, statuses, departments — so there is nothing to map
// beyond the shape. Structurally typed rather than importing SelectOption, which
// would point utils at a component.
export const toSelectOptions = (values: readonly string[]) =>
  values.map((value) => ({ value, label: value }));

// Ordered CMS lists are stored in the order they are written — no order
// columns, no per-row endpoints — so every list edit is a pure array transform
// and Save writes the whole document at once.
export const move = <T>(rows: T[], from: number, to: number): T[] => {
  if (to < 0 || to >= rows.length) return rows;
  const next = [...rows];
  const [row] = next.splice(from, 1);
  next.splice(to, 0, row);
  return next;
};

export const removeAt = <T>(rows: T[], index: number): T[] =>
  rows.filter((_, i) => i !== index);

export const patchAt = <T>(
  rows: T[],
  index: number,
  changes: Partial<T>,
): T[] => rows.map((row, i) => (i === index ? { ...row, ...changes } : row));
