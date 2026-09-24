import { Trash2 } from "lucide-react";

import InputField from "@/components/admin/ui/InputField";
import { AddButton, SectionCard } from "@/components/admin/ui/SectionCard";
import {
  SectionVisibilitySwitch,
  VisibilityToggle,
  isVisible,
  type VisibilityMap,
} from "@/components/admin/ui/VisibilityToggle";
import { Button } from "@/components/ui/button";

import {
  CONTACT_SLOTS,
  ContactVisibilitySection,
  contactSlotVisibilityKey,
} from "@/lib/constants/settings";
import { EMPTY_ADDRESS, type AddressEntry } from "@/types/settings";
import { patchAt } from "@/utils/utils";

interface AddressListFieldsProps {
  errors: Record<string, string>;
  values: AddressEntry[];
  visibility: VisibilityMap;
  onChange: (values: AddressEntry[]) => void;
  onRemove: (index: number) => void;
  patchVisibility: (key: string, visible: boolean) => void;
}

const ADDRESS_PARTS: {
  key: keyof AddressEntry;
  label: string;
  wide?: boolean;
}[] = [
  { key: "street", label: "Street address", wide: true },
  { key: "city", label: "City" },
  { key: "state", label: "State / region" },
  { key: "postalCode", label: "Postal code" },
  { key: "country", label: "Country" },
];

/**
 * The offices, stacked rather than side by side: an address is five fields of
 * its own, and two of them abreast reads as one address split in half. The
 * first that is filled in and visible is the head office — what the footer and
 * search engines are given, and the only one the map pins.
 */
const AddressListFields = ({
  errors,
  values,
  visibility,
  onChange,
  onRemove,
  patchVisibility,
}: AddressListFieldsProps) => {
  const rows = values.length > 0 ? values : [EMPTY_ADDRESS];
  const sectionVisible = isVisible(
    visibility,
    ContactVisibilitySection.ADDRESSES,
  );

  return (
    <SectionCard
      title="Addresses"
      description="The first address is the head office. The map always pins that one; any others are listed as branches."
      count={rows.length}
      max={CONTACT_SLOTS}
      titleControls={
        <AddButton
          label="Add address"
          disabled={rows.length >= CONTACT_SLOTS}
          onClick={() => onChange([...rows, EMPTY_ADDRESS])}
        />
      }
      controls={
        <SectionVisibilitySwitch
          visible={sectionVisible}
          onChange={(visible) =>
            patchVisibility(ContactVisibilitySection.ADDRESSES, visible)
          }
        />
      }
    >
      <div className="space-y-5">
        {rows.map((address, index) => {
          const key = contactSlotVisibilityKey("address", index);

          return (
            <div
              key={key}
              className="rounded-xl border border-line bg-raise p-4 space-y-4"
            >
              <div className="flex items-center justify-between gap-4">
                <span className="text-xs font-bold text-ink uppercase tracking-wider">
                  {index === 0 ? "Head office" : `Branch ${index}`}
                </span>
                <div className="flex items-center gap-1">
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
                      aria-label={`Remove address ${index + 1}`}
                      className="p-1 text-ink-faint hover:text-danger"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {ADDRESS_PARTS.map((part) => {
                  const error = errors[`addresses.${index}.${part.key}`];
                  return (
                    <div
                      key={part.key}
                      className={part.wide ? "md:col-span-2" : undefined}
                    >
                      <InputField
                        label={part.label}
                        value={address[part.key] ?? ""}
                        onChange={(event) =>
                          onChange(
                            patchAt(rows, index, {
                              [part.key]: event.target.value,
                            }),
                          )
                        }
                        error={!!error}
                        hint={error}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
};

export default AddressListFields;
