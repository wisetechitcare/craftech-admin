import { useEffect, useMemo, useRef, useState } from "react";

import type { PreviewDraft } from "@/components/admin/ui/SitePreview";

import { CustomCursorVariant } from "@/types/common";

const SITE_URL = import.meta.env.VITE_SITE_URL as string | undefined;
const VIEWPORT_WIDTH = 1024;
const VIEWPORT_HEIGHT = 320;

interface CursorPreviewProps {
  variant: CustomCursorVariant;
}

const CursorPreview = ({ variant }: CursorPreviewProps) => {
  const frame = useRef<HTMLIFrameElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState<boolean>(false);
  const [scale, setScale] = useState<number>(0);

  const draft: PreviewDraft = useMemo(
    () => ({
      appearance: { customCursorVariant: variant },
    }),
    [variant],
  );

  const origin = SITE_URL
    ? new URL(SITE_URL, window.location.href).origin
    : null;

  useEffect(() => {
    if (!origin) return;

    const onMessage = (event: MessageEvent) => {
      if (event.origin === origin && event.data?.type === "cms-preview-ready") {
        setReady(true);
      }
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

  if (!SITE_URL) {
    return (
      <p className="rounded-lg border border-line bg-raise p-4 text-xs text-ink-faint">
        Set <code>VITE_SITE_URL</code> to preview the cursor animation here.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wider text-ink-mute">
        Live Preview
      </p>
      <div
        ref={box}
        className="overflow-hidden rounded-lg border border-line bg-raise"
        style={{ height: VIEWPORT_HEIGHT * scale }}
      >
        <iframe
          ref={frame}
          src={`${SITE_URL}/preview/cursor`}
          title="Cursor animation preview"
          sandbox="allow-scripts allow-same-origin"
          style={{
            width: VIEWPORT_WIDTH,
            height: VIEWPORT_HEIGHT,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
            border: 0,
          }}
        />
      </div>
    </div>
  );
};

export default CursorPreview;
