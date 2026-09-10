import React from "react";
import { Plus } from "lucide-react";

export const CARD = "bg-paper border border-line rounded-xl p-6 space-y-5";
export const HEADING =
  "text-sm font-semibold text-ink uppercase tracking-wider";

interface ListHeaderProps {
  title: string;
  description?: string;
  /** Present on the lists that cap their length: renders " (3/6)". */
  count?: number;
  max?: number;
  /** The Visible/Hidden switch, the Add button, or both. */
  controls?: React.ReactNode;
  /** Sections head their card with an h3; lists nested inside one use an h4. */
  nested?: boolean;
}

/** The heading, its optional counter, its description and whatever controls sit
 *  opposite them. Every ordered list in the Admin is topped by one. */
export const ListHeader = ({
  title,
  description,
  count,
  max,
  controls,
  nested,
}: ListHeaderProps) => {
  const heading = (
    <>
      {title}
      {count !== undefined && (
        <span className="text-ink-faint normal-case font-normal">
          {" "}
          ({count}/{max})
        </span>
      )}
    </>
  );

  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        {nested ? (
          <h4 className="text-xs font-semibold text-ink uppercase tracking-wider">
            {heading}
          </h4>
        ) : (
          <h3 className={HEADING}>{heading}</h3>
        )}
        {description && (
          <p className="mt-1 text-[11px] text-ink-faint">{description}</p>
        )}
      </div>
      {controls}
    </div>
  );
};

type SectionCardProps = ListHeaderProps & { children: React.ReactNode };

/** One panel of a CMS form: a headed card holding a section's fields. */
export const SectionCard = ({ children, ...header }: SectionCardProps) => (
  <div className={CARD}>
    <ListHeader {...header} />
    {children}
  </div>
);

interface AddButtonProps {
  label: string;
  disabled: boolean;
  onClick: () => void;
}

export const AddButton = ({ label, disabled, onClick }: AddButtonProps) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className="text-xs flex items-center gap-1 text-info disabled:opacity-40 disabled:cursor-not-allowed"
  >
    <Plus className="w-4 h-4" /> {label}
  </button>
);
