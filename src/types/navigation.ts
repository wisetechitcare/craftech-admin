import type { ComponentType } from "react";

export interface NavSubItem {
  name: string;
  path: string;
  icon?: ComponentType<{ className?: string }>;
}

export interface NavItem {
  name: string;
  icon: ComponentType<{ className?: string }>;
  path?: string;
  end?: boolean;
  subItems?: NavSubItem[];
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}
