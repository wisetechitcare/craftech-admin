import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";

import { cn } from "@/utils/utils";

export interface ToolbarButtonProps {
  label: string;
  icon: ReactNode;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
}

/** onMouseDown is swallowed so a click never pulls focus off the text — losing
 *  the selection loses what the command was about to apply to. */
export default function ToolbarButton({
  label,
  icon,
  active = false,
  disabled = false,
  onClick,
}: ToolbarButtonProps) {
  return (
    <Button
      size="xs"
      variant="none"
      title={label}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      className={cn(
        "size-8 rounded p-0 text-gray-800 transition-colors hover:bg-gray-200",
        active && "bg-brand-500/15 text-brand-600 hover:bg-brand-500/25",
      )}
    >
      {icon}
    </Button>
  );
}
