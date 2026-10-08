import type { LucideIcon } from "lucide-react";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

import { adminSoftIconTileClass } from "@/lib/constants/admin-theme";

export const USERS_HUB_PATH = "/admin/users";

interface UsersInviteHeaderProps {
  title: string;
  description: string;
  icon: LucideIcon;
}

export function UsersInviteHeader({
  title,
  description,
  icon: Icon,
}: UsersInviteHeaderProps) {
  return (
    <div className="flex items-start gap-4 border-b border-line pb-5">
      <Link
        to={USERS_HUB_PATH}
        aria-label="Back to Users"
        className="mt-1 shrink-0 rounded-lg bg-raise border border-grey-400 p-2 transition-colors hover:bg-line"
      >
        <ArrowLeft className="size-5 text-ink" />
      </Link>
      <span
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${adminSoftIconTileClass}`}
      >
        <Icon className="h-5.5 w-5.5" />
      </span>
      <div className="min-w-0">
        <h2 className="text-2xl font-bold text-ink">{title}</h2>
        <p className="text-sm text-ink-mute">{description}</p>
      </div>
    </div>
  );
}

interface InviteTipsPanelProps {
  title: string;
  steps: string[];
}

export function InviteTipsPanel({ title, steps }: InviteTipsPanelProps) {
  return (
    <div className="space-y-4 rounded-xl border border-line bg-paper p-5 shadow-sm">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-ink">
        {title}
      </h3>
      <ol className="space-y-4">
        {steps.map((step, index) => (
          <li key={step} className="flex gap-3 text-sm text-ink">
            <span
              className="flex size-7 shrink-0 items-center justify-center rounded-full bg-violet-500/10 text-xs font-bold text-violet-700"
              aria-hidden
            >
              {index + 1}
            </span>
            <span className="pt-0.5 leading-relaxed">{step}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
