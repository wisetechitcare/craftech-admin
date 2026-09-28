import React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export const CARD = "bg-paper border border-line rounded-xl p-6 space-y-5";
export const HEADING =
  "text-sm font-semibold text-ink uppercase tracking-wider";

interface ListHeaderProps {
  title: string;
  description?: string;
  /** Present on the lists that cap their length: renders " (3/6)". */
  count?: number;
  max?: number;
  /** The Visible/Hidden switch. Sits opposite the title, against the far edge
   *  of the card. */
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
          <p className="mt-1 text-xs text-ink-faint">{description}</p>
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

/** Sits under the last row of the list it adds to, the way Google Contacts
 *  places "Add phone" — where the new row will appear. */
export const AddButton = ({ label, disabled, onClick }: AddButtonProps) => (
  <Button
    type="button"
    onClick={onClick}
    variant="primary"
    size="xs"
    disabled={disabled}
    startIcon={<Plus className="size-4" />}
  >
    {label}
  </Button>
);
