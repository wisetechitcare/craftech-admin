import { Link, useLocation } from "react-router-dom";

import { NAV_GROUPS } from "@/lib/constants/sidebar";

export default function ModuleHub() {
  const { pathname } = useLocation();
  const page = NAV_GROUPS.flatMap((group) => group.items).find(
    (item) => item.path === pathname,
  );

  if (!page?.modules) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 border-b border-line pb-5">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent ring-1 ring-line">
          <page.icon className="h-5.5 w-5.5" />
        </span>
        <div>
          <h2 className="text-2xl font-bold text-ink">{page.name}</h2>
          <p className="text-sm text-ink-mute">
            {page.modules.length} modules available
          </p>
        </div>
      </div>

      <div className="mx-auto grid w-full sm:max-w-2/3 grid-cols-4 gap-4 sm:gap-10">
        {page.modules.map((module) => (
          <Link
            key={module.path}
            to={module.path}
            className="group flex flex-col items-center gap-3 rounded-2xl p-1 focus-visible:outline-2 focus-visible:outline-accent w-16 sm:w-28"
          >
            <span className="flex h-18 w-18 items-center justify-center rounded-2xl sm:h-24 sm:w-24 sm:rounded-3xl border border-line bg-paper text-accent shadow-sm transition-all duration-200 group-hover:-translate-y-1 group-hover:border-accent group-hover:bg-accent group-hover:text-paper group-hover:shadow-lg">
              <module.icon className="h-8 w-8 sm:h-10 sm:w-10" />
            </span>
            <span className="text-center text-sm font-semibold sm:text-base text-ink transition-colors group-hover:text-accent">
              {module.name}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
