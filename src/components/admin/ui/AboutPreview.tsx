import React from 'react';

import type { AboutContent, AboutSection, AboutVariant } from '../../../types/about';

/**
 * A scaled sketch of the live /about page: the selected variant's arrangement,
 * carrying the real copy as it is typed.
 *
 * It is a sketch on purpose — the website is a Next.js app with framer-motion,
 * AOS and its own theme tokens, none of which exist in this bundle. Rendering
 * it for real would mean shipping a second copy of the website into the admin.
 * Type sizes and wrap points are indicative; the character limits are what
 * actually guarantee the copy fits.
 *
 * What the variants genuinely change — and therefore all this branches on — is
 * the opening arrangement, how the metrics band is drawn, whether the sheet is
 * dark, and WHERE VALUES LAND: Floating gives them their own band after How We
 * Work, the other two fold them into Who We Are.
 */
interface AboutPreviewProps {
  variant: AboutVariant;
  content: AboutContent;
}

interface Tone {
  sheet: string;
  head: string;
  body: string;
  faint: string;
  rule: string;
  fill: string;
}

const LIGHT: Tone = {
  sheet: 'bg-paper',
  head: 'text-ink',
  body: 'text-ink-mute',
  faint: 'text-ink-faint',
  rule: 'border-line',
  fill: 'bg-raise',
};

const DARK: Tone = {
  sheet: 'bg-ink',
  head: 'text-white',
  body: 'text-white/70',
  faint: 'text-white/50',
  rule: 'border-white/15',
  fill: 'bg-white/10',
};

/** Mirrors the site's splitAccentTitle: the author's first comma is the break,
 *  otherwise the last two words carry the accent, and short titles stay whole. */
const AccentHeading = ({ text, className }: { text: string; className: string }) => {
  const clean = text.trim().replace(/\s+/g, ' ');
  const comma = clean.indexOf(',');
  const words = clean.split(' ');
  let lead = clean;
  let accent = '';

  if (comma > -1 && comma < clean.length - 1) {
    lead = clean.slice(0, comma + 1);
    accent = clean.slice(comma + 1).trim();
  } else if (words.length >= 4) {
    lead = words.slice(0, -2).join(' ');
    accent = words.slice(-2).join(' ');
  }

  return (
    <p className={className}>
      {lead}
      {accent && <span className="italic text-accent"> {accent}</span>}
    </p>
  );
};

export default function AboutPreview({ variant, content }: AboutPreviewProps) {
  const { story, stats, whoWeAre, values, whatWeDo, whyChooseUs, howWeWork, cta } = content;
  const tone = variant === 'premium-glass' ? DARK : LIGHT;
  const valuesGetOwnBand = variant === 'floating';

  const eyebrow = (text: string) => (
    <p className="text-[7px] font-bold uppercase tracking-[0.18em] text-accent">{text}</p>
  );

  const head = (section: AboutSection, centered?: boolean) => (
    <div className={centered ? 'text-center' : undefined}>
      {eyebrow(section.label)}
      <p className={`mt-1 text-[11px] font-extrabold leading-tight ${tone.head}`}>{section.heading}</p>
    </div>
  );

  const band = (key: string, children: React.ReactNode) => (
    <div key={key} className={`border-t ${tone.rule} px-3.5 py-3 space-y-2`}>
      {children}
    </div>
  );

  const photo = (className: string) => (
    <div className={`relative overflow-hidden border ${tone.rule} ${tone.fill} ${className}`}>
      {story.image && <img src={story.image} alt="" className="absolute inset-0 h-full w-full object-cover" />}
      <div className="absolute inset-x-0 bottom-0 bg-ink/85 px-1.5 py-1">
        <p className="text-[5px] font-bold uppercase tracking-[0.14em] text-white/60">{story.label}</p>
        <p className="text-[7px] font-bold leading-tight text-white">{story.caption}</p>
      </div>
    </div>
  );

  const valuesGrid = (
    <div className="grid grid-cols-2 gap-2">
      {values.items.map((item, i) => (
        <div key={i}>
          <p className={`truncate text-[7px] font-bold uppercase tracking-wider ${tone.head}`}>{item.title}</p>
          <p className={`mt-0.5 line-clamp-2 text-[7px] leading-relaxed ${tone.body}`}>{item.description}</p>
        </div>
      ))}
    </div>
  );

  // ── Opening ───────────────────────────────────────────────────────────────
  const opening =
    variant === 'premium-glass' ? (
      <div className="space-y-1.5 px-3.5 py-4 text-center">
        {eyebrow(story.label)}
        <AccentHeading text={story.heading} className={`text-[13px] font-black leading-tight ${tone.head}`} />
        <p className={`mx-auto line-clamp-3 max-w-[80%] text-[8px] leading-relaxed ${tone.body}`}>
          {story.description}
        </p>
        <span className="mt-1 inline-block rounded-full bg-accent px-2 py-1 text-[6px] font-bold uppercase tracking-wider text-white">
          {cta.primary.label}
        </span>
      </div>
    ) : variant === 'floating' ? (
      <div className="px-3.5 py-3">
        <div className={`relative z-10 rounded border ${tone.rule} ${tone.sheet} p-2.5 space-y-1.5`}>
          {eyebrow(story.label)}
          <AccentHeading text={story.heading} className={`text-[12px] font-black leading-tight ${tone.head}`} />
          <p className={`line-clamp-3 text-[8px] leading-relaxed ${tone.body}`}>{story.description}</p>
        </div>
        {photo('-mt-2 ml-auto w-[72%] rounded aspect-[16/9]')}
      </div>
    ) : (
      <div className="flex gap-3 px-3.5 py-3">
        <div className="min-w-0 flex-1 space-y-1.5">
          {eyebrow(story.label)}
          <AccentHeading text={story.heading} className={`text-[13px] font-black leading-tight ${tone.head}`} />
          <p className={`line-clamp-4 text-[8px] leading-relaxed ${tone.body}`}>{story.description}</p>
        </div>
        {photo('w-[38%] shrink-0 aspect-[4/3] rounded')}
      </div>
    );

  // ── Metrics ───────────────────────────────────────────────────────────────
  // Floating draws free-standing tiles — and its row rule (up to 5 in one row,
  // exactly 6 as 3 + 3) is reproduced here, since that is the one arrangement
  // an editor can break just by adding a metric.
  const metricValue = (value: string) => (
    <p className={`text-sm font-black leading-none tabular-nums ${tone.head}`}>{value}</p>
  );
  const metricLabel = (label: string) => (
    <p className={`mt-1 truncate text-[6px] font-bold uppercase tracking-[0.14em] ${tone.body}`}>{label}</p>
  );

  const metrics =
    stats.length === 0 ? null : variant === 'floating' ? (
      <div
        className={`grid gap-1.5 px-3.5 py-3 ${stats.length === 6 ? 'grid-cols-3' : 'grid-cols-5'}`}
      >
        {stats.map((stat, i) => (
          <div key={i} className={`min-w-0 rounded border ${tone.rule} ${tone.sheet} p-1.5`}>
            <span className="mb-1 inline-block rounded bg-accent px-1 py-0.5 text-[5px] font-black text-white">
              {String(i + 1).padStart(2, '0')}
            </span>
            {metricValue(stat.value)}
            {metricLabel(stat.label)}
          </div>
        ))}
      </div>
    ) : variant === 'premium-glass' ? (
      <div className={`mx-3.5 mb-3 flex divide-x rounded border ${tone.rule} ${tone.fill} divide-white/15`}>
        {stats.map((stat, i) => (
          <div key={i} className="min-w-0 flex-1 px-2 py-2.5">
            {metricLabel(stat.label)}
            {metricValue(stat.value)}
          </div>
        ))}
      </div>
    ) : (
      <div className={`flex border-y divide-x ${tone.rule} divide-line`}>
        {stats.map((stat, i) => (
          <div key={i} className="min-w-0 flex-1 px-2.5 py-2.5">
            {metricValue(stat.value)}
            {metricLabel(stat.label)}
          </div>
        ))}
      </div>
    );

  // ── Bands ─────────────────────────────────────────────────────────────────
  const bands: React.ReactNode[] = [];

  bands.push(
    band(
      'who',
      <>
        {head(whoWeAre)}
        {whoWeAre.details.length > 0 && (
          <div className={`border-t ${tone.rule}`}>
            {whoWeAre.details.map((detail, i) => (
              <div key={i} className={`flex items-baseline justify-between gap-3 border-b ${tone.rule} py-1`}>
                <span className={`truncate text-[6px] font-bold uppercase tracking-[0.14em] ${tone.body}`}>
                  {detail.label}
                </span>
                <span className={`shrink-0 text-[6px] font-bold uppercase tracking-[0.14em] ${tone.head}`}>
                  {detail.value}
                </span>
              </div>
            ))}
          </div>
        )}
        <p className={`text-[9px] font-semibold italic leading-snug ${tone.head}`}>{whoWeAre.description}</p>
        {whoWeAre.attribution && (
          <p className={`text-[6px] font-bold uppercase tracking-[0.14em] ${tone.body}`}>— {whoWeAre.attribution}</p>
        )}
        {!valuesGetOwnBand && values.items.length > 0 && (
          <div className={`space-y-1.5 rounded border ${tone.rule} p-2`}>
            <p className={`text-[6px] font-bold uppercase tracking-[0.14em] ${tone.body}`}>{values.heading}</p>
            {valuesGrid}
          </div>
        )}
      </>,
    ),
  );

  if (whatWeDo.items.length > 0) {
    bands.push(
      band(
        'what',
        <>
          {head(whatWeDo)}
          <div className={`border-t ${tone.rule}`}>
            {whatWeDo.items.map((item, i) => (
              <div key={i} className={`flex gap-2 border-b ${tone.rule} py-1.5`}>
                <span className="shrink-0 pt-0.5 text-[6px] font-bold text-accent">
                  {`// ${String(i + 1).padStart(2, '0')}`}
                </span>
                <div className="min-w-0 flex-1">
                  <p className={`truncate text-[8px] font-bold ${tone.head}`}>{item.title}</p>
                  <p className={`line-clamp-2 text-[7px] leading-relaxed ${tone.body}`}>{item.description}</p>
                </div>
                <div className="flex shrink-0 gap-1">
                  {item.tags.slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className={`border ${tone.rule} px-1 py-0.5 text-[5px] font-bold uppercase ${tone.head}`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>,
      ),
    );
  }

  if (whyChooseUs.items.length > 0) {
    bands.push(
      band(
        'why',
        <>
          {head(whyChooseUs)}
          <div className="grid grid-cols-3 gap-2">
            {whyChooseUs.items.map((item, i) => (
              <div key={i} className={`border-t ${tone.rule} pt-1.5`}>
                <p className="text-[6px] font-bold text-accent">{String(i + 1).padStart(2, '0')}</p>
                <p className={`mt-1 line-clamp-2 text-[7px] font-bold ${tone.head}`}>{item.title}</p>
                <p className={`mt-0.5 line-clamp-3 text-[7px] leading-relaxed ${tone.body}`}>{item.description}</p>
              </div>
            ))}
          </div>
        </>,
      ),
    );
  }

  if (howWeWork.steps.length > 0) {
    bands.push(
      band(
        'how',
        <>
          {head(howWeWork, variant !== 'clean-modern')}
          <div className="flex flex-wrap gap-2">
            {howWeWork.steps.map((step, i) => (
              <div key={i} className={`min-w-0 flex-1 basis-20 border-t ${tone.rule} pt-1.5`}>
                <p className="text-[10px] font-black leading-none text-accent">{step.number}</p>
                <p className={`mt-1 line-clamp-2 text-[7px] font-bold ${tone.head}`}>{step.title}</p>
                <p className={`mt-0.5 line-clamp-3 text-[7px] leading-relaxed ${tone.body}`}>{step.description}</p>
              </div>
            ))}
          </div>
        </>,
      ),
    );
  }

  if (valuesGetOwnBand && values.items.length > 0) {
    bands.push(band('values', <>{head(values)}{valuesGrid}</>));
  }

  return (
    <div className={`overflow-hidden rounded-lg border border-line ${tone.sheet}`}>
      {opening}
      {metrics}
      {bands}
      <div className="space-y-1.5 bg-ink px-3.5 py-3">
        <p className="text-[7px] font-bold uppercase tracking-[0.18em] text-white/60">{cta.label}</p>
        <p className="text-[11px] font-extrabold leading-tight text-white">{cta.heading}</p>
        {cta.description && (
          <p className="line-clamp-2 text-[7px] leading-relaxed text-white/70">{cta.description}</p>
        )}
        <div className="flex gap-1.5 pt-0.5">
          <span className="rounded-sm bg-accent px-2 py-1 text-[6px] font-bold uppercase tracking-wider text-white">
            {cta.primary.label}
          </span>
          {cta.secondary && (
            <span className="rounded-sm border border-white/40 px-2 py-1 text-[6px] font-bold uppercase tracking-wider text-white/80">
              {cta.secondary.label}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
