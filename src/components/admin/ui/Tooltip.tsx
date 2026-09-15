import * as React from "react";
import { Tooltip as TooltipPrimitive } from "radix-ui";
import { Info } from "lucide-react";

import { cn } from "@/utils/utils";

type TooltipContentProps = React.ComponentPropsWithoutRef<
  typeof TooltipPrimitive.Content
>;

export interface TooltipProps extends Omit<
  TooltipContentProps,
  "children" | "content"
> {
  children: React.ReactNode;
  content: React.ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function Tooltip({
  children,
  content,
  open,
  defaultOpen,
  onOpenChange,
  side = "top",
  align = "center",
  sideOffset = 6,
  className,
  ...props
}: TooltipProps) {
  return (
    <TooltipPrimitive.Provider>
      <TooltipPrimitive.Root
        open={open}
        defaultOpen={defaultOpen}
        onOpenChange={onOpenChange}
      >
        <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            side={side}
            align={align}
            sideOffset={sideOffset}
            className={cn(
              "z-50 max-w-sm min-w-0 rounded-lg border border-line bg-paper px-3 py-2 text-xs leading- text-black",
              className,
            )}
            {...props}
          >
            {content}
            {/* <TooltipPrimitive.Arrow
              width={11}
              height={5}
              className="fill-paper"
            /> */}
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}

export interface InfoTooltipProps extends Omit<TooltipProps, "children"> {
  label?: string;
}

export function InfoTooltip({ label, ...props }: InfoTooltipProps) {
  return (
    <Tooltip {...props}>
      <button
        type="button"
        aria-label={label ? `About ${label}` : "More information"}
        className="text-ink-faint transition-colors hover:text-ink-mute focus:outline-none focus-visible:text-ink-mute"
      >
        <Info className="size-3.5 cursor-help" />
      </button>
    </Tooltip>
  );
}

export default Tooltip;
