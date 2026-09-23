import type { ReactNode } from "react";

import HeroCtaField from "./HeroCtaField";
import TrustStripFields from "./TrustStripFields";
import RichTextField from "@/components/admin/ui/RichTextField";
import { SectionCard } from "@/components/admin/ui/SectionCard";

import { HeroVisibilityKey } from "@/lib/constants/hero";
import type { NavigationDestinationOption } from "@/lib/constants/navigation";
import type { FieldErrors, HeroContent, HeroRules } from "@/types/hero";

interface HeroContentFieldsProps {
  content: HeroContent;
  rules: HeroRules;
  errors: FieldErrors;
  navigationDestinations: NavigationDestinationOption[];
  elementToggle: (key: string) => ReactNode;
  ctaDestinationDisabled: (key: string) => boolean;
  onPatch: (changes: Partial<HeroContent>) => void;
}

export function HeroEyebrowSection({
  content,
  rules,
  errors,
  elementToggle,
  onPatch,
}: Pick<
  HeroContentFieldsProps,
  "content" | "rules" | "errors" | "elementToggle" | "onPatch"
>) {
  return (
    <SectionCard title="Hero content">
      <RichTextField
        label="Eyebrow"
        required
        value={content.eyebrow}
        onChange={(eyebrow) => onPatch({ eyebrow })}
        allowedFeatures={rules.textFeatures}
        defaults={{
          fontFamily: rules.eyebrow.font,
          fontSize: rules.eyebrow.size,
        }}
        maxChars={rules.eyebrow.max}
        error={!!errors.eyebrow}
        hint={errors.eyebrow}
        tooltip="The small kicker above the headline. Floating renders it inside a pill, so it must stay on one line."
        labelAction={elementToggle(HeroVisibilityKey.EYEBROW)}
      />
    </SectionCard>
  );
}

export function HeroCtaTrustSection({
  content,
  rules,
  errors,
  navigationDestinations,
  elementToggle,
  ctaDestinationDisabled,
  onPatch,
}: HeroContentFieldsProps) {
  return (
    <SectionCard title="Calls to action & trust strip">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <HeroCtaField
          label="Primary CTA — label"
          target={content.primaryCta}
          destinations={navigationDestinations}
          labelMaxChars={rules.ctaLabel.max}
          labelError={!!errors["primaryCta.label"]}
          labelHint={errors["primaryCta.label"]}
          labelAction={elementToggle(HeroVisibilityKey.PRIMARY_CTA)}
          destinationError={!!errors["primaryCta.destinationKey"]}
          destinationHint={errors["primaryCta.destinationKey"]}
          destinationDisabled={ctaDestinationDisabled(
            HeroVisibilityKey.PRIMARY_CTA,
          )}
          onChange={(primaryCta) => onPatch({ primaryCta })}
        />
        <HeroCtaField
          label="Secondary CTA — label"
          target={content.secondaryCta}
          destinations={navigationDestinations}
          labelMaxChars={rules.ctaLabel.max}
          labelError={!!errors["secondaryCta.label"]}
          labelHint={errors["secondaryCta.label"]}
          labelAction={elementToggle(HeroVisibilityKey.SECONDARY_CTA)}
          destinationError={!!errors["secondaryCta.destinationKey"]}
          destinationHint={errors["secondaryCta.destinationKey"]}
          destinationDisabled={ctaDestinationDisabled(
            HeroVisibilityKey.SECONDARY_CTA,
          )}
          onChange={(secondaryCta) => onPatch({ secondaryCta })}
        />
      </div>

      <TrustStripFields
        value={content.trustStrip}
        segmentMax={rules.trustStrip.segmentMax}
        itemsMax={rules.trustStrip.itemsMax}
        totalMax={rules.trustStrip.max}
        error={!!errors.trustStrip}
        hint={errors.trustStrip}
        labelAction={elementToggle(HeroVisibilityKey.TRUST_STRIP)}
        onChange={(trustStrip) => onPatch({ trustStrip })}
      />
    </SectionCard>
  );
}
