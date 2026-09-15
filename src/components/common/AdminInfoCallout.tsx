import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { AlertCircle } from "lucide-react";

import { cn } from "@/utils/utils";

interface AdminInfoCalloutProps {
  description: ReactNode;
  icon?: LucideIcon;
  action?: ReactNode;
  className?: string;
}

const AdminInfoCallout = ({
  description,
  icon: Icon = AlertCircle,
  action,
  className,
}: AdminInfoCalloutProps) => {
  return (
    <div
      className={cn(
        "flex gap-3 rounded-lg border border-info/50 bg-info/10 p-4",
        action ? "flex-wrap items-center justify-between" : "items-start",
        className,
      )}
    >
      <div
        className={cn(
          "flex min-w-0 flex-1 gap-3 text-sm text-info",
          action ? "items-center" : "items-start",
        )}
      >
        <Icon
          className={cn("h-5 w-5 shrink-0 text-info", !action && "mt-0.5")}
        />
        <div className="min-w-0">{description}</div>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
};

export default AdminInfoCallout;
