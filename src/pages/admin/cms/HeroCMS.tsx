import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Save, Loader2, Plus, Trash2, Image as ImageIcon, Palette } from 'lucide-react';

import HeroField from '../../../components/admin/ui/HeroField';
import HeroPreview from '../../../components/admin/ui/HeroPreview';
import MediaPickerModal from '../../../components/admin/ui/MediaPickerModal';

import { heroApi } from '../../../services/api';
import {
  HERO_VARIANT_LABELS,
  type FieldErrors,
  type HeroContent,
  type HeroResponse,
  type HeroRules,
  type HeroSlide,
  type HeroVariant,
} from '../../../types/hero';

const EMPTY_SLIDE: HeroSlide = { image: '', pos: 'center center', title: '', subtitle: '' };

const POSITION_LABELS: Record<string, string> = {
  'left top': 'Top left',
  'center top': 'Top centre',
  'right top': 'Top right',
  'left center': 'Middle left',
  'center center': 'Centre',
  'right center': 'Middle right',
  'left bottom': 'Bottom left',
  'center bottom': 'Bottom centre',
  'right bottom': 'Bottom right',
  'center 40%': 'Centre, slightly high',
};

/** Mirrors the server's length rules so Save can be blocked before a round trip.
 *  Keys are the zod paths the API returns, so both sources render identically. */
function clientErrors(content: HeroContent, rules: HeroRules): FieldErrors {
  const errors: FieldErrors = {};
  const cap = (key: string, value: string, max: number, name: string) => {
    if (value.length > max) errors[key] = `${name} must be ${max} characters or fewer for this Hero style.`;
  };

  content.slides.forEach((slide, i) => {
    if (!slide.title.trim()) errors[`slides.${i}.title`] = 'Title is required.';
    if (!slide.image.trim()) errors[`slides.${i}.image`] = 'Image is required.';
    cap(`slides.${i}.title`, slide.title, rules.title.max, 'Title');
    cap(`slides.${i}.subtitle`, slide.subtitle, rules.subtitle.max, 'Subtitle');
  });
  if (!content.slides.length) errors.slides = 'At least one slide is required.';

  if (!content.eyebrow.trim()) errors.eyebrow = 'Eyebrow is required.';
  cap('eyebrow', content.eyebrow, rules.eyebrow.max, 'Eyebrow');
  cap('primaryCta.label', content.primaryCta.label, rules.ctaLabel.max, 'Label');
  cap('secondaryCta.label', content.secondaryCta.label, rules.ctaLabel.max, 'Label');
  cap('trustStrip', content.trustStrip, rules.trustStrip.max, 'Trust strip');

  const longChip = content.trustStrip.split('•').map((s) => s.trim())
    .find((s) => s.length > rules.trustStrip.segmentMax);
  if (longChip) {
    errors.trustStrip = `"${longChip.slice(0, 24)}…" is longer than ${rules.trustStrip.segmentMax} characters and will overflow its chip.`;
  }
  return errors;
}

export default function HeroCMS() {
  const [content, setContent] = useState<HeroContent | null>(null);
  const [variant, setVariant] = useState<HeroVariant>('floating');
  const [rules, setRules] = useState<HeroRules | null>(null);
  const [serverErrors, setServerErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [pickerFor, setPickerFor] = useState<number | null>(null);
  const [previewIndex, setPreviewIndex] = useState<number>(0);

  const apply = (data: HeroResponse) => {
    const { variant: v, rules: r, ...rest } = data;
    setVariant(v);
    setRules(r);
    setContent(rest);
  };

  useEffect(() => {
    heroApi.get()
      .then(({ data }) => apply(data.data))
      .catch(() => toast.error('Failed to load Hero content'))
      .finally(() => setLoading(false));
  }, []);

  const localErrors = useMemo(
    () => (content && rules ? clientErrors(content, rules) : {}),
    [content, rules],
  );
  const errors: FieldErrors = { ...localErrors, ...serverErrors };
  const blocked = Object.keys(localErrors).length > 0;

  const patch = (changes: Partial<HeroContent>) =>
    setContent((prev) => (prev ? { ...prev, ...changes } : prev));

  const patchSlide = (index: number, changes: Partial<HeroSlide>) =>
    setContent((prev) =>
      prev ? { ...prev, slides: prev.slides.map((s, i) => (i === index ? { ...s, ...changes } : s)) } : prev,
    );

  const addSlide = () => setContent((prev) => (prev ? { ...prev, slides: [...prev.slides, { ...EMPTY_SLIDE }] } : prev));

  const removeSlide = (index: number) =>
    setContent((prev) => {
      if (!prev) return prev;
      const slides = prev.slides.filter((_, i) => i !== index);
      setPreviewIndex((p) => Math.max(0, Math.min(p, slides.length - 1)));
      return { ...prev, slides };
    });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content) return;
    setServerErrors({});
    setSaving(true);
    try {
      const { data } = await heroApi.update(content);
      apply(data.data);
      toast.success('Hero updated successfully');
    } catch (err) {
      // The API returns a per-field map alongside the summary message. Rendering
      // it beside the offending input beats a blanket "Update failed" toast.
      const res = (err as { response?: { data?: { message?: string; fields?: FieldErrors } } }).response;
      setServerErrors(res?.data?.fields || {});
      toast.error(res?.data?.message || 'Failed to save Hero content');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-ink-faint" /></div>;
  }
  if (!content || !rules) {
    return <p className="text-sm text-ink-mute">Hero content is unavailable. Reload to try again.</p>;
  }

  const slideCount = content.slides.length;

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h2 className="text-xl font-bold text-ink">Hero CMS</h2>
        <p className="text-sm text-ink-mute">
          Everything the homepage Hero renders — slides, headline copy and call-to-actions.
        </p>
      </div>

      {/* Variant is Appearance's to choose; Hero CMS only reads it, because the
          limits below depend on how much room that layout leaves for text. */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-info/10 border border-info/50 rounded-lg">
        <div className="flex items-center gap-3 text-sm text-info">
          <Palette className="w-5 h-5 flex-shrink-0" />
          <span>
            Hero style: <strong>{HERO_VARIANT_LABELS[variant]}</strong> — character limits below are set by this layout.
          </span>
        </div>
        <Link to="/admin/appearance" className="text-xs font-bold text-info underline underline-offset-2">
          Change in Appearance
        </Link>
      </div>

      <div className="bg-paper border border-line rounded-xl p-6 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-ink uppercase tracking-wider">Preview</h3>
          {slideCount > 1 && (
            <div className="flex gap-1.5">
              {content.slides.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setPreviewIndex(i)}
                  aria-label={`Preview slide ${i + 1}`}
                  className={`w-6 h-6 rounded text-[11px] font-bold ${
                    i === previewIndex ? 'bg-info text-white' : 'bg-raise text-ink-mute hover:text-ink'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </div>
        <HeroPreview variant={variant} content={content} slideIndex={Math.min(previewIndex, slideCount - 1)} />
        <p className="text-[11px] text-ink-faint">
          Indicative sketch of layout and focal point — not a pixel-accurate render of the live site.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-paper border border-line rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-ink uppercase tracking-wider">
              Hero Slides <span className="text-ink-faint normal-case font-normal">({slideCount}/{rules.slides.max})</span>
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

          {errors.slides && <p className="mb-3 text-[11px] text-danger">{errors.slides}</p>}

          <div className="space-y-4">
            {content.slides.map((slide, i) => (
              <div key={i} className="bg-raise border border-line rounded-xl p-4 space-y-4 relative">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-ink-faint uppercase tracking-wider">Slide {i + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeSlide(i)}
                    disabled={slideCount <= rules.slides.min}
                    aria-label={`Remove slide ${i + 1}`}
                    className="p-1.5 text-ink-faint hover:text-danger disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <HeroField
                  label="Title"
                  value={slide.title}
                  onChange={(v) => patchSlide(i, { title: v })}
                  max={rules.title.max}
                  error={errors[`slides.${i}.title`]}
                  warning={
                    slide.title.split(',').length > 2
                      ? 'Only the first comma is used as the split point — everything after it becomes the accent part.'
                      : undefined
                  }
                  helper={
                    <>
                      Text after the <strong>first comma</strong> renders in the accent colour — on its own second line in
                      Premium Glass, inline in Clean Modern and Floating.
                    </>
                  }
                />

                <HeroField
                  label="Subtitle"
                  value={slide.subtitle}
                  onChange={(v) => patchSlide(i, { subtitle: v })}
                  max={rules.subtitle.max}
                  error={errors[`slides.${i}.subtitle`]}
                  multiline
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-ink-faint uppercase tracking-wider mb-1.5">
                      Image
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="https://…"
                        className={`flex-1 min-w-0 px-3 py-2 bg-paper border rounded-lg text-ink text-sm ${
                          errors[`slides.${i}.image`] ? 'border-danger' : 'border-line'
                        }`}
                        value={slide.image}
                        onChange={(e) => patchSlide(i, { image: e.target.value })}
                      />
                      <button
                        type="button"
                        onClick={() => setPickerFor(i)}
                        className="flex items-center gap-1.5 px-3 py-2 bg-paper border border-line rounded-lg text-xs font-semibold text-ink-mute hover:text-ink hover:border-info"
                      >
                        <ImageIcon className="w-4 h-4" /> Browse
                      </button>
                    </div>
                    {errors[`slides.${i}.image`] && (
                      <p className="mt-1 text-[11px] text-danger">{errors[`slides.${i}.image`]}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-ink-faint uppercase tracking-wider mb-1.5">
                      Focal point
                    </label>
                    <select
                      className="w-full px-3 py-2 bg-paper border border-line rounded-lg text-ink text-sm"
                      value={slide.pos}
                      onChange={(e) => patchSlide(i, { pos: e.target.value })}
                    >
                      {rules.positions.map((pos) => (
                        <option key={pos} value={pos}>{POSITION_LABELS[pos] || pos}</option>
                      ))}
                    </select>
                    <p className="mt-1 text-[11px] text-ink-faint">Which part of the image stays visible when it is cropped.</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-paper border border-line rounded-xl p-6 space-y-5">
          <h3 className="text-sm font-semibold text-ink uppercase tracking-wider">Hero Content</h3>

          <HeroField
            label="Eyebrow"
            value={content.eyebrow}
            onChange={(v) => patch({ eyebrow: v })}
            max={rules.eyebrow.max}
            error={errors.eyebrow}
            helper="The small kicker above the headline. Floating renders it inside a pill, so it must stay on one line."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <HeroField
              label="Primary CTA — label"
              value={content.primaryCta.label}
              onChange={(v) => patch({ primaryCta: { ...content.primaryCta, label: v } })}
              max={rules.ctaLabel.max}
              error={errors['primaryCta.label']}
            />
            <HeroField
              label="Primary CTA — link"
              value={content.primaryCta.url}
              onChange={(v) => patch({ primaryCta: { ...content.primaryCta, url: v } })}
              error={errors['primaryCta.url']}
              helper="An anchor (#portfolio), a path (/projects) or a full URL."
            />
            <HeroField
              label="Secondary CTA — label"
              value={content.secondaryCta.label}
              onChange={(v) => patch({ secondaryCta: { ...content.secondaryCta, label: v } })}
              max={rules.ctaLabel.max}
              error={errors['secondaryCta.label']}
            />
            <HeroField
              label="Secondary CTA — link"
              value={content.secondaryCta.url}
              onChange={(v) => patch({ secondaryCta: { ...content.secondaryCta, url: v } })}
              error={errors['secondaryCta.url']}
            />
          </div>

          <HeroField
            label="Trust strip"
            value={content.trustStrip}
            onChange={(v) => patch({ trustStrip: v })}
            max={rules.trustStrip.max}
            error={errors.trustStrip}
            multiline
            helper={
              <>
                Separate each claim with <strong>•</strong>. Premium Glass scrolls the whole line as a marquee; Clean Modern
                and Floating split it into chips of up to {rules.trustStrip.segmentMax} characters each.
              </>
            }
          />
        </div>

        <div className="flex items-center justify-end gap-4">
          {blocked && <span className="text-xs text-danger">Fix the highlighted fields before saving.</span>}
          <button
            type="submit"
            disabled={saving || blocked}
            className="flex items-center gap-2 px-5 py-2.5 bg-info hover:bg-info text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Changes
          </button>
        </div>
      </form>

      <MediaPickerModal
        open={pickerFor !== null}
        onClose={() => setPickerFor(null)}
        onSelect={(url) => pickerFor !== null && patchSlide(pickerFor, { image: url })}
      />
    </div>
  );
}
