import ToggleField from "./ToggleField";

import { SectionCard } from "@/components/admin/ui/SectionCard";
import TextArea from "@/components/admin/ui/TextArea";

import { SETTINGS_LIMITS } from "@/lib/constants/settings";
import type { SettingsTabProps } from "@/types/settings";

const AdvancedTab = ({ data, errors, patch }: SettingsTabProps) => (
  <SectionCard
    title="Site status"
    description="Takes effect on the website within a minute of saving."
  >
    <ToggleField
      label="Maintenance mode"
      description="Every public page shows the maintenance message instead of its content, and asks search engines not to index it. The admin preview keeps working."
      checked={data.maintenanceMode}
      onChange={(maintenanceMode) => patch({ maintenanceMode })}
    />
    <TextArea
      label="Maintenance message"
      rows={2}
      value={data.maintenanceMessage ?? ""}
      onChange={(e) => patch({ maintenanceMessage: e.target.value })}
      maxChars={SETTINGS_LIMITS.maintenanceMessage}
      placeholder="We're making some improvements and will be back shortly."
      error={!!errors.maintenanceMessage}
      hint={errors.maintenanceMessage ?? "Empty shows the placeholder text."}
    />
  </SectionCard>
);

export default AdvancedTab;
