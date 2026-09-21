import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  /** Present on the pages that cap their list: renders " (3/6)". */
  count?: number;
  max?: number;
  description?: ReactNode;
  /** The Visible/Hidden switch, the New button, or whatever sits opposite. */
  action?: ReactNode;
}

const PageHeader = ({
  title,
  count,
  max,
  description,
  action,
}: PageHeaderProps) => (
  <div className="flex items-start justify-between gap-4">
    <div>
      <h2 className="text-xl font-bold text-ink">
        {title}
        {count !== undefined && (
          <span className="font-normal text-ink-faint">
            {" "}
            ({count}/{max})
          </span>
        )}
      </h2>
      {description && <p className="text-sm text-ink-mute">{description}</p>}
    </div>
    {action}
  </div>
);

export default PageHeader;
