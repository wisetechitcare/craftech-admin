import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  LayoutDashboard,
  FolderOpen,
  Settings,
  LogOut,
  Building2,
  X,
  Users,
  MessageSquare,
  Image as ImageIcon,
  Home,
  Layers,
  Star,
  ChevronDown,
  ChevronRight,
  Cpu,
  FileText,
  Briefcase,
  BookOpen,
  BarChart3,
  HelpCircle,
  Palette,
  Info,
  Menu,
  Sparkles,
  Paintbrush,
  MousePointer2,
  Gauge,
} from "lucide-react";

import { cn } from "@/utils/utils";
import type { NavGroup, NavItem } from "@/types/navigation";

const navGroups: NavGroup[] = [
  {
    label: "Main",
    items: [
      {
        name: "Dashboard",
        icon: LayoutDashboard,
        path: "/admin",
        end: true,
      },
    ],
  },
  {
    label: "Content",
    items: [
      { name: "Navbar", icon: Menu, path: "/admin/navbar" },
      { name: "Hero", icon: Home, path: "/admin/hero" },
      { name: "About", icon: Info, path: "/admin/about" },
      { name: "Statistics", icon: BarChart3, path: "/admin/stats" },
      { name: "Process Blueprint", icon: Layers, path: "/admin/process" },
      { name: "Why Features", icon: Star, path: "/admin/features" },
      { name: "Core Pillars", icon: Cpu, path: "/admin/pillars" },
      {
        name: "Domain Specialization",
        icon: Briefcase,
        path: "/admin/services",
      },
    ],
  },
  {
    label: "Projects & Media",
    items: [
      { name: "Projects", icon: FolderOpen, path: "/admin/projects" },
      { name: "Media Library", icon: ImageIcon, path: "/admin/media-library" },
    ],
  },
  {
    label: "Community",
    items: [
      { name: "Testimonials", icon: FileText, path: "/admin/testimonials" },
      { name: "Clients", icon: Building2, path: "/admin/clients" },
      { name: "Leads", icon: MessageSquare, path: "/admin/leads" },
    ],
  },
  {
    label: "Growth & Analytics",
    items: [
      { name: "Blog", icon: BookOpen, path: "/admin/blog" },
      { name: "Team", icon: Users, path: "/admin/team" },
      { name: "FAQs", icon: HelpCircle, path: "/admin/faq" },
      { name: "Analytics", icon: BarChart3, path: "/admin/analytics" },
    ],
  },
  {
    label: "System",
    items: [
      {
        name: "Site Identity",
        icon: Sparkles,
        subItems: [
          {
            name: "Branding",
            path: "/admin/site-identity/branding",
            icon: Paintbrush,
          },
          {
            name: "Navigation Style",
            path: "/admin/site-identity/navigation",
            icon: Menu,
          },
          {
            name: "Cursor Animation",
            path: "/admin/site-identity/cursor",
            icon: MousePointer2,
          },
          {
            name: "Scroll Progress",
            path: "/admin/site-identity/scroll-progress",
            icon: Gauge,
          },
        ],
      },
      { name: "Appearance", icon: Palette, path: "/admin/appearance" },
      { name: "Settings", icon: Settings, path: "/admin/settings" },
    ],
  },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [openSubmenuKey, setOpenSubmenuKey] = useState<string | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
    {},
  );
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  const isActive = useCallback(
    (path: string) => pathname === path || pathname.startsWith(`${path}/`),
    [pathname],
  );

  useEffect(() => {
    let matched = false;

    navGroups.forEach((group) => {
      group.items.forEach((item, index) => {
        if (!item.subItems) return;

        const hasActiveChild = item.subItems.some((subItem) =>
          isActive(subItem.path),
        );

        if (hasActiveChild) {
          setOpenSubmenuKey(`${group.label}-${index}`);
          matched = true;
        }
      });
    });

    if (!matched) {
      setOpenSubmenuKey(null);
    }
  }, [pathname, isActive]);

  useEffect(() => {
    if (!openSubmenuKey) return;

    const element = subMenuRefs.current[openSubmenuKey];
    if (!element) return;

    setSubMenuHeight((prev) => ({
      ...prev,
      [openSubmenuKey]: element.scrollHeight,
    }));
  }, [openSubmenuKey, pathname]);

  const initials = admin?.name
    ? admin.name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "A";

  const renderSubmenu = (item: NavItem, groupLabel: string, index: number) => {
    const submenuKey = `${groupLabel}-${index}`;
    const isOpen = openSubmenuKey === submenuKey;
    const isSectionActive = item.subItems?.some((subItem) =>
      isActive(subItem.path),
    );

    return (
      <li key={item.name}>
        <button
          type="button"
          onClick={() =>
            setOpenSubmenuKey((prev) =>
              prev === submenuKey ? null : submenuKey,
            )
          }
          className={cn(
            "group flex w-full items-center gap-3 pl-3 pr-2 py-2 rounded-[10px] text-[0.83rem] transition-colors duration-150 relative",
            isSectionActive
              ? "bg-accent/[0.07] text-ink font-semibold"
              : "text-ink-soft font-medium hover:bg-raise hover:text-ink",
          )}
        >
          {isSectionActive && (
            <span className="absolute -left-3 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r bg-accent" />
          )}
          <item.icon
            className={cn(
              "w-[17px] h-[17px] shrink-0",
              isSectionActive
                ? "text-accent"
                : "text-ink-faint group-hover:text-ink-mute",
            )}
          />
          <span className="flex-1 truncate text-left">{item.name}</span>
          <ChevronDown
            className={cn(
              "w-4 h-4 shrink-0 transition-transform duration-200",
              isOpen ? "rotate-180 text-accent" : "text-ink-faint",
            )}
          />
        </button>

        <div
          ref={(element) => {
            subMenuRefs.current[submenuKey] = element;
          }}
          className="overflow-hidden transition-all duration-300"
          style={{ height: isOpen ? `${subMenuHeight[submenuKey] ?? 0}px` : 0 }}
        >
          <ul className="mt-1 ml-4 pl-3 border-l border-line-2 space-y-0.5">
            {item.subItems?.map((subItem) => {
              const active = isActive(subItem.path);
              const SubIcon = subItem.icon;

              return (
                <li key={subItem.path}>
                  <Link
                    to={subItem.path}
                    onClick={onClose}
                    className={cn(
                      "group flex items-center gap-2.5 py-2 pr-2 rounded-[10px] text-[0.8rem] transition-colors duration-150",
                      active
                        ? "text-ink font-semibold"
                        : "text-ink-soft font-medium hover:text-ink",
                    )}
                  >
                    {SubIcon && (
                      <SubIcon
                        className={cn(
                          "w-4 h-4 shrink-0",
                          active ? "text-accent" : "text-ink-faint",
                        )}
                      />
                    )}
                    <span className="truncate">{subItem.name}</span>
                    {active && (
                      <ChevronRight className="ml-auto w-3 h-3 text-accent/70" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </li>
    );
  };

  const renderNavLink = (item: NavItem) => {
    if (!item.path) return null;

    const active = item.end ? pathname === item.path : isActive(item.path);

    return (
      <li key={item.path}>
        <Link
          to={item.path}
          onClick={onClose}
          className={cn(
            "group flex items-center gap-3 pl-3 pr-2 py-2 rounded-[10px] text-[0.83rem] transition-colors duration-150 relative",
            active
              ? "bg-accent/[0.07] text-ink font-semibold"
              : "text-ink-soft font-medium hover:bg-raise hover:text-ink",
          )}
        >
          {active && (
            <span className="absolute -left-3 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r bg-accent" />
          )}
          <item.icon
            className={cn(
              "w-[17px] h-[17px] shrink-0",
              active
                ? "text-accent"
                : "text-ink-faint group-hover:text-ink-mute",
            )}
          />
          <span className="flex-1 truncate">{item.name}</span>
          {active && <ChevronRight className="w-3 h-3 text-accent/70" />}
        </Link>
      </li>
    );
  };

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-20 lg:hidden bg-ink/40 backdrop-blur-[2px]"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full w-64 z-30 flex flex-col bg-paper border-r border-line transition-transform duration-300 ease-in-out
          ${open ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-line-2">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[10px] bg-accent flex items-center justify-center shrink-0">
              <span className="text-xs font-bold text-white tracking-wider">
                CT
              </span>
            </div>
            <div>
              <p className="font-display text-[0.95rem] font-bold text-ink leading-none">
                Craftech
              </p>
              <p className="text-[0.6rem] mt-1 font-semibold uppercase tracking-[0.14em] text-ink-faint">
                Engineering Admin
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="lg:hidden w-7 h-7 rounded-lg flex items-center justify-center text-ink-mute hover:text-ink hover:bg-raise transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-5 scrollbar-thin">
          {navGroups.map((group) => (
            <div key={group.label}>
              <p className="px-3 mb-1.5 text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-ink-faint">
                {group.label}
              </p>
              <ul className="space-y-0.5">
                {group.items.map((item, index) =>
                  item.subItems
                    ? renderSubmenu(item, group.label, index)
                    : renderNavLink(item),
                )}
              </ul>
            </div>
          ))}
        </nav>

        <div className="px-3 pb-3 pt-3 border-t border-line-2">
          <div className="flex items-center gap-3 px-2.5 py-2 rounded-[10px] bg-raise mb-1">
            <div className="w-8 h-8 rounded-[10px] bg-navy flex items-center justify-center shrink-0 text-[0.7rem] font-bold text-white">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-ink truncate">
                {admin?.name || "Admin"}
              </p>
              <p className="text-[0.65rem] text-ink-mute truncate">
                {admin?.email}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-2.5 py-2 rounded-[10px] text-[0.83rem] font-medium text-ink-mute hover:bg-danger/6 hover:text-danger transition-colors"
          >
            <LogOut className="w-[17px] h-[17px] shrink-0" />
            <span>Sign out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
