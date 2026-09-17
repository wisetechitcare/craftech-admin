import React from "react";

import { HEADING } from "@/components/admin/ui/SectionCard";
import SitePreview, {
  PreviewSection,
  type PreviewDraft,
} from "@/components/admin/ui/SitePreview";

interface PreviewPanelProps {
  section: PreviewSection;
  draft: PreviewDraft;
  viewportHeight?: number;
  title?: React.ReactNode;
  /** Controls beside the heading, such as a "Show all" reset. */
  actions?: React.ReactNode;
  caption?: React.ReactNode;
  /**
   * Where the preview sits relative to the form. CMS pages put a single section
   * `above` and a whole page to the `side`; the Appearance pages use the
   * default, `below`, so their controls come first.
   */
  placement?: "above" | "below" | "side";
  /** The form the preview is drawn from. */
  children: React.ReactNode;
}

/** Every live preview in the Admin: the real website section, placed relative
 *  to the form driving it. Pages never place a preview themselves. */
const PreviewPanel = ({
  section,
  draft,
  viewportHeight,
  title = "Preview",
  actions,
  caption = "Rendered by the website itself from what is on this page. Nothing is saved until you press Save.",
  placement = "below",
  children,
}: PreviewPanelProps) => {
  const sitePreview = (
    <SitePreview
      section={section}
      draft={draft}
      viewportHeight={viewportHeight}
    />
  );

  const preview = (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <h3 className={HEADING}>{title}</h3>
        {actions}
      </div>
      {placement === "side" ? (
        // A whole page is taller than the screen; the column scrolls on its own.
        <div className="max-h-160 overflow-y-auto rounded-lg">
          {sitePreview}
        </div>
      ) : (
        sitePreview
      )}
      <p className="text-xs text-ink-faint leading-relaxed">{caption}</p>
    </div>
  );

  if (placement === "side") {
    // items-start so the column sticks instead of stretching to the form's
    // height; `main` scrolls, so `sticky top-0` follows the page.
    return (
      <div className="grid items-start gap-6 xl:grid-cols-4">
        <aside className="xl:order-last xl:sticky xl:top-0">{preview}</aside>
        <div className="space-y-6 xl:col-span-3">{children}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {placement === "above" && preview}
      {children}
      {placement === "below" && preview}
    </div>
  );
};

export default PreviewPanel;
