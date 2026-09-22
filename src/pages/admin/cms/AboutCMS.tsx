import React, { useEffect, useState, type ComponentType } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Save, Loader2, Palette, Eye } from "lucide-react";

import CtaSection from "@/components/admin/about/CtaSection";
import HowWeWorkSection from "@/components/admin/about/HowWeWorkSection";
import StatsSection from "@/components/admin/about/StatsSection";
import StorySection from "@/components/admin/about/StorySection";
import WhatWeDoSection from "@/components/admin/about/WhatWeDoSection";
import WhoWeAreSection from "@/components/admin/about/WhoWeAreSection";
import WhyChooseUsSection from "@/components/admin/about/WhyChooseUsSection";
import { type AboutSectionProps } from "@/components/admin/about/shared";
import { DragBlock } from "@/components/admin/ui/DragList";
import PreviewPanel from "@/components/admin/ui/PreviewPanel";
import { PreviewSection } from "@/components/admin/ui/SitePreview";
import {
  ElementVisibility,
  SectionVisibilitySwitch,
  VisibilityToggle,
  isVisible,
  type VisibilityMap,
  type VisibilitySection,
} from "@/components/admin/ui/VisibilityToggle";
import { AdminInfoCallout, PageHeader } from "@/components/common";
import { Button } from "@/components/ui/button";

import { ABOUT_GROUP, AboutSectionKey } from "@/lib/constants/about";
import type { NavigationDestinationOption } from "@/lib/constants/navigation";
import { DragList } from "@/lib/constants/drag-lists";
import { aboutApi, appearanceApi } from "@/services/api";
import {
  ABOUT_VARIANT_LABELS,
  type AboutContent,
  type AboutResponse,
  type AboutRules,
  type AboutVariant,
  type FieldErrors,
} from "@/types/about";
import { LayoutVariant } from "@/types/common";
import { move } from "@/utils/utils";

/** The seven cards this page is made of, keyed as the server's registry names
 *  them. A map rather than a fixed run of JSX, so the form can be rendered in
 *  whatever order Appearance stores. Its own key order is only the fallback for
 *  an Appearance request that never answers. */
const SECTIONS: Record<
  string,
  { label: string; Component: ComponentType<AboutSectionProps> }
> = {
  [AboutSectionKey.STORY]: { label: "Our Story", Component: StorySection },
  [AboutSectionKey.STATS]: { label: "Stats", Component: StatsSection },
  [AboutSectionKey.WHO_WE_ARE]: {
    label: "Who We Are",
    Component: WhoWeAreSection,
  },
  [AboutSectionKey.WHAT_WE_DO]: {
    label: "What We Do",
    Component: WhatWeDoSection,
  },
  [AboutSectionKey.WHY_CHOOSE_US]: {
    label: "Why Choose Us",
    Component: WhyChooseUsSection,
  },
  [AboutSectionKey.HOW_WE_WORK]: {
    label: "How We Work",
    Component: HowWeWorkSection,
  },
  [AboutSectionKey.CTA]: { label: "Call to Action", Component: CtaSection },
};

const DEFAULT_ORDER = Object.keys(SECTIONS);

const PINNED_REASON =
  "This layout draws this section inside another one, so it has no place of its own to move to. Switch layouts in Appearance to reorder it.";

/**
 * The whole /about page, edited as one document and saved in one request
 * (PUT /cms/about → home.aboutPage). Nothing here is shared with the homepage
 * any more: What We Do, Why Choose Us, How We Work and the values list belong
 * to this page alone, so reordering or deleting a row cannot move something on
 * the home page too.
 *
 * Validation lives on the server. Limits arrive with the payload as `rules`, so
 * the counters below measure against exactly what a save will accept, and a
 * rejected save renders its per-field messages next to the offending inputs.
 *
 * Dragging produces nothing but a move, into this component's state. There is
 * no reorder request, and nothing is written until Save.
 */
export default function AboutCMS() {
  const [content, setContent] = useState<AboutContent | null>(null);
  const [variant, setVariant] = useState<AboutVariant>(
    LayoutVariant.CLEAN_MODERN,
  );
  const [rules, setRules] = useState<AboutRules | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);

  // Visibility and section order are Appearance's record, not this document —
  // hiding or moving a section is a layout decision and must not cost the admin
  // the copy behind it. The controls live here because this is where those
  // sections are edited; both still write to the Appearance row. `sections` and
  // `orderable` are the server's catalogues, so nothing is hardcoded below.
  const [visibility, setVisibility] = useState<VisibilityMap>({});
  const [sections, setSections] = useState<VisibilitySection[]>([]);
  const [order, setOrder] = useState<string[]>(DEFAULT_ORDER);
  const [orderable, setOrderable] = useState<string[]>(DEFAULT_ORDER);
  const [navigationDestinations, setNavigationDestinations] = useState<
    NavigationDestinationOption[]
  >([]);

  const apply = (data: AboutResponse) => {
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
    aboutApi
      .get()
      .then(({ data }) => apply(data.data))
      .catch(() => toast.error("Failed to load About content"))
      .finally(() => setLoading(false));

    // Separate request, separate document. A failure here costs the toggles and
    // the handles, not the form: the content is still fully editable without
    // them, and the sections keep the order declared above.
    appearanceApi
      .get()
      .then(({ data }) => {
        const record = data.data;
        const map: VisibilityMap = record.visibility ?? {};
        setVisibility(map);
        setSections(
          record.visibilityOptions?.find((group) => group.key === ABOUT_GROUP)
            ?.sections ?? [],
        );
        // Repaired server-side, so this is always a complete list.
        setOrder(record.sectionOrder ?? DEFAULT_ORDER);
        setOrderable(record.sectionOrderOptions ?? DEFAULT_ORDER);
      })
      .catch(() => toast.error("Failed to load section layout"));
  }, []);

  const patch = (changes: Partial<AboutContent>) =>
    setContent((prev) => (prev ? { ...prev, ...changes } : prev));

  const patchSection = <K extends keyof AboutContent>(
    key: K,
    changes: Partial<AboutContent[K]>,
  ) =>
    setContent((prev) =>
      prev ? { ...prev, [key]: { ...prev[key], ...changes } } : prev,
    );

  // Only the key that moved is written. The map stays sparse on purpose:
  // absent means visible, so a section this build has never heard of is never
  // pinned to whatever this form happened to render for it.
  const patchVisibility = (key: string, visible: boolean) =>
    setVisibility((prev) => ({ ...prev, [key]: visible }));

  // /about has no page-level flag of its own — the server's registry lists
  // "about" as a group, and the site guards one section key at a time. So the
  // page reads as hidden only once every section it serves is.
  // ponytail: showing it again marks all of them visible, losing whichever
  // sections were hidden one by one. A real "about" key in the registry, guarded
  // in the site's /about render, is the upgrade.
  const pageVisible =
    sections.length === 0 ||
    sections.some((section) => isVisible(visibility, section.key));

  const patchPageVisibility = (visible: boolean) =>
    setVisibility((prev) => ({
      ...prev,
      ...Object.fromEntries(sections.map((section) => [section.key, visible])),
    }));

  // A drop produces nothing but this, the same transform the arrows use.
  const moveSection = (from: number, to: number) =>
    setOrder((prev) => move(prev, from, to));

  // Both read the server's catalogue rather than a list written here, so a
  // section or element added on the server appears with no change to this file
  // — and if the Appearance request failed, no toggle is drawn that could not
  // be saved anyway.
  const sectionToggle = (key: string) =>
    sections.some((section) => section.key === key) ? (
      <VisibilityToggle
        visible={isVisible(visibility, key)}
        onChange={(v) => patchVisibility(key, v)}
      />
    ) : null;

  // Only the keys THIS layout honours can hide anything in the preview. The
  // stored map deliberately keeps flags set under other layouts, and the live
  // page ignores those — `sections` is the server's catalogue for the variant
  // that is actually live, so asking it is the same question the site asks.
  const previewShows = (key: string) =>
    !sections.some(
      (sec) =>
        sec.key === key || (sec.elements ?? []).some((el) => el.key === key),
    ) || isVisible(visibility, key);

  const hiddenCount = Object.keys(visibility).filter(
    (key) => !previewShows(key),
  ).length;

  const elementToggles = (key: string) => {
    const elements = sections.find((section) => section.key === key)?.elements;
    return elements?.length ? (
      <ElementVisibility
        elements={elements}
        map={visibility}
        sectionVisible={isVisible(visibility, key)}
        onChange={patchVisibility}
      />
    ) : null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content) return;
    setErrors({});
    setSaving(true);
    try {
      const { data } = await aboutApi.update(content);
      apply(data.data);

      // Separate document, so a separate request. Sent on EVERY save, never
      // conditionally: a "has it changed?" guard here saved one cheap
      // idempotent write and, when its baseline was wrong for any reason,
      // skipped the write while still reporting success — a save that silently
      // does nothing is far more expensive than the request it avoided.
      try {
        const { data: appearance } = await appearanceApi.update({
          visibility,
          sectionOrder: order,
        });
        // Trust the server's copy over local state, so what the toggles and the
        // card order show after a save is what was actually stored.
        setVisibility(appearance.data.visibility ?? {});
        setOrder(appearance.data.sectionOrder ?? order);
      } catch {
        // The copy is already saved. Say which half did not land rather than
        // reporting the whole save as failed and inviting a pointless retry.
        toast.error(
          "Content saved, but the section layout did not. Try again.",
        );
        return;
      }
      toast.success("About page updated successfully");
    } catch (err) {
      // The API returns a per-field map keyed by its zod path alongside the
      // summary message. Rendering it beside the offending input beats a
      // blanket "Update failed" toast on a form this long.
      const res = (
        err as {
          response?: { data?: { message?: string; fields?: FieldErrors } };
        }
      ).response;
      setErrors(res?.data?.fields || {});
      toast.error(res?.data?.message || "Failed to save About content");
    } finally {
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
        About content is unavailable. Reload to try again.
      </p>
    );
  }

  const sectionProps: AboutSectionProps = {
    content,
    rules,
    navigationDestinations,
    errors,
    patch,
    patchSection,
    toggle: sectionToggle,
    elementToggles,
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="About CMS"
        description="Every section of the About page (/about) — headings, copy, images and all of its lists. Drag a card by its handle to reorder the page. The switch hides every section; nothing is deleted."
        action={
          sections.length > 0 && (
            <SectionVisibilitySwitch
              visible={pageVisible}
              onChange={patchPageVisibility}
            />
          )
        }
      />

      {/* Variant is Appearance's to choose; About CMS only reads it, because the
          limits below are written for the tightest of the three layouts. */}
      <AdminInfoCallout
        icon={Palette}
        description={
          <>
            About style: <strong>{ABOUT_VARIANT_LABELS[variant]}</strong> —
            layout only; this content is shown by all three.
          </>
        }
        action={
          <Link
            to="/admin/appearance/about"
            className="text-xs font-bold text-info underline underline-offset-2"
          >
            Change in Appearance
          </Link>
        }
      />

      <PreviewPanel
        section={PreviewSection.ABOUT}
        placement="side"
        draft={{
          aboutContent: content,
          appearance: {
            aboutVariant: variant,
            visibility,
            // The dragged order, before it is saved.
            sectionOrder: order,
          },
        }}
        viewportHeight={3200}
        sectionHidden={!pageVisible}
        onShowSection={() => patchPageVisibility(true)}
        title={
          <>
            Preview{" "}
            <span className="text-ink-faint normal-case font-normal">
              — {ABOUT_VARIANT_LABELS[variant]}
            </span>
          </>
        }
        caption="The live About page, rendered by the website itself from what is typed here — scroll the panel for the rest of it. Nothing is saved until you press Save."
        actions={
          // Absent means visible, so the empty map IS the default and clearing
          // it is the whole reset — including flags set under the other two
          // layouts. Nothing is written until Save.
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
          {order.map((key, index) => {
            const section = SECTIONS[key];
            if (!section) return null;
            const { label, Component } = section;

            return (
              <DragBlock
                key={key}
                listId={DragList.ABOUT_SECTIONS}
                index={index}
                label={label}
                onMove={moveSection}
                pinnedReason={
                  orderable.includes(key) ? undefined : PINNED_REASON
                }
              >
                <Component {...sectionProps} />
              </DragBlock>
            );
          })}

          <div className="flex items-center justify-end gap-4">
            {Object.keys(errors).length > 0 && (
              <span className="text-xs text-danger">
                Fix the highlighted fields before saving.
              </span>
            )}
            <Button
              type="submit"
              disabled={saving}
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
