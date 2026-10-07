import type { ReactElement, ReactNode } from "react";

export type StepValidator = () => boolean | Promise<boolean>;

export interface WizardStepProps {
  title?: string;
  validate?: StepValidator;
  children?: ReactNode;
  className?: string;
}

export interface InternalStepProps {
  __index?: number;
}

export type WizardChildElement = ReactElement<{ children?: ReactNode }>;

export interface WizardContextValue {
  step: number;
  total: number;
  isFirst: boolean;
  isLast: boolean;
  goTo: (index: number) => void;
  next: () => Promise<void>;
  prev: () => void;
  titles: string[];
  __setValidator: (index: number, validator: StepValidator | null) => void;
}

export interface WizardProps {
  initialStep?: number;
  labels?: string[];
  onStepChange?: (nextStep: number, previousStep: number) => void;
  className?: string;
  children: ReactNode;
}
