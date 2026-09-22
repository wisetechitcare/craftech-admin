import type { ReactNode } from "react";

import ListRow from "@/components/admin/ui/ListRow";
import RichTextField from "@/components/admin/ui/RichTextField";
import SelectField from "@/components/admin/ui/SelectField";
import SlideMedia from "./SlideMedia";

import { HeroVisibilityKey } from "@/lib/constants/hero";
import { POSITION_LABELS } from "./hero-constants";
import { DragList } from "@/lib/constants/drag-lists";
import { richTextToPlain } from "@/lib/editor";
import type { FieldErrors, HeroRules, HeroSlide } from "@/types/hero";
import { AddButton } from "../ui/SectionCard";

interface HeroSlidesSectionProps {
  slides: HeroSlide[];
  rules: HeroRules;
  slideCount: number;
  mediaMax: number;
  errors: FieldErrors;
  elementToggle: (key: string) => ReactNode;
  onAddSlide: () => void;
  onMoveSlide: (from: number, to: number) => void;
  onRemoveSlide: (index: number) => void;
  onPatchSlide: (index: number, changes: Partial<HeroSlide>) => void;
}

export default function HeroSlidesSection({
  slides,
  rules,
  slideCount,
  mediaMax,
  errors,
  elementToggle,
  onAddSlide,
  onMoveSlide,
  onRemoveSlide,
  onPatchSlide,
}: HeroSlidesSectionProps) {
  const titleDefaults = {
    fontFamily: rules.title.font,
    fontSize: rules.title.size,
  };
  const subtitleDefaults = {
    fontFamily: rules.subtitle.font,
    fontSize: rules.subtitle.size,
  };

  return (
    <div className="bg-paper border border-line rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-ink uppercase tracking-wider">
          Hero Slides{" "}
          <span className="text-ink-faint normal-case font-normal">
            ({slideCount}/{rules.slides.max})
          </span>
        </h3>
        <AddButton
          label="Add slide"
          disabled={slideCount >= rules.slides.max}
          onClick={onAddSlide}
        />
      </div>

      <div className="mb-4 rounded-lg border border-line bg-raise p-3 text-xs leading-relaxed text-ink-mute">
        {slideCount === 1 ? (
          <p>
            <strong className="text-ink">Slideshow mode.</strong> With one slide
            you can add up to {rules.slides.imagesMax} images — the homepage
            cross-fades them behind this one headline, and shows{" "}
            <strong>no dots</strong>. Add a second slide to give each image its
            own headline instead.
          </p>
        ) : (
          <p>
            <strong className="text-ink">Slide mode.</strong> With {slideCount}{" "}
            slides each takes <strong>one</strong> image and its own headline,
            and visitors step between them using the dots. Delete all but one
            slide to turn the Hero back into a cross-fading slideshow.
          </p>
        )}
        <p className="mt-1.5">
          A video always fills its slide on its own — a slide is either one
          video, or images.
        </p>
      </div>

      {errors.slides && (
        <p className="mb-3 text-xs text-danger">{errors.slides}</p>
      )}

      <div className="space-y-4">
        {slides.map((slide, i) => (
          <ListRow
            key={i}
            title="Slide"
            index={i}
            count={slideCount}
            listId={DragList.HERO_SLIDES}
            canRemove={slideCount > rules.slides.min}
            onMove={onMoveSlide}
            onRemove={onRemoveSlide}
          >
            <RichTextField
              label="Title"
              required
              value={slide.title}
              onChange={(title) => onPatchSlide(i, { title })}
              allowedFeatures={rules.textFeatures}
              defaults={titleDefaults}
              placeholder="Building Legacy,"
              maxChars={rules.title.max - richTextToPlain(slide.accent).length}
              error={!!errors[`slides.${i}.title`]}
              hint={errors[`slides.${i}.title`]}
              labelAction={elementToggle(HeroVisibilityKey.TITLE)}
              tooltip="Select text to format just that part, or format with nothing selected to change the whole field."
              className="mb-5"
            />
            <RichTextField
              label="Colored text"
              value={slide.accent}
              onChange={(accent) => onPatchSlide(i, { accent })}
              allowedFeatures={rules.textFeatures}
              defaults={titleDefaults}
              placeholder="Engineering Trust."
              maxChars={rules.title.max - richTextToPlain(slide.title).length}
              tooltip="The end of the headline. It is drawn in the accent colour unless you set one here."
              className="mb-5"
            />
            <RichTextField
              label="Subtitle"
              value={slide.subtitle}
              onChange={(subtitle) => onPatchSlide(i, { subtitle })}
              allowedFeatures={rules.textFeatures}
              defaults={subtitleDefaults}
              maxChars={rules.subtitle.max}
              error={!!errors[`slides.${i}.subtitle`]}
              hint={errors[`slides.${i}.subtitle`]}
              labelAction={elementToggle(HeroVisibilityKey.SUBTITLE)}
              className="mb-5"
            />
            <SelectField
              className="md:max-w-sm"
              label="Focal point"
              value={slide.pos}
              onValueChange={(pos) => onPatchSlide(i, { pos })}
              options={rules.positions.map((pos: string) => ({
                value: pos,
                label: POSITION_LABELS[pos] || pos,
              }))}
              tooltip="Which part of the media stays visible when it is cropped."
            />
            <SlideMedia
              value={slide.images}
              max={mediaMax}
              error={errors[`slides.${i}.images`]}
              onChange={(images) => onPatchSlide(i, { images })}
              className="mt-6"
            />
          </ListRow>
        ))}
      </div>
    </div>
  );
}
