import React from "react";

import InputField from "@/components/admin/ui/InputField";
import ListRow from "@/components/admin/ui/ListRow";
import TextArea from "@/components/admin/ui/TextArea";

// Forwarded so an About section imports everything it needs from one path.
// The card chrome itself is common — Navbar and Hero use it straight from ui/.
export {
  AddButton,
  CARD,
  HEADING,
  ListHeader,
  SectionCard,
} from "@/components/admin/ui/SectionCard";

import type {
  AboutContent,
  AboutItem,
  AboutRules,
  AboutSection,
  FieldErrors,
} from "@/types/about";
import { move, patchAt, removeAt } from "@/utils/utils";

/** What every section of the About form is handed. One shape for all seven, so
 *  AboutCMS can hold them in a keyed map and render it in the stored order. */
export interface AboutSectionProps {
  content: AboutContent;
  rules: AboutRules;
  errors: FieldErrors;
  patch: (changes: Partial<AboutContent>) => void;
  patchSection: <K extends keyof AboutContent>(
    key: K,
    changes: Partial<AboutContent[K]>,
  ) => void;
  toggle: (key: string) => React.ReactNode;
  elementToggles: (key: string) => React.ReactNode;
}

interface HeadFieldsProps {
  section: AboutSection;
  rules: AboutRules;
  errors: FieldErrors;
  path: string;
  onChange: (changes: Partial<AboutSection>) => void;
}

/** The eyebrow + heading every section on the page carries. */
export const HeadFields = ({
  section,
  rules,
  errors,
  path,
  onChange,
}: HeadFieldsProps) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <InputField
      label="Section label"
      value={section.label}
      onChange={(e) => onChange({ label: e.target.value })}
      maxChars={rules.label.max}
      error={!!errors[`${path}.label`]}
      hint={errors[`${path}.label`]}
      tooltip="The small kicker above the heading."
    />
    <InputField
      label="Section heading"
      value={section.heading}
      onChange={(e) => onChange({ heading: e.target.value })}
      maxChars={rules.heading.max}
      error={!!errors[`${path}.heading`]}
      hint={errors[`${path}.heading`]}
    />
  </div>
);

interface IconItemRowsProps<T extends AboutItem> {
  items: T[];
  rules: AboutRules;
  errors: FieldErrors;
  /** The zod error path these rows are keyed under, e.g. "whatWeDo.items". */
  path: string;
  listId: string;
  /** What one row is called: "Service", "Reason", "Value". */
  title: string;
  iconTooltip: string;
  onChange: (items: T[]) => void;
  /** Fields this list adds below the description. Only What We Do has any. */
  extra?: (item: T, index: number) => React.ReactNode;
}

/** The icon + title + description rows that Values, Services and Reasons are
 *  all made of. They differ only in what a row is called, where its errors are
 *  keyed, and whether anything follows the description. */
export const IconItemRows = <T extends AboutItem>({
  items,
  rules,
  errors,
  path,
  listId,
  title,
  iconTooltip,
  onChange,
  extra,
}: IconItemRowsProps<T>) => {
  // One cast, because TypeScript cannot see that a Partial<AboutItem> is a
  // Partial<T> for every T that extends AboutItem.
  const set = (index: number, changes: Partial<AboutItem>) =>
    onChange(patchAt(items, index, changes as Partial<T>));

  return (
    <>
      {items.map((item, i) => (
        <ListRow
          key={i}
          title={title}
          index={i}
          count={items.length}
          listId={listId}
          onMove={(from, to) => onChange(move(items, from, to))}
          onRemove={(index) => onChange(removeAt(items, index))}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="Title"
              value={item.title}
              onChange={(e) => set(i, { title: e.target.value })}
              maxChars={rules.item.title.max}
              error={!!errors[`${path}.${i}.title`]}
              hint={errors[`${path}.${i}.title`]}
            />
            <InputField
              label="Icon"
              value={item.icon}
              onChange={(e) => set(i, { icon: e.target.value })}
              error={!!errors[`${path}.${i}.icon`]}
              hint={errors[`${path}.${i}.icon`]}
              tooltip={iconTooltip}
            />
          </div>
          <TextArea
            label="Description"
            value={item.description}
            onChange={(e) => set(i, { description: e.target.value })}
            maxChars={rules.item.description.max}
            error={!!errors[`${path}.${i}.description`]}
            hint={errors[`${path}.${i}.description`]}
          />
          {extra?.(item, i)}
        </ListRow>
      ))}
    </>
  );
};
