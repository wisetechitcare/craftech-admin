import React from "react";
import { Check } from "lucide-react";

import { useWizard } from "@/hooks/use-wizard";
import { cn } from "@/utils/utils";

const CIRCLE_CENTER_OFFSET = "pt-3.5";

export function HorizontalStepper({
  className = "",
  descriptions = [],
  clickPastSteps = true,
  allowFutureSteps = false,
}: {
  className?: string;
  descriptions?: string[];
  clickPastSteps?: boolean;
  allowFutureSteps?: boolean;
}) {
  const { step, titles, goTo } = useWizard();
  const currentStep = step + 1;

  return (
    <div className={cn("flex w-full items-start", className)}>
      {titles.map((label, index) => {
        const stepNumber = index + 1;
        const isDone = stepNumber < currentStep;
        const isActive = stepNumber === currentStep;
        const isLast = index === titles.length - 1;
        const descriptionText = descriptions[index];
        const isPastClickable = clickPastSteps && isDone;
        const isFutureClickable = allowFutureSteps && !isDone && !isActive;
        const isClickable = isPastClickable || isFutureClickable;

        return (
          <React.Fragment key={`${label}-${index}`}>
            <div className="shrink-0">
              <button
                type="button"
                disabled={!isClickable}
                onClick={() => isClickable && goTo(index)}
                className={cn(
                  "flex items-center gap-2.5 text-left transition-opacity focus-visible:outline-2 focus-visible:outline-violet-600",
                  isClickable
                    ? "cursor-pointer hover:opacity-80"
                    : "cursor-default",
                )}
              >
                <span
                  className={cn(
                    "flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors duration-200",
                    isDone &&
                      "border border-violet-600 bg-linear-to-br from-navy via-brand to-violet-600 text-paper",
                    isActive &&
                      !isDone &&
                      "border border-violet-600 bg-linear-to-br from-navy via-brand to-violet-600 text-paper shadow-sm",
                    !isDone &&
                      !isActive &&
                      "border border-line bg-surface-2 text-ink-mute",
                  )}
                >
                  {isDone ? (
                    <Check className="size-4 stroke-[2.5]" />
                  ) : (
                    stepNumber
                  )}
                </span>

                <span
                  className={cn(
                    "whitespace-nowrap text-xs font-medium uppercase tracking-wider transition-colors duration-200",
                    isActive && "font-semibold text-violet-600",
                    isDone && !isActive && "font-medium text-ink",
                    !isActive && !isDone && "text-ink-mute",
                  )}
                >
                  {label}
                </span>
              </button>

              {descriptionText && (
                <p className="mt-0.5 whitespace-nowrap pl-9 text-xs leading-tight text-ink-mute">
                  {descriptionText}
                </p>
              )}
            </div>

            {!isLast && (
              <div
                className={cn(
                  "flex min-w-8 flex-1 items-center self-start px-3",
                  CIRCLE_CENTER_OFFSET,
                )}
                aria-hidden="true"
              >
                <div className="h-0.5 w-full rounded-full bg-line" />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
