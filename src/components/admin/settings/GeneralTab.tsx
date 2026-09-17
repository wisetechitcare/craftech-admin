import InputField from "@/components/admin/ui/InputField";
import { SectionCard } from "@/components/admin/ui/SectionCard";
import TextArea from "@/components/admin/ui/TextArea";

import { SETTINGS_LIMITS } from "@/lib/constants/settings";
import type { SettingsTabProps } from "@/types/settings";

const GeneralTab = ({ data, errors, patch }: SettingsTabProps) => (
  <SectionCard title="General" description="Who this website belongs to.">
    <InputField
      label="Site name"
      required
      value={data.companyName}
      onChange={(e) => patch({ companyName: e.target.value })}
      maxChars={SETTINGS_LIMITS.companyName}
      error={!!errors.companyName}
      hint={
        errors.companyName ??
        "The business, organisation or person the site is for. Used in page titles, the footer copyright, the logo's alt text and lead emails."
      }
    />
    <TextArea
      label="Short description"
      rows={3}
      value={data.companyDescription ?? ""}
      onChange={(e) => patch({ companyDescription: e.target.value })}
      maxChars={SETTINGS_LIMITS.companyDescription}
      error={!!errors.companyDescription}
      hint={
        errors.companyDescription ??
        "A sentence or two shown in the footer. Search engines use it too when SEO has no default description."
      }
    />
  </SectionCard>
);

export default GeneralTab;
