import type { ComponentType } from "react";

type NavIcon = ComponentType<{ className?: string }>;

export interface NavModule {
  name: string;
  path: string;
  icon: NavIcon;
}

export interface NavItem {
  name: string;
  icon: NavIcon;
  path: string;
  end?: boolean;
  /** Present on pages that open onto a hub of module cards. */
  modules?: NavModule[];
  /** Shown only when the signed-in admin has platform (super admin) scope. */
  superAdminOnly?: boolean;
}

export interface SectionTab {
  label: string;
  description: string;
  path: string;
  icon: NavIcon;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}
