import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Save, Loader2, Plus, Image as ImageIcon, Palette } from 'lucide-react';

import AboutPreview from '../../../components/admin/ui/AboutPreview';
import HeroField from '../../../components/admin/ui/HeroField';
import ListRow from '../../../components/admin/ui/ListRow';
import MediaPickerModal from '../../../components/admin/ui/MediaPickerModal';

import { aboutApi } from '../../../services/api';
import {
  ABOUT_VARIANT_LABELS,
  EMPTY_CAPABILITY,
  EMPTY_DETAIL,
  EMPTY_ITEM,
  EMPTY_STAT,
  EMPTY_STEP,
  type AboutContent,
  type AboutResponse,
  type AboutRules,
  type AboutSection,
  type AboutVariant,
  type FieldErrors,
} from '../../../types/about';

// Order IS the stored order — no order columns, no per-row endpoints. Every
// list edit is a pure array transform, and Save writes the page as one document.
const move = <T,>(rows: T[], from: number, to: number): T[] => {
  if (to < 0 || to >= rows.length) return rows;
  const next = [...rows];
  const [row] = next.splice(from, 1);
  next.splice(to, 0, row);
  return next;
};

const removeAt = <T,>(rows: T[], index: number): T[] => rows.filter((_, i) => i !== index);

const patchAt = <T,>(rows: T[], index: number, changes: Partial<T>): T[] =>
  rows.map((row, i) => (i === index ? { ...row, ...changes } : row));

const CARD = 'bg-paper border border-line rounded-xl p-6 space-y-5';
const HEADING = 'text-sm font-semibold text-ink uppercase tracking-wider';

interface SectionCardProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

const SectionCard = ({ title, description, children }: SectionCardProps) => (
  <div className={CARD}>
    <div>
      <h3 className={HEADING}>{title}</h3>
      <p className="mt-1 text-[11px] text-ink-faint">{description}</p>
    </div>
    {children}
  </div>
);

interface HeadFieldsProps {
  section: AboutSection;
  rules: AboutRules;
  errors: FieldErrors;
  path: string;
  onChange: (changes: Partial<AboutSection>) => void;
}

/** The eyebrow + heading every section on the page carries. */
const HeadFields = ({ section, rules, errors, path, onChange }: HeadFieldsProps) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <HeroField
      label="Section label"
      value={section.label}
      onChange={(v) => onChange({ label: v })}
      max={rules.label.max}
      error={errors[`${path}.label`]}
      helper="The small kicker above the heading."
    />
    <HeroField
      label="Section heading"
      value={section.heading}
      onChange={(v) => onChange({ heading: v })}
      max={rules.heading.max}
      error={errors[`${path}.heading`]}
    />
  </div>
);

interface AddButtonProps {
  label: string;
  disabled: boolean;
  onClick: () => void;
}

const AddButton = ({ label, disabled, onClick }: AddButtonProps) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className="text-xs flex items-center gap-1 text-info disabled:opacity-40 disabled:cursor-not-allowed"
  >
    <Plus className="w-4 h-4" /> {label}
  </button>
);

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
 */
export default function AboutCMS() {
  const [content, setContent] = useState<AboutContent | null>(null);
  const [variant, setVariant] = useState<AboutVariant>('clean-modern');
  const [rules, setRules] = useState<AboutRules | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [picker, setPicker] = useState<boolean>(false);

  const apply = (data: AboutResponse) => {
    const { variant: v, rules: r, ...rest } = data;
    setVariant(v);
    setRules(r);
    setContent(rest);
  };

  useEffect(() => {
    aboutApi
      .get()
      .then(({ data }) => apply(data.data))
      .catch(() => toast.error('Failed to load About content'))
      .finally(() => setLoading(false));
  }, []);

  const patch = (changes: Partial<AboutContent>) =>
    setContent((prev) => (prev ? { ...prev, ...changes } : prev));

  const patchSection = <K extends keyof AboutContent>(key: K, changes: Partial<AboutContent[K]>) =>
    setContent((prev) => (prev ? { ...prev, [key]: { ...prev[key], ...changes } } : prev));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content) return;
    setErrors({});
    setSaving(true);
    try {
      const { data } = await aboutApi.update(content);
      apply(data.data);
      toast.success('About page updated successfully');
    } catch (err) {
      // The API returns a per-field map keyed by its zod path alongside the
      // summary message. Rendering it beside the offending input beats a
      // blanket "Update failed" toast on a form this long.
      const res = (err as { response?: { data?: { message?: string; fields?: FieldErrors } } }).response;
      setErrors(res?.data?.fields || {});
      toast.error(res?.data?.message || 'Failed to save About content');
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
    return <p className="text-sm text-ink-mute">About content is unavailable. Reload to try again.</p>;
  }

  const { story, stats, whoWeAre, values, whatWeDo, whyChooseUs, howWeWork, cta } = content;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-ink">About CMS</h2>
        <p className="text-sm text-ink-mute">
          Every section of the About page (/about) — headings, copy, images and all of its lists.
        </p>
      </div>

      {/* Variant is Appearance's to choose; About CMS only reads it, because the
          limits below are written for the tightest of the three layouts. */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-info/10 border border-info/50 rounded-lg">
        <div className="flex items-center gap-3 text-sm text-info">
          <Palette className="w-5 h-5 flex-shrink-0" />
          <span>
            About style: <strong>{ABOUT_VARIANT_LABELS[variant]}</strong> — layout only; this content is shown by all three.
          </span>
        </div>
        <Link to="/admin/appearance" className="text-xs font-bold text-info underline underline-offset-2">
          Change in Appearance
        </Link>
      </div>

      {/* items-start so the preview column can stick instead of stretching to
          the form's full height. `main` is the scroll container, so `sticky
          top-0` here follows the page as the form scrolls past it. */}
      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <aside className="space-y-2 xl:order-last xl:sticky xl:top-0">
          <h3 className={HEADING}>
            Preview <span className="text-ink-faint normal-case font-normal">— {ABOUT_VARIANT_LABELS[variant]}</span>
          </h3>
          <div className="max-h-[calc(100vh-11rem)] overflow-y-auto rounded-lg">
            <AboutPreview variant={variant} content={content} />
          </div>
          <p className="text-[11px] text-ink-faint leading-relaxed">
            Indicative sketch of content, order and arrangement for the live About style — not a pixel-accurate render.
            Sections with an empty list are hidden here and on the site.
          </p>
        </aside>

        <form onSubmit={handleSubmit} className="space-y-6">
        <SectionCard title="Our Story" description="The opening block: the page heading, its introduction and the main image.">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <HeroField
              label="Section label"
              value={story.label}
              onChange={(v) => patchSection('story', { label: v })}
              max={rules.label.max}
              error={errors['story.label']}
              helper="The kicker above the heading. Also labels the image caption."
            />
            <HeroField
              label="Heading"
              value={story.heading}
              onChange={(v) => patchSection('story', { heading: v })}
              max={rules.heading.max}
              error={errors['story.heading']}
              helper="Text after the first comma renders in the accent colour; with no comma, the last two words do."
            />
          </div>
          <HeroField
            label="Description"
            value={story.description}
            onChange={(v) => patchSection('story', { description: v })}
            max={rules.storyDescription.max}
            error={errors['story.description']}
            multiline
            rows={4}
          />
          <div>
            <label className="block text-[10px] font-bold text-ink-faint uppercase tracking-wider mb-1.5">Image</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="https://…"
                className={`flex-1 min-w-0 px-3 py-2 bg-paper border rounded-lg text-ink text-sm ${
                  errors['story.image'] ? 'border-danger' : 'border-line'
                }`}
                value={story.image}
                onChange={(e) => patchSection('story', { image: e.target.value })}
              />
              <button
                type="button"
                onClick={() => setPicker(true)}
                className="flex items-center gap-1.5 px-3 py-2 bg-paper border border-line rounded-lg text-xs font-semibold text-ink-mute hover:text-ink hover:border-info"
              >
                <ImageIcon className="w-4 h-4" /> Browse
              </button>
            </div>
            {errors['story.image'] && <p className="mt-1 text-[11px] text-danger">{errors['story.image']}</p>}
          </div>
          <HeroField
            label="Image caption"
            value={story.caption}
            onChange={(v) => patchSection('story', { caption: v })}
            max={rules.caption.max}
            error={errors['story.caption']}
            helper="Printed over the image. Kept short — Floating sets it in large display type inside a narrow card."
          />
        </SectionCard>

        <div className={CARD}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className={HEADING}>
                Stats <span className="text-ink-faint normal-case font-normal">({stats.length}/{rules.lists.stats.max})</span>
              </h3>
              <p className="mt-1 text-[11px] text-ink-faint">The metrics band. Type the value exactly as it should read, e.g. "25+".</p>
            </div>
            <AddButton
              label="Add Stat"
              disabled={stats.length >= rules.lists.stats.max}
              onClick={() => patch({ stats: [...stats, { ...EMPTY_STAT }] })}
            />
          </div>
          {errors.stats && <p className="text-[11px] text-danger">{errors.stats}</p>}
          <div className="space-y-4">
            {stats.map((stat, i) => (
              <ListRow
                key={i}
                title="Stat"
                index={i}
                count={stats.length}
                onMove={(from, to) => patch({ stats: move(stats, from, to) })}
                onRemove={(index) => patch({ stats: removeAt(stats, index) })}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <HeroField
                    label="Value"
                    value={stat.value}
                    onChange={(v) => patch({ stats: patchAt(stats, i, { value: v }) })}
                    max={rules.stat.value.max}
                    error={errors[`stats.${i}.value`]}
                  />
                  <HeroField
                    label="Label"
                    value={stat.label}
                    onChange={(v) => patch({ stats: patchAt(stats, i, { label: v }) })}
                    max={rules.stat.label.max}
                    error={errors[`stats.${i}.label`]}
                  />
                </div>
              </ListRow>
            ))}
          </div>
        </div>

        <SectionCard title="Who We Are" description="The statement beside the story image, the facts listed with it, and the values grid.">
          <HeadFields
            section={whoWeAre}
            rules={rules}
            errors={errors}
            path="whoWeAre"
            onChange={(changes) => patchSection('whoWeAre', changes)}
          />
          <HeroField
            label="Description"
            value={whoWeAre.description}
            onChange={(v) => patchSection('whoWeAre', { description: v })}
            max={rules.quote.max}
            error={errors['whoWeAre.description']}
            multiline
            rows={3}
            helper="Set as a pull quote in every layout."
          />
          <HeroField
            label="Attribution"
            value={whoWeAre.attribution}
            onChange={(v) => patchSection('whoWeAre', { attribution: v })}
            max={rules.attribution.max}
            error={errors['whoWeAre.attribution']}
            helper="Who the statement is from. Leave empty to hide the line."
          />

          <div className="pt-1 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-semibold text-ink uppercase tracking-wider">
                  Company details{' '}
                  <span className="text-ink-faint normal-case font-normal">
                    ({whoWeAre.details.length}/{rules.lists.details.max})
                  </span>
                </h4>
                <p className="mt-1 text-[11px] text-ink-faint">
                  Listed in order. The first is also the badge on the story image; Floating shows the second as its accent figure.
                </p>
              </div>
              <AddButton
                label="Add Detail"
                disabled={whoWeAre.details.length >= rules.lists.details.max}
                onClick={() => patchSection('whoWeAre', { details: [...whoWeAre.details, { ...EMPTY_DETAIL }] })}
              />
            </div>
            {whoWeAre.details.map((detail, i) => (
              <ListRow
                key={i}
                title="Detail"
                index={i}
                count={whoWeAre.details.length}
                onMove={(from, to) => patchSection('whoWeAre', { details: move(whoWeAre.details, from, to) })}
                onRemove={(index) => patchSection('whoWeAre', { details: removeAt(whoWeAre.details, index) })}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <HeroField
                    label="Label"
                    value={detail.label}
                    onChange={(v) => patchSection('whoWeAre', { details: patchAt(whoWeAre.details, i, { label: v }) })}
                    max={rules.detail.label.max}
                    error={errors[`whoWeAre.details.${i}.label`]}
                  />
                  <HeroField
                    label="Value"
                    value={detail.value}
                    onChange={(v) => patchSection('whoWeAre', { details: patchAt(whoWeAre.details, i, { value: v }) })}
                    max={rules.detail.value.max}
                    error={errors[`whoWeAre.details.${i}.value`]}
                  />
                </div>
              </ListRow>
            ))}
          </div>

          <div className="pt-1 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-semibold text-ink uppercase tracking-wider">
                  Values{' '}
                  <span className="text-ink-faint normal-case font-normal">
                    ({values.items.length}/{rules.lists.values.max})
                  </span>
                </h4>
                <p className="mt-1 text-[11px] text-ink-faint">Shown beside the statement, or as their own band in Floating.</p>
              </div>
              <AddButton
                label="Add Value"
                disabled={values.items.length >= rules.lists.values.max}
                onClick={() => patchSection('values', { items: [...values.items, { ...EMPTY_ITEM }] })}
              />
            </div>
            <HeadFields
              section={values}
              rules={rules}
              errors={errors}
              path="values"
              onChange={(changes) => patchSection('values', changes)}
            />
            {values.items.map((value, i) => (
              <ListRow
                key={i}
                title="Value"
                index={i}
                count={values.items.length}
                onMove={(from, to) => patchSection('values', { items: move(values.items, from, to) })}
                onRemove={(index) => patchSection('values', { items: removeAt(values.items, index) })}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <HeroField
                    label="Title"
                    value={value.title}
                    onChange={(v) => patchSection('values', { items: patchAt(values.items, i, { title: v }) })}
                    max={rules.item.title.max}
                    error={errors[`values.items.${i}.title`]}
                  />
                  <HeroField
                    label="Icon"
                    value={value.icon}
                    onChange={(v) => patchSection('values', { items: patchAt(values.items, i, { icon: v }) })}
                    error={errors[`values.items.${i}.icon`]}
                    helper="Font Awesome name, e.g. shield-halved. Leave empty for the default."
                  />
                </div>
                <HeroField
                  label="Description"
                  value={value.description}
                  onChange={(v) => patchSection('values', { items: patchAt(values.items, i, { description: v }) })}
                  max={rules.item.description.max}
                  error={errors[`values.items.${i}.description`]}
                  multiline
                />
              </ListRow>
            ))}
          </div>
        </SectionCard>

        <div className={CARD}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className={HEADING}>
                What We Do{' '}
                <span className="text-ink-faint normal-case font-normal">
                  ({whatWeDo.items.length}/{rules.lists.whatWeDo.max})
                </span>
              </h3>
              <p className="mt-1 text-[11px] text-ink-faint">The services list. Shown in the order below.</p>
            </div>
            <AddButton
              label="Add Service"
              disabled={whatWeDo.items.length >= rules.lists.whatWeDo.max}
              onClick={() => patchSection('whatWeDo', { items: [...whatWeDo.items, { ...EMPTY_CAPABILITY }] })}
            />
          </div>
          <HeadFields
            section={whatWeDo}
            rules={rules}
            errors={errors}
            path="whatWeDo"
            onChange={(changes) => patchSection('whatWeDo', changes)}
          />
          <div className="space-y-4">
            {whatWeDo.items.map((item, i) => (
              <ListRow
                key={i}
                title="Service"
                index={i}
                count={whatWeDo.items.length}
                onMove={(from, to) => patchSection('whatWeDo', { items: move(whatWeDo.items, from, to) })}
                onRemove={(index) => patchSection('whatWeDo', { items: removeAt(whatWeDo.items, index) })}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <HeroField
                    label="Title"
                    value={item.title}
                    onChange={(v) => patchSection('whatWeDo', { items: patchAt(whatWeDo.items, i, { title: v }) })}
                    max={rules.item.title.max}
                    error={errors[`whatWeDo.items.${i}.title`]}
                  />
                  <HeroField
                    label="Icon"
                    value={item.icon}
                    onChange={(v) => patchSection('whatWeDo', { items: patchAt(whatWeDo.items, i, { icon: v }) })}
                    error={errors[`whatWeDo.items.${i}.icon`]}
                    helper="Font Awesome name, e.g. layer-group."
                  />
                </div>
                <HeroField
                  label="Description"
                  value={item.description}
                  onChange={(v) => patchSection('whatWeDo', { items: patchAt(whatWeDo.items, i, { description: v }) })}
                  max={rules.item.description.max}
                  error={errors[`whatWeDo.items.${i}.description`]}
                  multiline
                />
                <HeroField
                  label="Tags"
                  value={item.tags.join(', ')}
                  onChange={(v) =>
                    patchSection('whatWeDo', {
                      items: patchAt(whatWeDo.items, i, {
                        tags: v.split(',').map((tag) => tag.trim()).filter(Boolean).slice(0, rules.lists.tags.max),
                      }),
                    })
                  }
                  error={errors[`whatWeDo.items.${i}.tags`] || errors[`whatWeDo.items.${i}.tags.0`]}
                  helper={`Comma-separated, up to ${rules.lists.tags.max}. Clean Modern shows the first two.`}
                />
              </ListRow>
            ))}
          </div>
        </div>

        <div className={CARD}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className={HEADING}>
                Why Choose Us{' '}
                <span className="text-ink-faint normal-case font-normal">
                  ({whyChooseUs.items.length}/{rules.lists.whyChooseUs.max})
                </span>
              </h3>
              <p className="mt-1 text-[11px] text-ink-faint">The reasons list. Shown in the order below.</p>
            </div>
            <AddButton
              label="Add Reason"
              disabled={whyChooseUs.items.length >= rules.lists.whyChooseUs.max}
              onClick={() => patchSection('whyChooseUs', { items: [...whyChooseUs.items, { ...EMPTY_ITEM }] })}
            />
          </div>
          <HeadFields
            section={whyChooseUs}
            rules={rules}
            errors={errors}
            path="whyChooseUs"
            onChange={(changes) => patchSection('whyChooseUs', changes)}
          />
          <div className="space-y-4">
            {whyChooseUs.items.map((item, i) => (
              <ListRow
                key={i}
                title="Reason"
                index={i}
                count={whyChooseUs.items.length}
                onMove={(from, to) => patchSection('whyChooseUs', { items: move(whyChooseUs.items, from, to) })}
                onRemove={(index) => patchSection('whyChooseUs', { items: removeAt(whyChooseUs.items, index) })}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <HeroField
                    label="Title"
                    value={item.title}
                    onChange={(v) => patchSection('whyChooseUs', { items: patchAt(whyChooseUs.items, i, { title: v }) })}
                    max={rules.item.title.max}
                    error={errors[`whyChooseUs.items.${i}.title`]}
                  />
                  <HeroField
                    label="Icon"
                    value={item.icon}
                    onChange={(v) => patchSection('whyChooseUs', { items: patchAt(whyChooseUs.items, i, { icon: v }) })}
                    error={errors[`whyChooseUs.items.${i}.icon`]}
                    helper="Font Awesome name, e.g. circle-check."
                  />
                </div>
                <HeroField
                  label="Description"
                  value={item.description}
                  onChange={(v) => patchSection('whyChooseUs', { items: patchAt(whyChooseUs.items, i, { description: v }) })}
                  max={rules.item.description.max}
                  error={errors[`whyChooseUs.items.${i}.description`]}
                  multiline
                />
              </ListRow>
            ))}
          </div>
        </div>

        <div className={CARD}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className={HEADING}>
                How We Work{' '}
                <span className="text-ink-faint normal-case font-normal">
                  ({howWeWork.steps.length}/{rules.lists.howWeWork.max})
                </span>
              </h3>
              <p className="mt-1 text-[11px] text-ink-faint">The process steps, in the order they are performed.</p>
            </div>
            <AddButton
              label="Add Step"
              disabled={howWeWork.steps.length >= rules.lists.howWeWork.max}
              onClick={() => patchSection('howWeWork', { steps: [...howWeWork.steps, { ...EMPTY_STEP }] })}
            />
          </div>
          <HeadFields
            section={howWeWork}
            rules={rules}
            errors={errors}
            path="howWeWork"
            onChange={(changes) => patchSection('howWeWork', changes)}
          />
          <div className="space-y-4">
            {howWeWork.steps.map((step, i) => (
              <ListRow
                key={i}
                title="Step"
                index={i}
                count={howWeWork.steps.length}
                onMove={(from, to) => patchSection('howWeWork', { steps: move(howWeWork.steps, from, to) })}
                onRemove={(index) => patchSection('howWeWork', { steps: removeAt(howWeWork.steps, index) })}
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <HeroField
                    label="Number"
                    value={step.number}
                    onChange={(v) => patchSection('howWeWork', { steps: patchAt(howWeWork.steps, i, { number: v }) })}
                    max={rules.step.number.max}
                    error={errors[`howWeWork.steps.${i}.number`]}
                    helper='Printed as written — "01" reads better than "1".'
                  />
                  <div className="md:col-span-2">
                    <HeroField
                      label="Title"
                      value={step.title}
                      onChange={(v) => patchSection('howWeWork', { steps: patchAt(howWeWork.steps, i, { title: v }) })}
                      max={rules.step.title.max}
                      error={errors[`howWeWork.steps.${i}.title`]}
                    />
                  </div>
                </div>
                <HeroField
                  label="Description"
                  value={step.description}
                  onChange={(v) => patchSection('howWeWork', { steps: patchAt(howWeWork.steps, i, { description: v }) })}
                  max={rules.step.description.max}
                  error={errors[`howWeWork.steps.${i}.description`]}
                  multiline
                />
              </ListRow>
            ))}
          </div>
        </div>

        <SectionCard title="Call to Action" description="The closing band at the foot of the page.">
          <HeadFields
            section={cta}
            rules={rules}
            errors={errors}
            path="cta"
            onChange={(changes) => patchSection('cta', changes)}
          />
          <HeroField
            label="Text"
            value={cta.description}
            onChange={(v) => patchSection('cta', { description: v })}
            max={rules.ctaDescription.max}
            error={errors['cta.description']}
            multiline
            helper="Optional — leave empty to show the heading and buttons alone."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <HeroField
              label="Primary button — label"
              value={cta.primary.label}
              onChange={(v) => patchSection('cta', { primary: { ...cta.primary, label: v } })}
              max={rules.ctaLabel.max}
              error={errors['cta.primary.label']}
            />
            <HeroField
              label="Primary button — link"
              value={cta.primary.url}
              onChange={(v) => patchSection('cta', { primary: { ...cta.primary, url: v } })}
              error={errors['cta.primary.url']}
              helper="An anchor on the home page (/#contact), a path (/projects) or a full URL."
            />
          </div>

          <label className="flex items-center gap-2 text-xs font-semibold text-ink-mute">
            <input
              type="checkbox"
              checked={cta.secondary !== null}
              onChange={(e) =>
                patchSection('cta', { secondary: e.target.checked ? { label: '', url: '/#portfolio' } : null })
              }
            />
            Show a second button
          </label>

          {cta.secondary && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <HeroField
                label="Secondary button — label"
                value={cta.secondary.label}
                onChange={(v) => patchSection('cta', { secondary: { ...cta.secondary!, label: v } })}
                max={rules.ctaLabel.max}
                error={errors['cta.secondary.label']}
              />
              <HeroField
                label="Secondary button — link"
                value={cta.secondary.url}
                onChange={(v) => patchSection('cta', { secondary: { ...cta.secondary!, url: v } })}
                error={errors['cta.secondary.url']}
              />
            </div>
          )}
        </SectionCard>

        <div className="flex items-center justify-end gap-4">
          {Object.keys(errors).length > 0 && (
            <span className="text-xs text-danger">Fix the highlighted fields before saving.</span>
          )}
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-info hover:bg-info text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Changes
          </button>
        </div>
        </form>
      </div>

      <MediaPickerModal open={picker} onClose={() => setPicker(false)} onSelect={(url) => patchSection('story', { image: url })} />
    </div>
  );
}
