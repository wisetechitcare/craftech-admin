import type { ReactNode } from "react";

import InputField from "@/components/admin/ui/InputField";
import SelectField from "@/components/admin/ui/SelectField";

import {
  navigationDestinationSelectOptions,
  withNavigationDestinationKey,
  type NavigationDestinationOption,
} from "@/lib/constants/navigation";
import type { HeroCta } from "@/types/hero";

interface HeroCtaFieldProps {
  label: string;
  target: HeroCta;
  destinations: NavigationDestinationOption[];
  labelMaxChars: number;
  labelError: boolean;
  labelHint?: string;
  labelAction?: ReactNode;
  destinationError: boolean;
  destinationHint?: string;
  destinationDisabled: boolean;
  onChange: (cta: HeroCta) => void;
}

export default function HeroCtaField({
  label,
  target,
  destinations,
  labelMaxChars,
  labelError,
  labelHint,
  labelAction,
  destinationError,
  destinationHint,
  destinationDisabled,
  onChange,
}: HeroCtaFieldProps) {
  const options = navigationDestinationSelectOptions(destinations);

  return (
    <>
      <InputField
        label={label}
        value={target.label}
        onChange={(e) => onChange({ ...target, label: e.target.value })}
        maxChars={labelMaxChars}
        error={labelError}
        hint={labelHint}
        labelAction={labelAction}
      />
      <SelectField
        label="Destination"
        value={target.destinationKey}
        options={options}
        onValueChange={(value) => {
          const next = withNavigationDestinationKey(
            target,
            value,
            destinations,
          );
          if (next) onChange(next);
        }}
        error={destinationError}
        hint={destinationHint}
        disabled={destinationDisabled}
        tooltip="Where this button takes visitors. Internal pages and sections are chosen from the list — no paths to type."
      />
    </>
  );
}
