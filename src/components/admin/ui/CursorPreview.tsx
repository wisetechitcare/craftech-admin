import { useMemo } from "react";

import SitePreview, { PreviewSection } from "@/components/admin/ui/SitePreview";

import { CustomCursorVariant } from "@/types/common";

interface CursorPreviewProps {
  variant: CustomCursorVariant;
}

const CursorPreview = ({ variant }: CursorPreviewProps) => {
  const draft = useMemo(
    () => ({ appearance: { customCursorVariant: variant } }),
    [variant],
  );

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wider text-ink-mute">
        Live Preview
      </p>
      <SitePreview
        section={PreviewSection.CURSOR}
        draft={draft}
        viewportWidth={1024}
        viewportHeight={320}
      />
    </div>
  );
};

export default CursorPreview;
