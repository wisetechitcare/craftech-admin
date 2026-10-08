import React, {
  Children,
  cloneElement,
  isValidElement,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useWizard, WizardContext } from "@/hooks/use-wizard";
import { cn } from "@/utils/utils";
import type {
  InternalStepProps,
  StepValidator,
  WizardChildElement,
  WizardContextValue,
  WizardProps,
  WizardStepProps,
} from "@/types/wizard";

function findSteps(
  nodes: React.ReactNode,
): React.ReactElement<WizardStepProps>[] {
  const result: React.ReactElement<WizardStepProps>[] = [];

  Children.forEach(nodes, (child) => {
    if (!isValidElement(child)) return;

    const element = child as WizardChildElement;
    const type = element.type as { __isWizardStep?: boolean };

    if (type.__isWizardStep) {
      result.push(element as React.ReactElement<WizardStepProps>);
      return;
    }

    if (element.props?.children) {
      result.push(...findSteps(element.props.children));
    }
  });

  return result;
}

function renderActiveStep(
  nodes: React.ReactNode,
  activeStep: number,
  stepIndexMap: Map<React.ReactElement, number>,
): React.ReactNode {
  return Children.map(nodes, (child) => {
    if (!isValidElement(child)) return child;

    const element = child as WizardChildElement;
    const type = element.type as { __isWizardStep?: boolean };

    if (type.__isWizardStep) {
      const stepIndex = stepIndexMap.get(
        element as React.ReactElement<WizardStepProps>,
      );

      if (stepIndex === activeStep) {
        return cloneElement<WizardStepProps & InternalStepProps>(
          element as React.ReactElement<WizardStepProps>,
          { __index: stepIndex },
        );
      }

      return null;
    }

    if (element.props?.children) {
      return cloneElement(element, {
        children: renderActiveStep(
          element.props.children,
          activeStep,
          stepIndexMap,
        ),
      });
    }

    return child;
  });
}

function Step({
  title,
  validate,
  children,
  className,
  __index,
}: WizardStepProps & InternalStepProps) {
  const { __setValidator } = useWizard();

  useEffect(() => {
    if (typeof __index !== "number") return;

    __setValidator(__index, validate ?? null);

    return () => {
      __setValidator(__index, null);
    };
  }, [__index, validate, __setValidator]);

  return (
    <section className={className} aria-label={title}>
      {children}
    </section>
  );
}

Step.__isWizardStep = true;

export default function Wizard({
  initialStep = 0,
  labels,
  onStepChange,
  className,
  children,
}: WizardProps) {
  const steps = findSteps(children);

  const [step, setStep] = useState(() =>
    Math.min(Math.max(0, initialStep), Math.max(steps.length - 1, 0)),
  );

  const [validators, setValidators] = useState<
    Record<number, StepValidator | null>
  >({});

  const setValidatorStable = useCallback(
    (index: number, validator: StepValidator | null) => {
      setValidators((currentValidators) =>
        currentValidators[index] === validator
          ? currentValidators
          : { ...currentValidators, [index]: validator },
      );
    },
    [],
  );

  const titles = useMemo(() => {
    const titlesFromSteps = steps
      .map((wizardStep) => wizardStep.props.title?.trim())
      .filter(Boolean) as string[];

    const source =
      labels && labels.length === steps.length ? labels : titlesFromSteps;

    return source.length === steps.length
      ? source
      : steps.map((_, index) => `Step ${index + 1}`);
  }, [labels, steps]);

  const goTo = useCallback(
    (index: number) => {
      setStep((previousStep) => {
        const nextStep = Math.min(Math.max(0, index), steps.length - 1);

        if (nextStep !== previousStep) {
          onStepChange?.(nextStep, previousStep);
        }

        return nextStep;
      });
    },
    [onStepChange, steps.length],
  );

  const prev = useCallback(() => {
    goTo(step - 1);
  }, [goTo, step]);

  const next = useCallback(async () => {
    const validator = validators[step];

    if (validator) {
      const isValid = await validator();
      if (!isValid) return;
    }

    if (step < steps.length - 1) {
      goTo(step + 1);
    }
  }, [validators, step, steps.length, goTo]);

  const contextValue = useMemo<WizardContextValue>(
    () => ({
      step,
      total: steps.length,
      isFirst: step === 0,
      isLast: step === steps.length - 1,
      goTo,
      next,
      prev,
      titles,
      __setValidator: setValidatorStable,
    }),
    [goTo, next, prev, setValidatorStable, step, steps.length, titles],
  );

  const stepIndexMap = useMemo(() => {
    const map = new Map<React.ReactElement, number>();
    steps.forEach((wizardStep, index) => {
      map.set(wizardStep, index);
    });
    return map;
  }, [steps]);

  return (
    <WizardContext.Provider value={contextValue}>
      <div className={cn("w-full", className)}>
        {renderActiveStep(children, step, stepIndexMap)}
      </div>
    </WizardContext.Provider>
  );
}

Wizard.Step = Step as React.FC<WizardStepProps> & { __isWizardStep: true };
