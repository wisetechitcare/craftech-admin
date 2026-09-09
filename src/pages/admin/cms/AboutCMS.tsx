import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Save, Loader2, Plus, Image as ImageIcon, Palette, Eye } from 'lucide-react';

import AboutPreview from '../../../components/admin/ui/AboutPreview';
import ListRow from '../../../components/admin/ui/ListRow';
import MediaPickerModal from '../../../components/admin/ui/MediaPickerModal';
import {
  ElementVisibility,
  VisibilityToggle,
  isVisible,
  type VisibilityMap,
  type VisibilitySection,
} from '../../../components/admin/ui/VisibilityToggle';

import { aboutApi, appearanceApi } from '../../../services/api';
import InputField from '../../../components/admin/ui/InputField';
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
  /** The section's Visible/Hidden switch, rendered opposite the title. */
  toggle?: React.ReactNode;
  children: React.ReactNode;
}

const SectionCard = ({ title, description, toggle, children }: SectionCardProps) => (
  <div className={CARD}>
    <div className="flex items-start justify-between gap-4">
      <div>
        <h3 className={HEADING}>{title}</h3>
        <p className="mt-1 text-[11px] text-ink-faint">{description}</p>
      </div>
      {toggle}
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
    <InputField
      label="Section label"
      value={section.label}
      onChange={(e) => onChange({ label: e.target.value })}
      maxChars={rules.label.max}
      error={!!errors[`${path}.label`]}
      hint={errors[`${path}.label`] ?? "The small kicker above the heading."}
    />
    <InputField
      label="Section heading"
      value={section.heading}
      onChange={(e) => onChange({ heading: e.target.value })}
      maxChars={rules.heading.max}
      error={!!errors[`${path}.heading`]}
      hint={errors[`${path}.heading`]}
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

  // Visibility is Appearance's record, not this document — hiding a section is
  // a layout decision and must not cost the admin the copy behind it. The
  // switches live here because this is where those sections are edited; the
  // flag still writes to appearance.visibility. `sections` is the server's
  // catalogue for this page, so what is controllable is never hardcoded below.
  const [visibility, setVisibility] = useState<VisibilityMap>({});
  const [sections, setSections] = useState<VisibilitySection[]>([]);

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

    // Separate request, separate document. A failure here costs the toggles,
    // not the form: the content is still fully editable without them.
    appearanceApi
      .get()
      .then(({ data }) => {
        const record = data.data;
        const map: VisibilityMap = record.visibility ?? {};
        setVisibility(map);
        setSections(
          (record.visibilityOptions as { key: string; sections: VisibilitySection[] }[] | undefined)?.find(
            (group) => group.key === 'about',
          )?.sections ?? [],
        );
      })
      .catch(() => toast.error('Failed to load section visibility'));
  }, []);

  const patch = (changes: Partial<AboutContent>) =>
    setContent((prev) => (prev ? { ...prev, ...changes } : prev));

  const patchSection = <K extends keyof AboutContent>(key: K, changes: Partial<AboutContent[K]>) =>
    setContent((prev) => (prev ? { ...prev, [key]: { ...prev[key], ...changes } } : prev));

  // Only the key that moved is written. The map stays sparse on purpose:
  // absent means visible, so a section this build has never heard of is never
  // pinned to whatever this form happened to render for it.
  const patchVisibility = (key: string, visible: boolean) =>
    setVisibility((prev) => ({ ...prev, [key]: visible }));

  // Both read the server's catalogue rather than a list written here, so a
  // section or element added on the server appears with no change to this file
  // — and if the Appearance request failed, no toggle is drawn that could not
  // be saved anyway.
  const sectionToggle = (key: string) =>
    sections.some((section) => section.key === key) ? (
      <VisibilityToggle visible={isVisible(visibility, key)} onChange={(v) => patchVisibility(key, v)} />
    ) : null;

  // Only the keys THIS layout honours can hide anything in the preview. The
  // stored map deliberately keeps flags set under other layouts, and the live
  // page ignores those — `sections` is the server's catalogue for the variant
  // that is actually live, so asking it is the same question the site asks.
  const previewShows = (key: string) =>
    !sections.some((sec) => sec.key === key || (sec.elements ?? []).some((el) => el.key === key)) ||
    isVisible(visibility, key);

  const hiddenCount = Object.keys(visibility).filter((key) => !previewShows(key)).length;

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
        const { data: appearance } = await appearanceApi.update({ visibility });
        // Trust the server's copy over local state, so what the toggles show
        // after a save is what was actually stored.
        setVisibility(appearance.data.visibility ?? {});
      } catch {
        // The copy is already saved. Say which half did not land rather than
        // reporting the whole save as failed and inviting a pointless retry.
        toast.error('Content saved, but section visibility did not. Try again.');
        return;
      }
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
          <div className="flex items-center justify-between gap-3">
            <h3 className={HEADING}>
              Preview <span className="text-ink-faint normal-case font-normal">— {ABOUT_VARIANT_LABELS[variant]}</span>
            </h3>
            {/* Absent means visible, so the default state IS the empty map —
                clearing it is the whole reset. It clears the flags set under
                the other two layouts too, which is what "everything visible"
                means; nothing is written until Save, like every toggle here. */}
            <button
              type="button"
              onClick={() => setVisibility({})}
              disabled={hiddenCount === 0}
              className="flex shrink-0 items-center gap-1.5 rounded-full border border-line bg-raise px-2.5 py-1 text-[11px] font-bold text-ink-mute transition-colors hover:text-ink disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Eye className="w-3 h-3" />
              {hiddenCount ? `Show all (${hiddenCount} hidden)` : 'All visible'}
            </button>
          </div>
          <div className="max-h-[calc(100vh-11rem)] overflow-y-auto rounded-lg">
            <AboutPreview variant={variant} content={content} show={previewShows} />
          </div>
          <p className="text-[11px] text-ink-faint leading-relaxed">
            Indicative sketch of content, order and arrangement for the live About style — not a pixel-accurate render.
            It follows the Visible/Hidden switches, so anything missing here is either switched off or an empty list.
          </p>
        </aside>

        <form onSubmit={handleSubmit} className="space-y-6">
        <SectionCard
          title="Our Story"
          description="The opening block: the page heading, its introduction and the main image."
          toggle={sectionToggle('about.story')}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="Section label"
              value={story.label}
              onChange={(e) => patchSection('story', { label: e.target.value })}
              maxChars={rules.label.max}
              error={!!errors['story.label']}
              hint={errors['story.label'] ?? "The kicker above the heading. Also labels the image caption."}
            />
            <InputField
              label="Heading"
              value={story.heading}
              onChange={(e) => patchSection('story', { heading: e.target.value })}
              maxChars={rules.heading.max}
              error={!!errors['story.heading']}
              hint={errors['story.heading'] ?? "Text after the first comma renders in the accent colour; with no comma, the last two words do."}
            />
          </div>
          <InputField
            label="Description"
            value={story.description}
            onChange={(e) => patchSection('story', { description: e.target.value })}
            maxChars={rules.storyDescription.max}
            error={!!errors['story.description']}
            hint={errors['story.description']}
            multiline
            rows={4}
          />
          <div>
            <label className="block text-[10px] font-bold text-ink-faint uppercase tracking-wider mb-1.5">Image</label>
            <div className="flex gap-2">
              <div className="flex-1 min-w-0">
                <InputField
                  type="text"
                  placeholder="https://…"
                  error={!!errors['story.image']}
                  hint={errors['story.image']}
                  value={story.image}
                  onChange={(e) => patchSection('story', { image: e.target.value })}
                />
              </div>
              <button
                type="button"
                onClick={() => setPicker(true)}
                className="flex items-center gap-1.5 px-3 py-2 bg-paper border border-line rounded-lg text-xs font-semibold text-ink-mute hover:text-ink hover:border-info"
              >
                <ImageIcon className="w-4 h-4" /> Browse
              </button>
            </div>
          </div>
          <InputField
            label="Image caption"
            value={story.caption}
            onChange={(e) => patchSection('story', { caption: e.target.value })}
            maxChars={rules.caption.max}
            error={!!errors['story.caption']}
            hint={errors['story.caption'] ?? "Printed over the image. Kept short — Floating sets it in large display type inside a narrow card."}
          />
          {elementToggles('about.story')}
        </SectionCard>

        <div className={CARD}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className={HEADING}>
                Stats <span className="text-ink-faint normal-case font-normal">({stats.length}/{rules.lists.stats.max})</span>
              </h3>
              <p className="mt-1 text-[11px] text-ink-faint">The metrics band. Type the value exactly as it should read, e.g. "25+".</p>
            </div>
            <div className="flex items-center gap-3">
              {sectionToggle('about.stats')}
              <AddButton
                label="Add Stat"
                disabled={stats.length >= rules.lists.stats.max}
                onClick={() => patch({ stats: [...stats, { ...EMPTY_STAT }] })}
              />
            </div>
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
                  <InputField
                    label="Value"
                    value={stat.value}
                    onChange={(e) => patch({ stats: patchAt(stats, i, { value: e.target.value }) })}
                    maxChars={rules.stat.value.max}
                    error={!!errors[`stats.${i}.value`]}
                    hint={errors[`stats.${i}.value`]}
                  />
                  <InputField
                    label="Label"
                    value={stat.label}
                    onChange={(e) => patch({ stats: patchAt(stats, i, { label: e.target.value }) })}
                    maxChars={rules.stat.label.max}
                    error={!!errors[`stats.${i}.label`]}
                    hint={errors[`stats.${i}.label`]}
                  />
                </div>
              </ListRow>
            ))}
          </div>
          {elementToggles('about.stats')}
        </div>

        <SectionCard
          title="Who We Are"
          description="The statement beside the story image, the facts listed with it, and the values grid."
          toggle={sectionToggle('about.whoWeAre')}
        >
          <HeadFields
            section={whoWeAre}
            rules={rules}
            errors={errors}
            path="whoWeAre"
            onChange={(changes) => patchSection('whoWeAre', changes)}
          />
          <InputField
            label="Description"
            value={whoWeAre.description}
            onChange={(e) => patchSection('whoWeAre', { description: e.target.value })}
            maxChars={rules.quote.max}
            error={!!errors['whoWeAre.description']}
            multiline
            rows={3}
            hint={errors['whoWeAre.description'] ?? "Set as a pull quote in every layout."}
          />
          <InputField
            label="Attribution"
            value={whoWeAre.attribution}
            onChange={(e) => patchSection('whoWeAre', { attribution: e.target.value })}
            maxChars={rules.attribution.max}
            error={!!errors['whoWeAre.attribution']}
            hint={errors['whoWeAre.attribution'] ?? "Who the statement is from. Leave empty to hide the line."}
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
                  <InputField
                    label="Label"
                    value={detail.label}
                    onChange={(e) => patchSection('whoWeAre', { details: patchAt(whoWeAre.details, i, { label: e.target.value }) })}
                    maxChars={rules.detail.label.max}
                    error={!!errors[`whoWeAre.details.${i}.label`]}
                    hint={errors[`whoWeAre.details.${i}.label`]}
                  />
                  <InputField
                    label="Value"
                    value={detail.value}
                    onChange={(e) => patchSection('whoWeAre', { details: patchAt(whoWeAre.details, i, { value: e.target.value }) })}
                    maxChars={rules.detail.value.max}
                    error={!!errors[`whoWeAre.details.${i}.value`]}
                    hint={errors[`whoWeAre.details.${i}.value`]}
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
                  <InputField
                    label="Title"
                    value={value.title}
                    onChange={(e) => patchSection('values', { items: patchAt(values.items, i, { title: e.target.value }) })}
                    maxChars={rules.item.title.max}
                    error={!!errors[`values.items.${i}.title`]}
                    hint={errors[`values.items.${i}.title`]}
                  />
                  <InputField
                    label="Icon"
                    value={value.icon}
                    onChange={(e) => patchSection('values', { items: patchAt(values.items, i, { icon: e.target.value }) })}
                    error={!!errors[`values.items.${i}.icon`]}
                    hint={errors[`values.items.${i}.icon`] ?? "Font Awesome name, e.g. shield-halved. Leave empty for the default."}
                  />
                </div>
                <InputField
                  label="Description"
                  value={value.description}
                  onChange={(e) => patchSection('values', { items: patchAt(values.items, i, { description: e.target.value }) })}
                  maxChars={rules.item.description.max}
                  error={!!errors[`values.items.${i}.description`]}
                  hint={errors[`values.items.${i}.description`]}
                  multiline
                />
              </ListRow>
            ))}
          </div>
          {elementToggles('about.whoWeAre')}
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
            <div className="flex items-center gap-3">
              {sectionToggle('about.whatWeDo')}
              <AddButton
                label="Add Service"
                disabled={whatWeDo.items.length >= rules.lists.whatWeDo.max}
                onClick={() => patchSection('whatWeDo', { items: [...whatWeDo.items, { ...EMPTY_CAPABILITY }] })}
              />
            </div>
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
                  <InputField
                    label="Title"
                    value={item.title}
                    onChange={(e) => patchSection('whatWeDo', { items: patchAt(whatWeDo.items, i, { title: e.target.value }) })}
                    maxChars={rules.item.title.max}
                    error={!!errors[`whatWeDo.items.${i}.title`]}
                    hint={errors[`whatWeDo.items.${i}.title`]}
                  />
                  <InputField
                    label="Icon"
                    value={item.icon}
                    onChange={(e) => patchSection('whatWeDo', { items: patchAt(whatWeDo.items, i, { icon: e.target.value }) })}
                    error={!!errors[`whatWeDo.items.${i}.icon`]}
                    hint={errors[`whatWeDo.items.${i}.icon`] ?? "Font Awesome name, e.g. layer-group."}
                  />
                </div>
                <InputField
                  label="Description"
                  value={item.description}
                  onChange={(e) => patchSection('whatWeDo', { items: patchAt(whatWeDo.items, i, { description: e.target.value }) })}
                  maxChars={rules.item.description.max}
                  error={!!errors[`whatWeDo.items.${i}.description`]}
                  hint={errors[`whatWeDo.items.${i}.description`]}
                  multiline
                />
                <InputField
                  label="Tags"
                  value={item.tags.join(', ')}
                  onChange={(e) =>
                    patchSection('whatWeDo', {
                      items: patchAt(whatWeDo.items, i, {
                        tags: e.target.value.split(',').map((tag) => tag.trim()).filter(Boolean).slice(0, rules.lists.tags.max),
                      }),
                    })
                  }
                  error={!!(errors[`whatWeDo.items.${i}.tags`] || errors[`whatWeDo.items.${i}.tags.0`])}
                  hint={(errors[`whatWeDo.items.${i}.tags`] || errors[`whatWeDo.items.${i}.tags.0`]) ?? `Comma-separated, up to ${rules.lists.tags.max}. Clean Modern shows the first two.`}
                />
              </ListRow>
            ))}
          </div>
          {elementToggles('about.whatWeDo')}
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
            <div className="flex items-center gap-3">
              {sectionToggle('about.whyChooseUs')}
              <AddButton
                label="Add Reason"
                disabled={whyChooseUs.items.length >= rules.lists.whyChooseUs.max}
                onClick={() => patchSection('whyChooseUs', { items: [...whyChooseUs.items, { ...EMPTY_ITEM }] })}
              />
            </div>
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
                  <InputField
                    label="Title"
                    value={item.title}
                    onChange={(e) => patchSection('whyChooseUs', { items: patchAt(whyChooseUs.items, i, { title: e.target.value }) })}
                    maxChars={rules.item.title.max}
                    error={!!errors[`whyChooseUs.items.${i}.title`]}
                    hint={errors[`whyChooseUs.items.${i}.title`]}
                  />
                  <InputField
                    label="Icon"
                    value={item.icon}
                    onChange={(e) => patchSection('whyChooseUs', { items: patchAt(whyChooseUs.items, i, { icon: e.target.value }) })}
                    error={!!errors[`whyChooseUs.items.${i}.icon`]}
                    hint={errors[`whyChooseUs.items.${i}.icon`] ?? "Font Awesome name, e.g. circle-check."}
                  />
                </div>
                <InputField
                  label="Description"
                  value={item.description}
                  onChange={(e) => patchSection('whyChooseUs', { items: patchAt(whyChooseUs.items, i, { description: e.target.value }) })}
                  maxChars={rules.item.description.max}
                  error={!!errors[`whyChooseUs.items.${i}.description`]}
                  hint={errors[`whyChooseUs.items.${i}.description`]}
                  multiline
                />
              </ListRow>
            ))}
          </div>
          {elementToggles('about.whyChooseUs')}
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
            <div className="flex items-center gap-3">
              {sectionToggle('about.howWeWork')}
              <AddButton
                label="Add Step"
                disabled={howWeWork.steps.length >= rules.lists.howWeWork.max}
                onClick={() => patchSection('howWeWork', { steps: [...howWeWork.steps, { ...EMPTY_STEP }] })}
              />
            </div>
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
                  <InputField
                    label="Number"
                    value={step.number}
                    onChange={(e) => patchSection('howWeWork', { steps: patchAt(howWeWork.steps, i, { number: e.target.value }) })}
                    maxChars={rules.step.number.max}
                    error={!!errors[`howWeWork.steps.${i}.number`]}
                    hint={errors[`howWeWork.steps.${i}.number`] ?? 'Printed as written — "01" reads better than "1".'}
                  />
                  <div className="md:col-span-2">
                    <InputField
                      label="Title"
                      value={step.title}
                      onChange={(e) => patchSection('howWeWork', { steps: patchAt(howWeWork.steps, i, { title: e.target.value }) })}
                      maxChars={rules.step.title.max}
                      error={!!errors[`howWeWork.steps.${i}.title`]}
                      hint={errors[`howWeWork.steps.${i}.title`]}
                    />
                  </div>
                </div>
                <InputField
                  label="Description"
                  value={step.description}
                  onChange={(e) => patchSection('howWeWork', { steps: patchAt(howWeWork.steps, i, { description: e.target.value }) })}
                  maxChars={rules.step.description.max}
                  error={!!errors[`howWeWork.steps.${i}.description`]}
                  hint={errors[`howWeWork.steps.${i}.description`]}
                  multiline
                />
              </ListRow>
            ))}
          </div>
          {elementToggles('about.howWeWork')}
        </div>

        <SectionCard
          title="Call to Action"
          description="The closing band at the foot of the page."
          toggle={sectionToggle('about.cta')}
        >
          <HeadFields
            section={cta}
            rules={rules}
            errors={errors}
            path="cta"
            onChange={(changes) => patchSection('cta', changes)}
          />
          <InputField
            label="Text"
            value={cta.description}
            onChange={(e) => patchSection('cta', { description: e.target.value })}
            maxChars={rules.ctaDescription.max}
            error={!!errors['cta.description']}
            multiline
            hint={errors['cta.description'] ?? "Optional — leave empty to show the heading and buttons alone."}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="Primary button — label"
              value={cta.primary.label}
              onChange={(e) => patchSection('cta', { primary: { ...cta.primary, label: e.target.value } })}
              maxChars={rules.ctaLabel.max}
              error={!!errors['cta.primary.label']}
              hint={errors['cta.primary.label']}
            />
            <InputField
              label="Primary button — link"
              value={cta.primary.url}
              onChange={(e) => patchSection('cta', { primary: { ...cta.primary, url: e.target.value } })}
              error={!!errors['cta.primary.url']}
              hint={errors['cta.primary.url'] ?? "An anchor on the home page (/#contact), a path (/projects) or a full URL."}
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
              <InputField
                label="Secondary button — label"
                value={cta.secondary.label}
                onChange={(e) => patchSection('cta', { secondary: { ...cta.secondary!, label: e.target.value } })}
                maxChars={rules.ctaLabel.max}
                error={!!errors['cta.secondary.label']}
                hint={errors['cta.secondary.label']}
              />
              <InputField
                label="Secondary button — link"
                value={cta.secondary.url}
                onChange={(e) => patchSection('cta', { secondary: { ...cta.secondary!, url: e.target.value } })}
                error={!!errors['cta.secondary.url']}
                hint={errors['cta.secondary.url']}
              />
            </div>
          )}
          {elementToggles('about.cta')}
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
