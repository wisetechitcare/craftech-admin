import InputField from "@/components/admin/ui/InputField";
import { SectionCard } from "@/components/admin/ui/SectionCard";

import { SOCIAL_PLATFORMS } from "@/lib/constants/settings";
import type { SettingsTabProps } from "@/types/settings";

const SocialLinksTab = ({ data, errors, patch }: SettingsTabProps) => {
  const links = data.socialLinks ?? {};

  return (
    <SectionCard
      title="Social links"
      description="Full profile URLs. Only the ones filled in are shown, as icons in the footer, and they are listed for search engines."
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {SOCIAL_PLATFORMS.map(({ key, label }) => {
          const error = errors[`socialLinks.${key}`];
          return (
            <InputField
              key={key}
              label={label}
              type="url"
              placeholder="https://"
              value={links[key] ?? ""}
              onChange={(e) =>
                patch({ socialLinks: { ...links, [key]: e.target.value } })
              }
              error={!!error}
              hint={error}
            />
          );
        })}
      </div>
    </SectionCard>
  );
};

export default SocialLinksTab;
