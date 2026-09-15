import InputField from "@/components/admin/ui/InputField";
import TextArea from "@/components/admin/ui/TextArea";

import { HeadFields, SectionCard, type AboutSectionProps } from "./shared";

import { AboutSectionKey } from "@/lib/constants/about";

/** The closing band at the foot of the page. */
const CtaSection = ({
  content,
  rules,
  errors,
  patchSection,
  toggle,
  elementToggles,
}: AboutSectionProps) => {
  const { cta } = content;

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
        <InputField
          label="Primary button — link"
          value={cta.primary.url}
          onChange={(e) =>
            patchSection("cta", {
              primary: { ...cta.primary, url: e.target.value },
            })
          }
          error={!!errors["cta.primary.url"]}
          hint={errors["cta.primary.url"]}
          tooltip="An anchor on the home page (/#contact), a path (/projects) or a full URL."
        />
      </div>

      <label className="flex items-center gap-2 text-xs font-semibold text-ink-mute">
        <input
          type="checkbox"
          checked={cta.secondary !== null}
          onChange={(e) =>
            patchSection("cta", {
              secondary: e.target.checked
                ? { label: "", url: "/#portfolio" }
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
          <InputField
            label="Secondary button — link"
            value={cta.secondary.url}
            onChange={(e) =>
              patchSection("cta", {
                secondary: { ...cta.secondary!, url: e.target.value },
              })
            }
            error={!!errors["cta.secondary.url"]}
            hint={errors["cta.secondary.url"]}
          />
        </div>
      )}
      {elementToggles(AboutSectionKey.CTA)}
    </SectionCard>
  );
};

export default CtaSection;
