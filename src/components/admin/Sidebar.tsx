import { Link, useLocation, useNavigate } from "react-router-dom";
import { LogOut, X } from "lucide-react";

import { KaiznovaLogo, KaiznovaMark } from "@/components/common/KaiznovaBrand";
import { useAuth } from "@/context/AuthContext";
import {
  adminNavActiveBarClass,
  adminNavActiveClass,
  adminNavActiveIconClass,
} from "@/lib/constants/admin-theme";
import { DASHBOARD_PATH, NAV_GROUPS } from "@/lib/constants/sidebar";
import { cn } from "@/utils/utils";
import type { NavItem } from "@/types/navigation";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate("/admin/login");
  };

  const isActive = (path: string) =>
    pathname === path || pathname.startsWith(`${path}/`);

  const initials = user?.fullName
    ? user.fullName
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "A";

  const renderNavItem = (item: NavItem) => {
    const active = item.end ? pathname === item.path : isActive(item.path);

    return (
      <li key={item.path}>
        <Link
          to={item.path}
          onClick={onClose}
          aria-current={active ? "page" : undefined}
          className={cn(
            "group flex items-center gap-3 pl-3 pr-2 py-2 rounded-[10px] text-sm transition-colors duration-150 relative",
            active
              ? adminNavActiveClass
              : "text-ink-soft font-medium hover:bg-raise hover:text-ink",
          )}
        >
          {active && (
            <span
              className={cn(
                "absolute -left-3 top-1/2 -translate-y-1/2 w-0.75 h-6 rounded-r",
                adminNavActiveBarClass,
              )}
            />
          )}
          <item.icon
            className={cn(
              "w-4.5 h-4.5 shrink-0",
              active
                ? adminNavActiveIconClass
                : "text-ink-faint group-hover:text-ink-mute",
            )}
          />
          <span className="flex-1 min-w-0">
            <span className="block truncate">{item.name}</span>
            {item.modules && (
              <span className="block text-xs font-normal text-ink-faint">
                {item.modules.length} modules
              </span>
            )}
          </span>
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
        <div className="flex items-center justify-between gap-2  py-2 border-b border-line-2">
          <Link
            to={DASHBOARD_PATH}
            onClick={onClose}
            className="flex min-w-0 flex-1 items-center gap-2.5"
            aria-label="KAIZNOVA Admin home"
          >
            <div className="min-w-0 flex-1">
              <KaiznovaLogo className="h-auto" />
            </div>
          </Link>
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="lg:hidden w-7 h-7 rounded-lg flex items-center justify-center text-ink-mute hover:text-ink hover:bg-raise transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-5 scrollbar-thin">
          {NAV_GROUPS.map((group) => (
            <div key={group.label}>
              <p className="px-3 mb-1.5 text-sm font-semibold uppercase  text-ink">
                {group.label}
              </p>
              <ul className="space-y-0.5">
                {group.items
                  .filter(
                    (item) =>
                      !item.superAdminOnly || user?.role === "SUPER_ADMIN",
                  )
                  .map(renderNavItem)}
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
                {user?.fullName || "User"}
              </p>
              <p className="text-[0.65rem] text-ink-mute truncate">
                {user?.email}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-2.5 py-2 rounded-[10px] text-[0.83rem] font-medium text-ink-mute hover:bg-danger/6 hover:text-danger transition-colors"
          >
            <LogOut className="w-4.5 h-4.5 shrink-0" />
            <span>Sign out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
