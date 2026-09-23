import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { isAxiosError } from "axios";
import toast from "react-hot-toast";
import { Save, Loader2, Palette, Eye } from "lucide-react";

import {
  EMPTY_SLIDE,
  HeroCtaTrustSection,
  HeroEyebrowSection,
  HeroSlidesSection,
  heroClientErrors,
} from "@/components/admin/hero";
import PreviewPanel from "@/components/admin/ui/PreviewPanel";
import { PreviewSection } from "@/components/admin/ui/SitePreview";
import {
  SectionVisibilitySwitch,
  VisibilityToggle,
  isVisible,
  type VisibilityMap,
  type VisibilitySection,
} from "@/components/admin/ui/VisibilityToggle";
import { AdminInfoCallout, PageHeader } from "@/components/common";
import { Button } from "@/components/ui/button";

import { HOME_VISIBILITY_GROUP, HeroVisibilityKey } from "@/lib/constants/hero";
import type { NavigationDestinationOption } from "@/lib/constants/navigation";
import { appearanceApi, heroApi } from "@/services/api";
import {
  HERO_VARIANT_LABELS,
  type FieldErrors,
  type HeroContent,
  type HeroResponse,
  type HeroRules,
  type HeroSlide,
  type HeroVariant,
} from "@/types/hero";
import { LayoutVariant } from "@/types/common";
import { move, removeAt } from "@/utils/utils";

export default function HeroCMS() {
  const [content, setContent] = useState<HeroContent | null>(null);
  const [variant, setVariant] = useState<HeroVariant>(LayoutVariant.FLOATING);
  const [rules, setRules] = useState<HeroRules | null>(null);
  const [serverErrors, setServerErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [visibility, setVisibility] = useState<VisibilityMap>({});
  const [sections, setSections] = useState<VisibilitySection[]>([]);
  const [navigationDestinations, setNavigationDestinations] = useState<
    NavigationDestinationOption[]
  >([]);

  const apply = (data: HeroResponse) => {
    const {
      variant: v,
      rules: r,
      navigationDestinations: dests,
      ...rest
    } = data;
    setVariant(v);
    setRules(r);
    setNavigationDestinations(dests);
    setContent(rest);
  };

  useEffect(() => {
    const loadHero = async () => {
      let message = "Failed to load Hero content";
      let isError = true;

      try {
        const response = await heroApi.get();

        if (response.data?.success) {
          isError = false;
          apply(response.data.data);
        }
      } catch (error) {
        if (isAxiosError(error)) {
          message = error.response?.data?.message || message;
        }
      } finally {
        if (isError) {
          toast.error(message);
        }
        setLoading(false);
      }
    };

    const loadVisibility = async () => {
      let message = "Failed to load section visibility";
      let isError = true;

      try {
        const response = await appearanceApi.get();
        message = response.data?.message || message;

        if (response.data?.success) {
          isError = false;
          const record = response.data.data;
          setVisibility(record.visibility ?? {});
          setSections(
            record.visibilityOptions?.find(
              (group) => group.key === HOME_VISIBILITY_GROUP,
            )?.sections ?? [],
          );
        }
      } catch (error) {
        if (isAxiosError(error)) {
          message = error.response?.data?.message || message;
        }
      } finally {
        if (isError) {
          toast.error(message);
        }
      }
    };

    void loadHero();
    void loadVisibility();
  }, []);

  const localErrors = useMemo(
    () => (content && rules ? heroClientErrors(content, rules) : {}),
    [content, rules],
  );
  const errors: FieldErrors = { ...localErrors, ...serverErrors };
  const blocked = Object.keys(localErrors).length > 0;

  const patch = (changes: Partial<HeroContent>) =>
    setContent((prev) => (prev ? { ...prev, ...changes } : prev));

  const patchVisibility = (key: string, visible: boolean) =>
    setVisibility((prev) => ({ ...prev, [key]: visible }));

  const heroSection = sections.find(
    (section) => section.key === HeroVisibilityKey.SECTION,
  );

  const previewShows = (key: string) =>
    !(
      heroSection?.key === key ||
      (heroSection?.elements ?? []).some((el) => el.key === key)
    ) || isVisible(visibility, key);

  const hiddenCount = Object.keys(visibility).filter(
    (key) => !previewShows(key),
  ).length;

  const heroVisible = isVisible(visibility, HeroVisibilityKey.SECTION);
  const elementToggle = (key: string) =>
    heroSection?.elements?.some((el) => el.key === key) ? (
      <VisibilityToggle
        visible={heroVisible && isVisible(visibility, key)}
        disabled={!heroVisible}
        onChange={(v) => patchVisibility(key, v)}
      />
    ) : undefined;

  const ctaDestinationDisabled = (key: string): boolean =>
    !heroVisible ||
    Boolean(
      heroSection?.elements?.some((el) => el.key === key) &&
      !isVisible(visibility, key),
    );

  const patchSlide = (index: number, changes: Partial<HeroSlide>) =>
    setContent((prev) =>
      prev
        ? {
            ...prev,
            slides: prev.slides.map((s, i) =>
              i === index ? { ...s, ...changes } : s,
            ),
          }
        : prev,
    );

  const addSlide = () =>
    setContent((prev) =>
      prev ? { ...prev, slides: [...prev.slides, { ...EMPTY_SLIDE }] } : prev,
    );

  const removeSlide = (index: number) =>
    setContent((prev) =>
      prev ? { ...prev, slides: removeAt(prev.slides, index) } : prev,
    );

  const moveSlide = (from: number, to: number) =>
    setContent((prev) =>
      prev ? { ...prev, slides: move(prev.slides, from, to) } : prev,
    );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content) return;

    let message = "Something went wrong. Please try again.";
    let isError = true;

    setServerErrors({});
    setSaving(true);

    try {
      const response = await heroApi.update(content);

      if (response.data?.success) {
        apply(response.data.data);

        try {
          const appearanceResponse = await appearanceApi.update({ visibility });
          message =
            appearanceResponse.data?.message ||
            "Hero saved, but section visibility did not. Try again.";

          if (appearanceResponse.data?.success) {
            setVisibility(appearanceResponse.data.data.visibility ?? {});
            isError = false;
            message = "Hero updated successfully";
          }
        } catch (appearanceError) {
          if (isAxiosError(appearanceError)) {
            message =
              appearanceError.response?.data?.message ||
              "Hero saved, but section visibility did not. Try again.";
          } else {
            message = "Hero saved, but section visibility did not. Try again.";
          }
        }
      }
    } catch (error) {
      if (isAxiosError(error)) {
        message = error.response?.data?.message || message;
        setServerErrors(error.response?.data?.fields || {});
      }
    } finally {
      if (isError) {
        toast.error(message);
      } else {
        toast.success(message);
      }
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-ink-faint" />
      </div>
    );
  }
  if (!content || !rules) {
    return (
      <p className="text-sm text-ink-mute">
        Hero content is unavailable. Reload to try again.
      </p>
    );
  }

  const slideCount = content.slides.length;
  const mediaMax = slideCount > 1 ? 1 : rules.slides.imagesMax;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Hero CMS"
        description="Everything the homepage Hero renders — slides, headline copy and call-to-actions."
        action={
          heroSection && (
            <SectionVisibilitySwitch
              visible={heroVisible}
              onChange={(v) => patchVisibility(HeroVisibilityKey.SECTION, v)}
            />
          )
        }
      />

      <AdminInfoCallout
        icon={Palette}
        description={
          <>
            Hero style: <strong>{HERO_VARIANT_LABELS[variant]}</strong> —
            character limits below are set by this layout.
          </>
        }
        action={
          <Link
            to="/admin/appearance/hero"
            className="text-xs font-bold text-info underline underline-offset-2"
          >
            Change in Appearance
          </Link>
        }
      />

      <PreviewPanel
        section={PreviewSection.HERO}
        placement="above"
        draft={{
          heroContent: content,
          appearance: { heroVariant: variant, visibility },
        }}
        caption="The live Hero, rendered by the website itself from what is typed here. Nothing is saved until you press Save."
        sectionHidden={!heroVisible}
        onShowSection={() => patchVisibility(HeroVisibilityKey.SECTION, true)}
        actions={
          <Button
            size="xs"
            variant="none"
            onClick={() => setVisibility({})}
            disabled={hiddenCount === 0}
            startIcon={<Eye className="w-3 h-3" />}
            className="shrink-0 gap-1.5 rounded-full border border-line bg-raise px-2.5 py-1 text-xs font-bold text-ink-mute hover:text-ink"
          >
            {hiddenCount ? `Show all (${hiddenCount} hidden)` : "All visible"}
          </Button>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <HeroEyebrowSection
            content={content}
            rules={rules}
            errors={errors}
            elementToggle={elementToggle}
            onPatch={patch}
          />

          <HeroSlidesSection
            slides={content.slides}
            rules={rules}
            slideCount={slideCount}
            mediaMax={mediaMax}
            errors={errors}
            elementToggle={elementToggle}
            onAddSlide={addSlide}
            onMoveSlide={moveSlide}
            onRemoveSlide={removeSlide}
            onPatchSlide={patchSlide}
          />

          <HeroCtaTrustSection
            content={content}
            rules={rules}
            errors={errors}
            navigationDestinations={navigationDestinations}
            elementToggle={elementToggle}
            ctaDestinationDisabled={ctaDestinationDisabled}
            onPatch={patch}
          />

          <div className="flex items-center justify-end gap-4">
            {blocked && (
              <span className="text-xs text-danger">
                Fix the highlighted fields before saving.
              </span>
            )}
            <Button
              type="submit"
              disabled={saving || blocked}
              startIcon={
                saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )
              }
            >
              Save Changes
            </Button>
          </div>
        </form>
      </PreviewPanel>
    </div>
  );
}
