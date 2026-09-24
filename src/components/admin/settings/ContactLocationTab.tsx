import AddressListFields from "./AddressListFields";
import ContactChannelColumn from "./ContactChannelColumn";

import InputField from "@/components/admin/ui/InputField";
import SelectField from "@/components/admin/ui/SelectField";
import { SectionCard } from "@/components/admin/ui/SectionCard";
import {
  SectionVisibilitySwitch,
  isVisible,
  type VisibilityMap,
} from "@/components/admin/ui/VisibilityToggle";

import {
  CONTACT_SLOTS,
  ContactVisibilitySection,
  contactSlotVisibilityKey,
} from "@/lib/constants/settings";
import type { SettingsTabProps } from "@/types/settings";
import { removeAt } from "@/utils/utils";

type ContactChannel = "phone" | "email" | "address";

/**
 * Removing a row moves every row below it up one, so its visibility flag has to
 * move with it. Left alone, deleting a shown number would hand its neighbour
 * the flag of the row that used to sit there — the next number quietly
 * disappearing from the site, or a hidden one reappearing.
 */
const shiftVisibilityAfterRemove = (
  visibility: VisibilityMap,
  channel: ContactChannel,
  removed: number,
): VisibilityMap => {
  const next = { ...visibility };
  for (let index = removed; index < CONTACT_SLOTS - 1; index += 1) {
    const from = contactSlotVisibilityKey(channel, index + 1);
    const to = contactSlotVisibilityKey(channel, index);
    if (from in next) {
      next[to] = next[from];
    } else {
      delete next[to];
    }
  }
  delete next[contactSlotVisibilityKey(channel, CONTACT_SLOTS - 1)];
  return next;
};

const ContactLocationTab = ({
  data,
  errors,
  patch,
  visibility,
  setVisibility,
  patchVisibility,
}: SettingsTabProps) => {
  const phones = data.phones ?? [];
  const emails = data.emails ?? [];
  const addresses = data.addresses ?? [];
  const contactInfoVisible = isVisible(
    visibility,
    ContactVisibilitySection.CONTACT_INFO,
  );

  const removeSlot = (channel: ContactChannel, index: number) =>
    setVisibility((current) =>
      shiftVisibilityAfterRemove(current, channel, index),
    );

  const whatsappOptions = phones.flatMap((phone, index) =>
    phone.trim()
      ? [{ value: String(index), label: `${index + 1} — ${phone}` }]
      : [],
  );
  // The stored pick can point at a row that has since been cleared or removed.
  // Showing the server's own fallback — the first number there is — beats a
  // select displaying an index that is no longer one of its options.
  const whatsappValue = String(data.whatsappPhoneIndex ?? -1);
  const whatsappSelected = whatsappOptions.some(
    (option) => option.value === whatsappValue,
  )
    ? whatsappValue
    : (whatsappOptions[0]?.value ?? "");

  return (
    <div className="space-y-6">
      <SectionCard
        title="Contact information"
        description="Up to four numbers and four addresses. Whichever is filled in first is the one the website uses wherever it can only show one."
        controls={
          <SectionVisibilitySwitch
            visible={contactInfoVisible}
            onChange={(visible) =>
              patchVisibility(ContactVisibilitySection.CONTACT_INFO, visible)
            }
          />
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
          <ContactChannelColumn
            channel="phone"
            title="Phone numbers"
            label="Phone number"
            addLabel="Add phone"
            placeholder="+1 555 010 0000"
            field="phones"
            errors={errors}
            values={phones}
            visibility={visibility}
            sectionVisible={contactInfoVisible}
            onChange={(next) => patch({ phones: next })}
            onRemove={(index) => {
              patch({ phones: removeAt(phones, index) });
              removeSlot("phone", index);
            }}
            patchVisibility={patchVisibility}
          />
          <ContactChannelColumn
            channel="email"
            title="Email addresses"
            label="Email"
            addLabel="Add email"
            placeholder="hello@example.com"
            field="emails"
            errors={errors}
            values={emails}
            visibility={visibility}
            sectionVisible={contactInfoVisible}
            onChange={(next) => patch({ emails: next })}
            onRemove={(index) => {
              patch({ emails: removeAt(emails, index) });
              removeSlot("email", index);
            }}
            patchVisibility={patchVisibility}
          />
        </div>

        {whatsappOptions.length > 1 && (
          <div className="border-t border-line pt-5">
            <SelectField
              label="WhatsApp number"
              value={whatsappSelected}
              onValueChange={(value) =>
                patch({ whatsappPhoneIndex: Number(value) })
              }
              options={whatsappOptions}
            />
            <p className="mt-2 text-xs text-ink-mute">
              Which of these numbers every WhatsApp button opens a chat with.
              With one number on file it is used without asking.
            </p>
          </div>
        )}
      </SectionCard>

      <AddressListFields
        errors={errors}
        values={addresses}
        visibility={visibility}
        onChange={(next) => patch({ addresses: next })}
        onRemove={(index) => {
          patch({ addresses: removeAt(addresses, index) });
          removeSlot("address", index);
        }}
        patchVisibility={patchVisibility}
      />

      <SectionCard
        title="Map embed"
        description="Paste Google Maps Share → Embed a map (URL or iframe) for the head office. Branches are listed but never pinned."
      >
        <InputField
          label="Google Maps embed"
          value={data.mapEmbedUrl ?? ""}
          onChange={(e) => patch({ mapEmbedUrl: e.target.value })}
          error={!!errors.mapEmbedUrl}
          hint={
            errors.mapEmbedUrl ??
            "Use https://www.google.com/maps/embed?... or paste the iframe HTML."
          }
        />
      </SectionCard>
    </div>
  );
};

export default ContactLocationTab;
