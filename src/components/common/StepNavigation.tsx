import { ArrowLeft, ArrowRight } from "lucide-react";

import Button from "@/components/ui/button/Button";

import { useWizard } from "@/hooks/use-wizard";
import { cn } from "@/utils/utils";

export interface StepNavigationProps {
  onNext?: (goNext: () => Promise<void>) => void | Promise<void>;
  onFinish?: () => void | Promise<void>;
  disableNext?: boolean;
  disableBack?: boolean;
  backLabel?: string;
  nextLabel?: string;
  finishLabel?: string;
  showBack?: boolean;
  containerClassName?: string;
}

export const StepNavigation: React.FC<StepNavigationProps> = ({
  onNext,
  onFinish,
  disableNext = false,
  disableBack = false,
  backLabel = "Back",
  nextLabel = "Continue",
  finishLabel = "Submit",
  showBack = true,
  containerClassName,
}) => {
  const { isFirst, isLast, prev, next } = useWizard();
  const showBackButton = showBack && !isFirst;

  const handleNextClick = async () => {
    if (disableNext) return;

    if (isLast) {
      if (onFinish) await onFinish();
      else await next();
    } else if (onNext) {
      await onNext(next);
    } else {
      await next();
    }
  };

  const handleBackClick = () => {
    if (disableBack || isFirst) return;
    prev();
  };

  return (
    <div
      className={cn(
        "flex items-center gap-3 pt-4",
        showBackButton ? "justify-between" : "",
        containerClassName,
      )}
    >
      {showBackButton && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleBackClick}
          disabled={disableBack}
          startIcon={<ArrowLeft className="size-4" />}
        >
          {backLabel}
        </Button>
      )}

      <Button
        type="button"
        variant="primary"
        size="sm"
        onClick={handleNextClick}
        disabled={disableNext}
        endIcon={!isLast ? <ArrowRight className="size-4" /> : undefined}
        className={cn(!showBackButton && "w-full")}
      >
        {isLast ? finishLabel : nextLabel}
      </Button>
    </div>
  );
};
