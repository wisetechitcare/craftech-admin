import { Check } from "lucide-react";

import { useWizard } from "@/hooks/use-wizard";
import { cn } from "@/utils/utils";

export function Stepper({
  className = "",
  descriptions = [],
  clickPastSteps = true,
  widthClass = "w-full lg:w-52 shrink-0",
  allowFutureSteps = false,
}: {
  className?: string;
  descriptions?: string[];
  clickPastSteps?: boolean;
  widthClass?: string;
  allowFutureSteps?: boolean;
}) {
  const { step, titles, goTo } = useWizard();
  const currentStep = step + 1;

  return (
    <aside
      className={cn(
        "relative flex flex-col items-center border-line bg-paper",
        widthClass,
        className,
      )}
    >
      <div className="flex flex-col">
        {titles.map((title, index) => {
          const stepNumber = index + 1;
          const isDone = stepNumber < currentStep;
          const isActive = stepNumber === currentStep;
          const isLast = index === titles.length - 1;
          const isPastClickable = clickPastSteps && isDone;
          const isFutureClickable = allowFutureSteps && !isDone && !isActive;
          const isClickable = isPastClickable || isFutureClickable;

          return (
            <div key={title + index} className="flex gap-4">
              <div className="flex w-7 shrink-0 flex-col items-center self-stretch">
                <button
                  type="button"
                  disabled={!isClickable}
                  onClick={() => isClickable && goTo(index)}
                  className={cn(
                    "flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-accent",
                    isDone && "border border-accent bg-accent text-paper",
                    isActive &&
                      !isDone &&
                      "border border-accent bg-accent text-paper shadow-sm",
                    !isDone &&
                      !isActive &&
                      "border border-line bg-surface-2 text-ink-mute",
                    isClickable
                      ? "cursor-pointer hover:opacity-80"
                      : "cursor-default",
                  )}
                >
                  {isDone ? (
                    <Check className="size-4 stroke-[2.5]" />
                  ) : (
                    stepNumber
                  )}
                </button>

                {!isLast && (
                  <div
                    className="w-0.5 flex-1 rounded-full bg-line"
                    aria-hidden="true"
                  />
                )}
              </div>

              <button
                type="button"
                disabled={!isClickable}
                onClick={() => isClickable && goTo(index)}
                className={cn(
                  "min-w-0 flex-1 pb-12 text-left transition-opacity focus-visible:outline-2 focus-visible:outline-accent",
                  isLast && "pb-0",
                  isClickable
                    ? "cursor-pointer hover:opacity-80"
                    : "cursor-default",
                )}
              >
                <div
                  className={cn(
                    "text-base font-semibold leading-tight transition-colors duration-200",
                    isActive && "text-accent",
                    isDone && !isActive && "text-ink",
                    !isActive && !isDone && "text-ink-mute",
                  )}
                >
                  {title}
                </div>
                {descriptions[index] && (
                  <div className="mt-1 text-sm text-ink-mute">
                    {descriptions[index]}
                  </div>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
