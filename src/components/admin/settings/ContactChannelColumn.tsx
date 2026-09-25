import { Trash2 } from "lucide-react";

import InputField from "@/components/admin/ui/InputField";
import { AddButton, ListHeader } from "@/components/admin/ui/SectionCard";
import {
  VisibilityToggle,
  isVisible,
  type VisibilityMap,
} from "@/components/admin/ui/VisibilityToggle";
import { Button } from "@/components/ui/button";
import { PhoneField } from "@/components/common";

import {
  CONTACT_SLOTS,
  contactSlotVisibilityKey,
} from "@/lib/constants/settings";

interface ContactChannelColumnProps {
  channel: "phone" | "email";
  title: string;
  label: string;
  addLabel: string;
  placeholder: string;
  /** The field path the server reports errors against — "phones" or "emails". */
  field: string;
  errors: Record<string, string>;
  values: string[];
  visibility: VisibilityMap;
  /** A hidden card disables the switches inside it rather than leaving them
   *  looking live while the whole block is off. */
  sectionVisible: boolean;
  onChange: (values: string[]) => void;
  onRemove: (index: number) => void;
  patchVisibility: (key: string, visible: boolean) => void;
}

/**
 * One channel's numbered fields. The first is always on screen — a site with no
 * way to reach it has nothing to configure — and the rest are added on request
 * up to the cap. Whichever is filled in first is the one the website uses
 * wherever it can only show one.
 */
const ContactChannelColumn = ({
  channel,
  title,
  label,
  addLabel,
  placeholder,
  field,
  errors,
  values,
  visibility,
  sectionVisible,
  onChange,
  onRemove,
  patchVisibility,
}: ContactChannelColumnProps) => {
  const rows = values.length > 0 ? values : [""];

  return (
    <div className="space-y-4">
      <ListHeader
        nested
        title={title}
        count={rows.length}
        max={CONTACT_SLOTS}
        titleControls={
          <AddButton
            label={addLabel}
            disabled={rows.length >= CONTACT_SLOTS}
            onClick={() => onChange([...rows, ""])}
          />
        }
      />

      {rows.map((value, index) => {
        const error = errors[`${field}.${index}`];
        const key = contactSlotVisibilityKey(channel, index);

        const fieldProps = {
          label: `${label} ${index + 1}`,
          placeholder,
          value,
          onChange: (event: React.ChangeEvent<HTMLInputElement>) =>
            onChange(
              rows.map((row, i) => (i === index ? event.target.value : row)),
            ),
          error: !!error,
          hint: error,
          labelAction: (
            <span className="flex items-center gap-1">
              <VisibilityToggle
                visible={sectionVisible && isVisible(visibility, key)}
                disabled={!sectionVisible}
                onChange={(visible) => patchVisibility(key, visible)}
              />
              {rows.length > 1 && (
                <Button
                  type="button"
                  variant="none"
                  onClick={() => onRemove(index)}
                  aria-label={`Remove ${label} ${index + 1}`}
                  className="p-1 text-ink-faint hover:text-danger"
                >
                  <Trash2 className="size-4" />
                </Button>
              )}
            </span>
          ),
        };

        return channel === "phone" ? (
          <PhoneField key={key} {...fieldProps} />
        ) : (
          <InputField key={key} type="email" {...fieldProps} />
        );
      })}
    </div>
  );
};

export default ContactChannelColumn;
