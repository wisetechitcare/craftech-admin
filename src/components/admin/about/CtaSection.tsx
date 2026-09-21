import InputField from "@/components/admin/ui/InputField";
import SelectField from "@/components/admin/ui/SelectField";
import TextArea from "@/components/admin/ui/TextArea";

import { HeadFields, SectionCard, type AboutSectionProps } from "./shared";

import { AboutSectionKey } from "@/lib/constants/about";
import {
  navigationDestinationSelectOptions,
  withNavigationDestinationKey,
} from "@/lib/constants/navigation";

const CtaSection = ({
  content,
  rules,
  navigationDestinations,
  errors,
  patchSection,
  toggle,
  elementToggles,
}: AboutSectionProps) => {
  const { cta } = content;
  const destinationOptions = navigationDestinationSelectOptions(
    navigationDestinations,
  );

  return (
    <SectionCard
      title="Call to Action"
      description="The closing band at the foot of the page."
      controls={toggle(AboutSectionKey.CTA)}
    >
      <HeadFields
        section={cta}
        rules={rules}
        errors={errors}
        path="cta"
        onChange={(changes) => patchSection("cta", changes)}
      />
      <TextArea
        label="Text"
        value={cta.description}
        onChange={(e) => patchSection("cta", { description: e.target.value })}
        maxChars={rules.ctaDescription.max}
        error={!!errors["cta.description"]}
        hint={errors["cta.description"]}
        tooltip="Optional — leave empty to show the heading and buttons alone."
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField
          label="Primary button — label"
          value={cta.primary.label}
          onChange={(e) =>
            patchSection("cta", {
              primary: { ...cta.primary, label: e.target.value },
            })
          }
          maxChars={rules.ctaLabel.max}
          error={!!errors["cta.primary.label"]}
          hint={errors["cta.primary.label"]}
        />
        <SelectField
          label="Destination"
          value={cta.primary.destinationKey}
          options={destinationOptions}
          onValueChange={(value) => {
            const next = withNavigationDestinationKey(
              cta.primary,
              value,
              navigationDestinations,
            );
            if (next) patchSection("cta", { primary: next });
          }}
          error={!!errors["cta.primary.destinationKey"]}
          hint={errors["cta.primary.destinationKey"]}
          tooltip="Where this button takes visitors. Internal pages and sections are chosen from the list — no paths to type."
        />
      </div>

      <label className="flex items-center gap-2 text-xs font-semibold text-ink-mute">
        <input
          type="checkbox"
          checked={cta.secondary !== null}
          onChange={(e) =>
            patchSection("cta", {
              secondary: e.target.checked
                ? { label: "", destinationKey: "portfolio" }
                : null,
            })
          }
        />
        Show a second button
      </label>

      {cta.secondary && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label="Secondary button — label"
            value={cta.secondary.label}
            onChange={(e) =>
              patchSection("cta", {
                secondary: { ...cta.secondary!, label: e.target.value },
              })
            }
            maxChars={rules.ctaLabel.max}
            error={!!errors["cta.secondary.label"]}
            hint={errors["cta.secondary.label"]}
          />
          <SelectField
            label="Destination"
            value={cta.secondary.destinationKey}
            options={destinationOptions}
            onValueChange={(value) => {
              const next = withNavigationDestinationKey(
                cta.secondary!,
                value,
                navigationDestinations,
              );
              if (next) patchSection("cta", { secondary: next });
            }}
            error={!!errors["cta.secondary.destinationKey"]}
            hint={errors["cta.secondary.destinationKey"]}
            tooltip="Where this button takes visitors. Internal pages and sections are chosen from the list — no paths to type."
          />
        </div>
      )}
      {elementToggles(AboutSectionKey.CTA)}
    </SectionCard>
  );
};

export default CtaSection;
