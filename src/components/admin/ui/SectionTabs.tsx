import { NavLink, Outlet } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";

import { adminBrandMarkClass } from "@/lib/constants/admin-theme";
import { SECTION_TABS } from "@/lib/constants/sidebar";
import { cn } from "@/utils/utils";

const FILL_SPRING = { type: "spring", stiffness: 380, damping: 32 };

export default function SectionTabs() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="space-y-6">
      <nav aria-label="Section settings" className="grid grid-cols-2 gap-3">
        {SECTION_TABS.map((tab, index) => (
          <NavLink
            key={tab.path}
            to={tab.path}
            end
            className={({ isActive }) =>
              cn(
                "group relative isolate flex items-center gap-4 rounded-2xl border p-3 transition-all duration-200 sm:p-5",
                isActive
                  ? "border-transparent shadow-lg"
                  : "border-line bg-paper hover:-translate-y-0.5 hover:border-violet-500/40 hover:shadow-md",
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.span
                    layoutId="section-tab-fill"
                    transition={reduceMotion ? { duration: 0 } : FILL_SPRING}
                    className={cn(
                      "absolute inset-0 -z-10 overflow-hidden rounded-2xl",
                      adminBrandMarkClass,
                    )}
                  >
                    <span className="absolute -right-10 -top-12 h-36 w-36 rounded-full bg-violet-400/35 blur-2xl" />
                  </motion.span>
                )}

                <span
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all duration-200 sm:h-12 sm:w-12",
                    isActive
                      ? "bg-paper/20 text-paper shadow-lg ring-1 ring-paper/25"
                      : "bg-raise text-ink-mute ring-1 ring-line group-hover:text-violet-600",
                  )}
                >
                  <tab.icon className="h-5 w-5" />
                </span>

                <span className="min-w-0 flex-1">
                  <span
                    className={cn(
                      "block truncate text-sm font-bold sm:text-base",
                      isActive ? "text-paper" : "text-ink",
                    )}
                  >
                    {tab.label}
                  </span>
                  <span
                    className={cn(
                      "hidden truncate text-xs sm:block",
                      isActive ? "text-paper/60" : "text-ink-mute",
                    )}
                  >
                    {tab.description}
                  </span>
                </span>

                <span
                  aria-hidden
                  className={cn(
                    "hidden font-display text-5xl font-bold leading-none tabular-nums transition-colors sm:block",
                    isActive
                      ? "text-paper/15"
                      : "text-ink/5 group-hover:text-violet-500/15",
                  )}
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <Outlet />
    </div>
  );
}
