import React, { useEffect, useRef, useState } from "react";

import type { AboutContent } from "@/types/about";
import type { AppearanceUpdatePayload } from "@/types/appearance";
import type { HeroContent } from "@/types/hero";

/** The sections the website exposes at /preview/<section> for this panel. */
export enum PreviewSection {
  NAVBAR = "navbar",
  HERO = "hero",
  ABOUT = "about",
}

/** The slice of the website's CMS context an editing screen overrides. Keys are
 *  the context's own, so the site merges it with a spread. */
export interface PreviewDraft {
  heroContent?: HeroContent;
  aboutContent?: AboutContent;
  appearance?: AppearanceUpdatePayload;
}

const SITE_URL = import.meta.env.VITE_SITE_URL as string | undefined;

/** Width the section renders at before being scaled into the panel. Narrowing
 *  the iframe instead would draw the mobile layout, which is not the one being
 *  judged here. */
const VIEWPORT_WIDTH = 1440;

interface SitePreviewProps {
  section: PreviewSection;
  draft: PreviewDraft;
  /** How much of the section to show, in site pixels before scaling. */
  viewportHeight?: number;
}

/**
 * One section of the live website, rendered by the website itself and driven by
 * the unsaved form state.
 *
 * It replaces the hand-drawn preview sketches this file used to sit beside. A
 * sketch is a second copy of a layout that nobody updates when the real one
 * moves, so it drifts and then reads as "the preview looks wrong". An iframe of
 * the real page cannot drift.
 */
export default function SitePreview({
  section,
  draft,
  viewportHeight = 900,
}: SitePreviewProps) {
  const frame = useRef<HTMLIFrameElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState<boolean>(false);
  const [scale, setScale] = useState<number>(0);

  const origin = SITE_URL
    ? new URL(SITE_URL, window.location.href).origin
    : null;

  useEffect(() => {
    if (!origin) return;

    const onMessage = (event: MessageEvent) => {
      if (event.origin === origin && event.data?.type === "cms-preview-ready")
        setReady(true);
    };

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [origin]);

  useEffect(() => {
    if (!ready || !origin) return;
    frame.current?.contentWindow?.postMessage(
      { type: "cms-draft", payload: draft },
      origin,
    );
  }, [ready, origin, draft]);

  useEffect(() => {
    const element = box.current;
    if (!element) return;

    const observer = new ResizeObserver(([entry]) =>
      setScale(entry.contentRect.width / VIEWPORT_WIDTH),
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  if (!SITE_URL)
    return (
      <p className="rounded-lg border border-line bg-raise p-4 text-xs text-ink-faint">
        Set <code>VITE_SITE_URL</code> to the website&rsquo;s origin to preview
        it here.
      </p>
    );

  return (
    <div
      ref={box}
      className="overflow-hidden rounded-lg border border-line bg-raise"
      style={{ height: viewportHeight * scale }}
    >
      <iframe
        ref={frame}
        src={`${SITE_URL}/preview/${section}`}
        title={`${section} preview`}
        sandbox="allow-scripts allow-same-origin"
        style={{
          width: VIEWPORT_WIDTH,
          height: viewportHeight,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          border: 0,
        }}
      />
    </div>
  );
}
