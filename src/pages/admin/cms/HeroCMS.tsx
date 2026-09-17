import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import type { Accept } from "react-dropzone";
import { Save, Loader2, Plus, Palette, Eye } from "lucide-react";

import FileUpload from "../../../components/admin/ui/FileUpload";
import InputField from "../../../components/admin/ui/InputField";
import ListRow from "@/components/admin/ui/ListRow";
import TextArea from "../../../components/admin/ui/TextArea";
import SelectField from "../../../components/admin/ui/SelectField";
import PreviewPanel from "@/components/admin/ui/PreviewPanel";
import { PreviewSection } from "@/components/admin/ui/SitePreview";
import {
  SectionVisibilitySwitch,
  VisibilityToggle,
  isVisible,
  type VisibilityMap,
  type VisibilitySection,
} from "../../../components/admin/ui/VisibilityToggle";
import { AdminInfoCallout } from "@/components/common";
import { Button } from "@/components/ui/button";

import { DragList } from "@/lib/constants/drag-lists";
import { appearanceApi, heroApi, uploadApi } from "../../../services/api";
import {
  HERO_VARIANT_LABELS,
  isHeroVideo,
  type FieldErrors,
  type HeroContent,
  type HeroResponse,
  type HeroRules,
  type HeroSlide,
  type HeroVariant,
} from "../../../types/hero";
import { LayoutVariant } from "@/types/common";
import { move, removeAt } from "@/utils/utils";

const EMPTY_SLIDE: HeroSlide = {
  images: [],
  pos: "center center",
  title: "",
  accent: "",
  subtitle: "",
};

const POSITION_LABELS: Record<string, string> = {
  "left top": "Top left",
  "center top": "Top centre",
  "right top": "Top right",
  "left center": "Middle left",
  "center center": "Centre",
  "right center": "Middle right",
  "left bottom": "Bottom left",
  "center bottom": "Bottom centre",
  "right bottom": "Bottom right",
  "center 40%": "Centre, slightly high",
};

/** Mirrors the server's length rules so Save can be blocked before a round trip.
 *  Keys are the zod paths the API returns, so both sources render identically. */
function clientErrors(content: HeroContent, rules: HeroRules): FieldErrors {
  const errors: FieldErrors = {};
  const cap = (key: string, value: string, max: number, name: string) => {
    if (value.length > max)
      errors[key] =
        `${name} must be ${max} characters or fewer for this Hero style.`;
  };

  content.slides.forEach((slide, i) => {
    if (!slide.title.trim()) errors[`slides.${i}.title`] = "Title is required.";
    if (!slide.images.length)
      errors[`slides.${i}.images`] = "An image or video is required.";
    if (slide.images.some(isHeroVideo) && slide.images.length > 1) {
      errors[`slides.${i}.images`] =
        "A video fills the slide on its own. Keep the video and remove the images, or remove the video to use images.";
    }
    // The one rule an admin can trip without touching this slide: adding a
    // second slide invalidates a first one that was rotating several images.
    // Reported here rather than silently dropping the extras on Add Slide.
    if (content.slides.length > 1 && slide.images.length > 1) {
      errors[`slides.${i}.images`] =
        "With more than one slide, each slide takes a single image or video. Remove the extras here, or delete the other slides.";
    }
    cap(
      `slides.${i}.title`,
      slide.title + slide.accent,
      rules.title.max,
      "Title and accent text together",
    );
    cap(`slides.${i}.subtitle`, slide.subtitle, rules.subtitle.max, "Subtitle");
  });
  if (!content.slides.length) errors.slides = "At least one slide is required.";

  if (!content.eyebrow.trim()) errors.eyebrow = "Eyebrow is required.";
  cap("eyebrow", content.eyebrow, rules.eyebrow.max, "Eyebrow");
  cap(
    "primaryCta.label",
    content.primaryCta.label,
    rules.ctaLabel.max,
    "Label",
  );
  cap(
    "secondaryCta.label",
    content.secondaryCta.label,
    rules.ctaLabel.max,
    "Label",
  );
  cap("trustStrip", content.trustStrip, rules.trustStrip.max, "Trust strip");

  const longChip = content.trustStrip
    .split("•")
    .map((s) => s.trim())
    .find((s) => s.length > rules.trustStrip.segmentMax);
  if (longChip) {
    errors.trustStrip = `"${longChip.slice(0, 24)}…" is longer than ${rules.trustStrip.segmentMax} characters and will overflow its chip.`;
  }
  return errors;
}

/** Anything the CMS media endpoint takes. Containers beyond MP4 are listed
 *  because the server transcodes video to MP4 on upload, so what an admin has
 *  on disk (a phone's .mov, a .mkv) does not have to be converted first. */
const SLIDE_ACCEPT: Accept = {
  "image/*": [".jpg", ".jpeg", ".png", ".webp"],
  "video/*": [".mp4", ".mov", ".webm", ".mkv", ".avi"],
};

/**
 * The media slot for one Hero slide, on the shared FileUpload control: drop
 * files and they upload straight away, the returned URLs becoming the slide's
 * media. The × on a thumbnail removes that one.
 *
 * `max` is 1 for every slide of a multi-slide Hero and rises to the rules' cap
 * when there is a single slide, so the control itself refuses what the server
 * would reject rather than leaving it to a message under the box.
 *
 * This replaces a URL text box beside a read-only Media Library picker. That
 * pairing could only reference assets uploaded on some other screen, so there
 * was no way to get a new file into a slide from this page at all — the reason
 * uploading here appeared broken.
 */
function SlideMedia({
  value,
  error,
  max,
  onChange,
}: {
  value: string[];
  error?: string;
  max: number;
  onChange: (urls: string[]) => void;
}) {
  const [uploading, setUploading] = useState<boolean>(false);
  // FileUpload stages files internally; once one has been uploaded and its URL
  // stored, that staged copy is stale — it would show a second thumbnail and
  // count against maxFiles. Remounting is the whole reset.
  const [slot, setSlot] = useState<number>(0);

  // A video already here fills the slide, so the control is full whatever the
  // slide cap says.
  const hasVideo = value.some(isHeroVideo);
  const capacity = hasVideo ? value.length : max;

  const upload = async (staged: File[]) => {
    if (!staged.length) return;

    // Checked before the request, not after: these run to 200MB and the server
    // transcodes on the way in, so letting the save-time error catch it would
    // charge an admin a full upload to be told no.
    const hasVideoFile = staged.some((file) => file.type.startsWith("video"));
    if (hasVideoFile && staged.length + value.length > 1) {
      toast.error(
        "A video fills the slide on its own — drop it by itself, after clearing the other media.",
      );
      setSlot((n) => n + 1);
      return;
    }

    setUploading(true);
    // One at a time on purpose: these run to 200MB each and the server
    // transcodes video on the way in, so firing them together is how the
    // browser's connection limit turns into a timeout.
    const uploaded: string[] = [];
    try {
      for (const file of staged) {
        const form = new FormData();
        form.append("file", file);
        const { data } = await uploadApi.cmsMedia("hero", form);
        uploaded.push(data.data.url);
      }
      toast.success(
        uploaded.length > 1
          ? `${uploaded.length} files uploaded`
          : "File uploaded",
      );
    } catch (err) {
      // The server names the actual problem (wrong type, too large, timed out);
      // a blanket "Upload failed" is what made this screen impossible to debug.
      const res = (err as { response?: { data?: { message?: string } } })
        .response;
      toast.error(res?.data?.message || "Upload failed");
    } finally {
      // Whatever got through is kept: failing on the third file must not throw
      // away the two that already cost an upload each.
      if (uploaded.length) onChange([...value, ...uploaded]);
      setSlot((n) => n + 1);
      setUploading(false);
    }
  };

  return (
    <div>
      {/* Same label style as InputField and SelectField — this sits between
          them on the card and used to be the one field labelled differently. */}
      <label className="mb-2 block text-sm font-medium text-black">
        Media{" "}
        {max > 1 && !hasVideo && (
          <span className="font-normal text-ink-faint">
            ({value.length}/{max} images)
          </span>
        )}
        {hasVideo && (
          <span className="font-normal text-ink-faint">
            (video — fills the slide)
          </span>
        )}
      </label>
      <FileUpload
        key={slot}
        acceptTypes={SLIDE_ACCEPT}
        maxFiles={capacity}
        maxSizeMB={200}
        error={error}
        existingImages={value}
        onExistingImagesChange={onChange}
        onFilesChange={upload}
      />
      {uploading && <p className="mt-2 text-xs text-ink-mute">Uploading…</p>}
    </div>
  );
}

export default function HeroCMS() {
  const [content, setContent] = useState<HeroContent | null>(null);
  const [variant, setVariant] = useState<HeroVariant>(LayoutVariant.FLOATING);
  const [rules, setRules] = useState<HeroRules | null>(null);
  const [serverErrors, setServerErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  // Visibility is Appearance's record, not the Hero document — hiding a part is
  // a presentation decision and the copy behind it survives. The switches sit
  // here, on the page you edit, but they still write to appearance.visibility.
  // `sections` is the server's catalogue, so a key added there needs no change
  // in this file.
  const [visibility, setVisibility] = useState<VisibilityMap>({});
  const [sections, setSections] = useState<VisibilitySection[]>([]);

  const apply = (data: HeroResponse) => {
    const { variant: v, rules: r, ...rest } = data;
    setVariant(v);
    setRules(r);
    setContent(rest);
  };

  useEffect(() => {
    heroApi
      .get()
      .then(({ data }) => apply(data.data))
      .catch(() => toast.error("Failed to load Hero content"))
      .finally(() => setLoading(false));

    appearanceApi
      .get()
      .then(({ data }) => {
        const record = data.data;
        setVisibility(record.visibility ?? {});
        setSections(
          (
            record.visibilityOptions as
              { key: string; sections: VisibilitySection[] }[] | undefined
          )?.find((group) => group.key === "home")?.sections ?? [],
        );
      })
      .catch(() => toast.error("Failed to load section visibility"));
  }, []);

  const localErrors = useMemo(
    () => (content && rules ? clientErrors(content, rules) : {}),
    [content, rules],
  );
  const errors: FieldErrors = { ...localErrors, ...serverErrors };
  const blocked = Object.keys(localErrors).length > 0;

  const patch = (changes: Partial<HeroContent>) =>
    setContent((prev) => (prev ? { ...prev, ...changes } : prev));

  // Only the key that moved is written; the map stays sparse because absent
  // means visible, so a part this build has never heard of is never pinned.
  const patchVisibility = (key: string, visible: boolean) =>
    setVisibility((prev) => ({ ...prev, [key]: visible }));

  const heroSection = sections.find((section) => section.key === "home.hero");

  // The stored map keeps flags belonging to other pages and other layouts on
  // purpose, so the preview asks the served catalogue whether this one is even
  // offered before honouring it — the same question the live site answers.
  const previewShows = (key: string) =>
    !(
      heroSection?.key === key ||
      (heroSection?.elements ?? []).some((el) => el.key === key)
    ) || isVisible(visibility, key);

  const hiddenCount = Object.keys(visibility).filter(
    (key) => !previewShows(key),
  ).length;

  // Each optional part's switch sits on the field it hides, and only when the
  // served catalogue offers that key. A hidden Hero takes every part with it,
  // so their switches disable rather than sit there looking live.
  const heroVisible = isVisible(visibility, "home.hero");
  const elementToggle = (key: string) =>
    heroSection?.elements?.some((el) => el.key === key) ? (
      <VisibilityToggle
        visible={heroVisible && isVisible(visibility, key)}
        disabled={!heroVisible}
        onChange={(v) => patchVisibility(key, v)}
      />
    ) : undefined;

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

  // Slides are stored in the order they are written, so a move is the whole
  // change and the existing save writes it with the rest of the document.
  const moveSlide = (from: number, to: number) =>
    setContent((prev) =>
      prev ? { ...prev, slides: move(prev.slides, from, to) } : prev,
    );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content) return;
    setServerErrors({});
    setSaving(true);
    try {
      const { data } = await heroApi.update(content);
      apply(data.data);

      // Separate document, separate request — sent on every save rather than
      // behind a "has it changed?" guard, which saves one cheap idempotent
      // write and, with a stale baseline, silently skips it while still
      // reporting success.
      try {
        const { data: appearance } = await appearanceApi.update({ visibility });
        setVisibility(appearance.data.visibility ?? {});
      } catch {
        toast.error("Hero saved, but section visibility did not. Try again.");
        return;
      }
      toast.success("Hero updated successfully");
    } catch (err) {
      // The API returns a per-field map alongside the summary message. Rendering
      // it beside the offending input beats a blanket "Update failed" toast.
      const res = (
        err as {
          response?: { data?: { message?: string; fields?: FieldErrors } };
        }
      ).response;
      setServerErrors(res?.data?.fields || {});
      toast.error(res?.data?.message || "Failed to save Hero content");
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
        Hero content is unavailable. Reload to try again.
      </p>
    );
  }

  const slideCount = content.slides.length;
  // A lone slide is one headline over a rotating backdrop, so it may hold
  // several media; the moment a second slide exists every slide is back to one,
  // because each frame's copy is its own.
  const mediaMax = slideCount > 1 ? 1 : rules.slides.imagesMax;
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-ink">Hero CMS</h2>
        <p className="text-sm text-ink-mute">
          Everything the homepage Hero renders — slides, headline copy and
          call-to-actions.
        </p>
      </div>

      {/* Variant is Appearance's to choose; Hero CMS only reads it, because the
          limits below depend on how much room that layout leaves for text. */}
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
        onShowSection={() => patchVisibility("home.hero", true)}
        actions={
          // Absent means visible, so the empty map IS the default and clearing
          // it is the whole reset. Nothing is written until Save.
          <Button
            size="xs"
            variant="none"
            onClick={() => setVisibility({})}
            disabled={hiddenCount === 0}
            startIcon={<Eye className="w-3 h-3" />}
            className="shrink-0 gap-1.5 rounded-full border border-line bg-raise px-2.5 py-1 text-[11px] font-bold text-ink-mute hover:text-ink"
          >
            {hiddenCount ? `Show all (${hiddenCount} hidden)` : "All visible"}
          </Button>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-paper border border-line rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-ink uppercase tracking-wider">
                Hero Slides{" "}
                <span className="text-ink-faint normal-case font-normal">
                  ({slideCount}/{rules.slides.max})
                </span>
              </h3>
              <button
                type="button"
                onClick={addSlide}
                disabled={slideCount >= rules.slides.max}
                className="text-xs flex items-center gap-1 text-info disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4" /> Add Slide
              </button>
            </div>

            {/* The two media rules are not guessable from the form — a picker that
                takes 6 files on one slide and 1 on two slides just looks broken.
                So the panel names the mode that is actually active and how to get
                to the other one, rather than listing both as abstract rules. */}
            <div className="mb-4 rounded-lg border border-line bg-raise p-3 text-[11px] leading-relaxed text-ink-mute">
              {slideCount === 1 ? (
                <p>
                  <strong className="text-ink">Slideshow mode.</strong> With one
                  slide you can add up to {rules.slides.imagesMax} images — the
                  homepage cross-fades them behind this one headline, and shows{" "}
                  <strong>no dots</strong>. Add a second slide to give each
                  image its own headline instead.
                </p>
              ) : (
                <p>
                  <strong className="text-ink">Slide mode.</strong> With{" "}
                  {slideCount} slides each takes <strong>one</strong> image and
                  its own headline, and visitors step between them using the
                  dots. Delete all but one slide to turn the Hero back into a
                  cross-fading slideshow.
                </p>
              )}
              <p className="mt-1.5">
                A video always fills its slide on its own — a slide is either
                one video, or images.
              </p>
            </div>

            {errors.slides && (
              <p className="mb-3 text-[11px] text-danger">{errors.slides}</p>
            )}

            <div className="space-y-4">
              {content.slides.map((slide, i) => (
                <ListRow
                  key={i}
                  title="Slide"
                  index={i}
                  count={slideCount}
                  listId={DragList.HERO_SLIDES}
                  canRemove={slideCount > rules.slides.min}
                  onMove={moveSlide}
                  onRemove={removeSlide}
                >
                  {/* Title and accent share one headline's room, so each
                      counter's limit is what the other leaves free. */}
                  <InputField
                    label="Title"
                    required
                    value={slide.title}
                    onChange={(e) => patchSlide(i, { title: e.target.value })}
                    maxChars={rules.title.max - slide.accent.length}
                    error={!!errors[`slides.${i}.title`]}
                    hint={errors[`slides.${i}.title`]}
                    labelAction={elementToggle("home.hero.title")}
                  />
                  <InputField
                    label="Accent text"
                    value={slide.accent}
                    onChange={(e) => patchSlide(i, { accent: e.target.value })}
                    maxChars={rules.title.max - slide.title.length}
                    tooltip="Drawn in the accent colour after the title — on its own second line in Premium Glass, inline in Clean Modern and Floating."
                  />

                  <TextArea
                    label="Subtitle"
                    value={slide.subtitle}
                    onChange={(e) =>
                      patchSlide(i, { subtitle: e.target.value })
                    }
                    maxChars={rules.subtitle.max}
                    error={!!errors[`slides.${i}.subtitle`]}
                    hint={errors[`slides.${i}.subtitle`]}
                    labelAction={elementToggle("home.hero.subtitle")}
                  />
                  <SelectField
                    className="md:max-w-sm"
                    label="Focal point"
                    value={slide.pos}
                    onValueChange={(pos) => patchSlide(i, { pos })}
                    options={rules.positions.map((pos: string) => ({
                      value: pos,
                      label: POSITION_LABELS[pos] || pos,
                    }))}
                    tooltip="Which part of the media stays visible when it is cropped."
                  />
                  {/* Stacked, not two columns: the dropzone and its thumbnails
                      are several times taller than one select, so pairing them
                      left a half-card of dead space. Full width also fits a
                      slide's images on one row instead of wrapping them. */}
                  <SlideMedia
                    value={slide.images}
                    max={mediaMax}
                    error={errors[`slides.${i}.images`]}
                    onChange={(images) => patchSlide(i, { images })}
                  />
                </ListRow>
              ))}
            </div>
          </div>

          <div className="bg-paper border border-line rounded-xl p-6 space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-sm font-semibold text-ink uppercase tracking-wider">
                  Hero Content
                </h3>
                {heroSection && (
                  <p className="mt-1 text-[11px] text-ink-faint">
                    The switch hides the whole Hero, slides included. Nothing is
                    deleted.
                  </p>
                )}
              </div>
              {heroSection && (
                <SectionVisibilitySwitch
                  visible={heroVisible}
                  onChange={(v) => patchVisibility("home.hero", v)}
                />
              )}
            </div>

            <InputField
              label="Eyebrow"
              value={content.eyebrow}
              onChange={(e) => patch({ eyebrow: e.target.value })}
              maxChars={rules.eyebrow.max}
              error={!!errors.eyebrow}
              hint={errors.eyebrow}
              tooltip="The small kicker above the headline. Floating renders it inside a pill, so it must stay on one line."
              labelAction={elementToggle("home.hero.eyebrow")}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                label="Primary CTA — label"
                value={content.primaryCta.label}
                onChange={(e) =>
                  patch({
                    primaryCta: {
                      ...content.primaryCta,
                      label: e.target.value,
                    },
                  })
                }
                maxChars={rules.ctaLabel.max}
                error={!!errors["primaryCta.label"]}
                hint={errors["primaryCta.label"]}
                labelAction={elementToggle("home.hero.primaryCta")}
              />
              {/* <InputField
                label="Primary CTA — link"
                value={content.primaryCta.url}
                onChange={(e) =>
                  patch({
                    primaryCta: { ...content.primaryCta, url: e.target.value },
                  })
                }
                error={!!errors["primaryCta.url"]}
                hint={errors["primaryCta.url"]}
                tooltip="An anchor (#portfolio), a path (/projects) or a full URL."
              /> */}
              <InputField
                label="Secondary CTA — label"
                value={content.secondaryCta.label}
                onChange={(e) =>
                  patch({
                    secondaryCta: {
                      ...content.secondaryCta,
                      label: e.target.value,
                    },
                  })
                }
                maxChars={rules.ctaLabel.max}
                error={!!errors["secondaryCta.label"]}
                hint={errors["secondaryCta.label"]}
                labelAction={elementToggle("home.hero.secondaryCta")}
              />
              {/* <InputField
                label="Secondary CTA — link"
                value={content.secondaryCta.url}
                onChange={(e) =>
                  patch({
                    secondaryCta: {
                      ...content.secondaryCta,
                      url: e.target.value,
                    },
                  })
                }
                error={!!errors["secondaryCta.url"]}
                hint={errors["secondaryCta.url"]}
              /> */}
            </div>

            <TextArea
              label="Trust strip"
              value={content.trustStrip}
              onChange={(e) => patch({ trustStrip: e.target.value })}
              maxChars={rules.trustStrip.max}
              error={!!errors.trustStrip}
              hint={errors.trustStrip}
              tooltip={
                <>
                  Separate each claim with <strong>•</strong>. Premium Glass
                  scrolls the whole line as a marquee; Clean Modern and Floating
                  split it into chips of up to {rules.trustStrip.segmentMax}{" "}
                  characters each.
                </>
              }
              labelAction={elementToggle("home.hero.trustStrip")}
            />
          </div>

          <div className="flex items-center justify-end gap-4">
            {blocked && (
              <span className="text-xs text-danger">
                Fix the highlighted fields before saving.
              </span>
            )}
            <button
              type="submit"
              disabled={saving || blocked}
              className="flex items-center gap-2 px-5 py-2.5 bg-info hover:bg-info text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Save Changes
            </button>
          </div>
        </form>
      </PreviewPanel>
    </div>
  );
}
