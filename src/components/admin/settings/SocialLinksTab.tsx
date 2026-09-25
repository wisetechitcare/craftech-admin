import InputField from "@/components/admin/ui/InputField";
import ListRow from "@/components/admin/ui/ListRow";
import { SectionCard } from "@/components/admin/ui/SectionCard";
import {
  SectionVisibilitySwitch,
  VisibilityToggle,
  isVisible,
} from "@/components/admin/ui/VisibilityToggle";

import { DragList } from "@/lib/constants/drag-lists";
import {
  ContactVisibilitySection,
  SOCIAL_PLATFORM_LABELS,
  SocialPlatform,
  socialVisibilityKey,
} from "@/lib/constants/settings";
import type { SettingsTabProps, SocialLink } from "@/types/settings";
import { move, patchAt } from "@/utils/utils";

const PLATFORM_ORDER = Object.values(SocialPlatform);

/** Every platform is listed whether or not it has a URL, so one that is empty
 *  today can still be dragged into the place it will hold once it is filled. */
const withEveryPlatform = (stored: SocialLink[]): SocialLink[] => {
  const seen = stored.filter(({ platform }) =>
    PLATFORM_ORDER.includes(platform),
  );
  const missing = PLATFORM_ORDER.filter(
    (platform) => !seen.some((link) => link.platform === platform),
  );
  return [...seen, ...missing.map((platform) => ({ platform, url: "" }))];
};

const SocialLinksTab = ({
  data,
  errors,
  patch,
  visibility,
  patchVisibility,
}: SettingsTabProps) => {
  const links = withEveryPlatform(data.socialLinks ?? []);
  const sectionVisible = isVisible(visibility, ContactVisibilitySection.SOCIAL);

  return (
    <SectionCard
      title="Social links"
      description="Full profile URLs. Only the ones filled in are shown, as icons in the footer and contact section, and they are listed for search engines. Drag to change the order they appear in."
      controls={
        <SectionVisibilitySwitch
          visible={sectionVisible}
          onChange={(visible) =>
            patchVisibility(ContactVisibilitySection.SOCIAL, visible)
          }
        />
      }
    >
      {/* The grip badge sits on each card's top edge, so the rows need room
          above them for it to land in rather than over the row before. */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-6 pt-2">
        {links.map(({ platform, url }, index) => {
          const error = errors[`socialLinks.${index}.url`];
          const key = socialVisibilityKey(platform);

          return (
            <ListRow
              key={platform}
              title={SOCIAL_PLATFORM_LABELS[platform]}
              index={index}
              count={links.length}
              listId={DragList.SETTINGS_SOCIAL_LINKS}
              chrome="grip"
              showRemove={false}
              onMove={(from, to) =>
                patch({ socialLinks: move(links, from, to) })
              }
              onRemove={() => undefined}
            >
              <InputField
                label={SOCIAL_PLATFORM_LABELS[platform]}
                type="url"
                placeholder="https://"
                value={url}
                onChange={(e) =>
                  patch({
                    socialLinks: patchAt(links, index, { url: e.target.value }),
                  })
                }
                error={!!error}
                hint={error}
                labelAction={
                  <VisibilityToggle
                    visible={sectionVisible && isVisible(visibility, key)}
                    disabled={!sectionVisible}
                    onChange={(visible) => patchVisibility(key, visible)}
                  />
                }
              />
            </ListRow>
          );
        })}
      </div>
    </SectionCard>
  );
};

export default SocialLinksTab;
