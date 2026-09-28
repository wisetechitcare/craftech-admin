import { NavLink, Outlet } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";

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
                  : "border-line bg-paper hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-md",
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.span
                    layoutId="section-tab-fill"
                    transition={reduceMotion ? { duration: 0 } : FILL_SPRING}
                    className="absolute inset-0 -z-10 overflow-hidden rounded-2xl bg-linear-to-br from-navy-light via-navy to-navy-dark"
                  >
                    <span className="absolute -right-10 -top-12 h-36 w-36 rounded-full bg-accent/30 blur-2xl" />
                  </motion.span>
                )}

                <span
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all duration-200 sm:h-12 sm:w-12",
                    isActive
                      ? "bg-accent text-paper shadow-lg"
                      : "bg-raise text-ink-mute ring-1 ring-line group-hover:text-accent",
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
                      : "text-ink/5 group-hover:text-accent/15",
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
