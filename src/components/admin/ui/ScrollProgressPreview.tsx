import { useMemo } from "react";

import SitePreview, { PreviewSection } from "@/components/admin/ui/SitePreview";

const SCROLL_PROGRESS_KEY = "site.scrollProgress";

interface ScrollProgressPreviewProps {
  visible: boolean;
}

const ScrollProgressPreview = ({ visible }: ScrollProgressPreviewProps) => {
  const draft = useMemo(
    () => ({ appearance: { visibility: { [SCROLL_PROGRESS_KEY]: visible } } }),
    [visible],
  );

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wider text-ink-mute">
        Live Preview
      </p>
      <SitePreview
        section={PreviewSection.SCROLL_PROGRESS}
        draft={draft}
        viewportWidth={1024}
        viewportHeight={360}
      />
    </div>
  );
};

export default ScrollProgressPreview;
