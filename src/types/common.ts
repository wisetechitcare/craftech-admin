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
