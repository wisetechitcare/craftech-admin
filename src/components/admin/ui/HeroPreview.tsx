import React from 'react';

import { isHeroVideo, type HeroContent, type HeroVariant } from '../../../types/hero';

/**
 * A scaled sketch of the live Hero: the selected variant's arrangement, the
 * chosen slide's media at its chosen focal point, and the real copy.
 *
 * It is a sketch on purpose — the website's Hero is a Next.js client component
 * with framer-motion, a particle canvas and the site's own theme tokens, none
 * of which exist in this bundle. Rendering it for real would mean shipping a
 * second copy of the website into the admin. Type sizes and wrap points here
 * are therefore indicative, not pixel-accurate; the character limits are what
 * actually guarantee the copy fits.
 */
interface HeroPreviewProps {
  variant: HeroVariant;
  content: HeroContent;
  slideIndex: number;
  /** Reads appearance.visibility the way the live Hero does — absent means
   *  visible. Hidden parts are left out rather than greyed: the sketch answers
   *  "what will the page look like". */
  show: (key: string) => boolean;
}

const Title = ({ title }: { title: string }) => {
  const [headline, ...rest] = title.split(',');
  const tail = rest.join(',').trim();
  return (
    <>
      {headline}
      {tail ? ',' : ''}
      {tail && <span className="text-accent italic"> {tail}</span>}
    </>
  );
};

export default function HeroPreview({ variant, content, slideIndex, show }: HeroPreviewProps) {
  const slide = content.slides[slideIndex];
  if (!slide) return null;

  // One element, used by all three arrangements below — so a video slide
  // previews as a video in every variant, not just the one that was updated.
  const media = isHeroVideo(slide.image) ? (
    <video
      src={slide.image}
      muted
      loop
      autoPlay
      playsInline
      className="absolute inset-0 w-full h-full object-cover"
      style={{ objectPosition: slide.pos }}
    />
  ) : (
    <img
      src={slide.image}
      alt=""
      className="absolute inset-0 w-full h-full object-cover"
      style={{ objectPosition: slide.pos }}
    />
  );

  const eyebrow = show('home.hero.eyebrow') && (
    <p className="text-[7px] font-bold uppercase tracking-[0.18em] opacity-80">{content.eyebrow}</p>
  );
  const ctas = (
    <div className="flex gap-1.5 pt-1">
      <span className="px-2 py-1 rounded bg-accent text-white text-[7px] font-bold uppercase tracking-wider">
        {content.primaryCta.label}
      </span>
      {show('home.hero.secondaryCta') && (
        <span className="px-2 py-1 rounded border border-current text-[7px] font-bold uppercase tracking-wider opacity-80">
          {content.secondaryCta.label}
        </span>
      )}
    </div>
  );
  const chips = show('home.hero.trustStrip') && (
    <div className="flex flex-wrap gap-1 pt-1.5">
      {content.trustStrip.split('•').map((item) => item.trim()).filter(Boolean).map((item, i) => (
        <span key={`${item}-${i}`} className="px-1.5 py-0.5 rounded-full bg-ink/10 text-[6px] font-semibold uppercase tracking-wider opacity-70">
          {item}
        </span>
      ))}
    </div>
  );

  if (variant === 'clean-modern') {
    return (
      <div className="h-52 rounded-lg overflow-hidden border border-line flex bg-paper">
        <div className="w-[54%] p-4 flex flex-col justify-center gap-1.5 text-ink">
          {eyebrow}
          <p className="text-base font-extrabold leading-tight"><Title title={slide.title} /></p>
          <p className="text-[8px] leading-relaxed opacity-70 line-clamp-3">{slide.subtitle}</p>
          {ctas}
          {chips}
        </div>
        <div className="relative w-[46%] bg-raise">{media}</div>
      </div>
    );
  }

  if (variant === 'floating') {
    return (
      <div className="relative h-52 rounded-lg overflow-hidden border border-line bg-raise flex items-center px-4">
        {media}
        <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/45 to-ink/25" />
        <div className="relative w-[64%] rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm p-3 flex flex-col gap-1.5 text-white">
          {show('home.hero.eyebrow') && (
            <span className="self-start px-2 py-0.5 rounded-full bg-white/20 text-[7px] font-bold uppercase tracking-[0.14em]">
              {content.eyebrow}
            </span>
          )}
          <p className="text-sm font-black leading-tight"><Title title={slide.title} /></p>
          <p className="text-[8px] leading-relaxed opacity-80 line-clamp-2">{slide.subtitle}</p>
          {ctas}
          {chips}
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-52 rounded-lg overflow-hidden border border-line bg-raise flex items-center px-5">
      {media}
      <div className="absolute inset-0 bg-gradient-to-r from-ink/90 via-ink/50 to-transparent" />
      <div className="relative w-[70%] flex flex-col gap-1.5 text-white">
        {eyebrow}
        <p className="text-lg font-black leading-[1.1]"><Title title={slide.title} /></p>
        <p className="text-[8px] leading-relaxed opacity-80 line-clamp-2">{slide.subtitle}</p>
        {ctas}
      </div>
      {show('home.hero.trustStrip') && (
        <div className="absolute bottom-0 inset-x-0 h-5 bg-ink/70 flex items-center overflow-hidden">
          <p className="whitespace-nowrap px-3 text-[6px] font-bold uppercase tracking-[0.18em] text-white/70">
            • {content.trustStrip} •
          </p>
        </div>
      )}
    </div>
  );
}
