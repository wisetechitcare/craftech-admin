import type { ButtonHTMLAttributes, ReactNode } from "react";

/** Shared layout keys for navbar, hero, and about (mirrors craftech-frontend-next). */
export enum LayoutVariant {
  PREMIUM_GLASS = "premium-glass",
  CLEAN_MODERN = "clean-modern",
  FLOATING = "floating",
}

/** Global custom cursor style keys (mirrors craftech-frontend-next). */
export enum CustomCursorVariant {
  NONE = "none",
  VARIANT1 = "variant1",
  VARIANT2 = "variant2",
}

export type ButtonSize = "xs" | "sm" | "md" | "lg";

export type ButtonVariant = "primary" | "outline" | "none";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  size?: ButtonSize;
  variant?: ButtonVariant;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
}

/** One copy field on a section content card. `key` is both the content field
 *  and the element part of its visibility key (`<section>.<key>`). */
export interface SectionCopyField<T> {
  key: keyof T & string;
  label: string;
  placeholder: string;
  multiline?: boolean;
  type?: string;
  tooltip?: string;
  /** Rendered in a narrow column, as a short value like an email is. */
  narrow?: boolean;
}
