import {
  BarChart3,
  BookOpen,
  Briefcase,
  Building2,
  FileText,
  FolderOpen,
  Gauge,
  HelpCircle,
  Home,
  Image as ImageIcon,
  Info,
  LayoutDashboard,
  Mail,
  Menu,
  MessageSquare,
  MousePointer2,
  Paintbrush,
  Palette,
  PanelTop,
  PenLine,
  Settings,
  Sparkles,
  Star,
  Users,
} from "lucide-react";

import type { NavGroup, SectionTab } from "@/types/navigation";

export const DASHBOARD_PATH = "/admin";

/** Pages mirror the live site. A page with modules opens onto a hub of module cards; nothing in the sidebar expands. */
export const NAV_GROUPS: NavGroup[] = [
  {
    label: "Main",
    items: [
      {
        name: "Dashboard",
        icon: LayoutDashboard,
        path: DASHBOARD_PATH,
        end: true,
      },
    ],
  },
  {
    label: "Website",
    items: [
      {
        name: "Home",
        icon: Home,
        path: "/admin/home",
        modules: [
          { name: "Hero Section", icon: PanelTop, path: "/admin/home/hero" },
          { name: "Services", icon: Briefcase, path: "/admin/home/services" },
          {
            name: "Gallery Section",
            icon: ImageIcon,
            path: "/admin/home/gallery",
          },
          { name: "FAQ Section", icon: HelpCircle, path: "/admin/home/faq" },
          { name: "Contact Section", icon: Mail, path: "/admin/home/contact" },
        ],
      },
      { name: "About", icon: Info, path: "/admin/about" },
      { name: "Projects", icon: FolderOpen, path: "/admin/projects" },
      { name: "Team", icon: Users, path: "/admin/team" },
      { name: "Blog", icon: BookOpen, path: "/admin/blog" },
    ],
  },
  {
    label: "Global",
    items: [
      {
        name: "Clients & partners",
        icon: Building2,
        path: "/admin/clients",
      },
      { name: "Navbar", icon: Menu, path: "/admin/navbar" },
      {
        name: "Site Identity",
        icon: Sparkles,
        path: "/admin/site-identity",
        modules: [
          {
            name: "Branding",
            icon: Paintbrush,
            path: "/admin/site-identity/branding",
          },
          {
            name: "Site Theme",
            icon: Palette,
            path: "/admin/site-identity/theme",
          },
          {
            name: "Cursor Animation",
            icon: MousePointer2,
            path: "/admin/site-identity/cursor",
          },
          {
            name: "Scroll Progress",
            icon: Gauge,
            path: "/admin/site-identity/scroll-progress",
          },
        ],
      },
      { name: "Media Library", icon: ImageIcon, path: "/admin/media-library" },
      { name: "Settings", icon: Settings, path: "/admin/settings" },
    ],
  },
  {
    label: "Business",
    items: [
      { name: "Leads", icon: MessageSquare, path: "/admin/leads" },
      { name: "Analytics", icon: BarChart3, path: "/admin/analytics" },
      { name: "Testimonials", icon: FileText, path: "/admin/testimonials" },
      { name: "Why Features", icon: Star, path: "/admin/features" },
    ],
  },
];

export const SECTION_TABS: SectionTab[] = [
  {
    label: "Content",
    description: "Text, images and buttons",
    path: ".",
    icon: PenLine,
  },
  {
    label: "Appearance",
    description: "Layout style",
    path: "appearance",
    icon: Palette,
  },
];

/** Old flat admin URLs, kept so bookmarks land on the section's new home. */
export const LEGACY_ADMIN_REDIRECTS: Record<string, string> = {
  hero: "/admin/home/hero",
  stats: "/admin/home/stats",
  pillars: "/admin/home/pillars",
  services: "/admin/home/services",
  process: "/admin/home/process",
  clients: "/admin/clients",
  gallery: "/admin/home/gallery",
  faq: "/admin/home/faq",
  contact: "/admin/home/contact",
  appearance: "/admin/home/hero/appearance",
  "appearance/hero": "/admin/home/hero/appearance",
  "appearance/about": "/admin/about/appearance",
  "appearance/faq": "/admin/home/faq/appearance",
  "appearance/contact": "/admin/home/contact/appearance",
  "site-identity/navigation": "/admin/navbar/appearance",
};
