import BusinessHoursFields from "./BusinessHoursFields";

import InputField from "@/components/admin/ui/InputField";
import { SectionCard } from "@/components/admin/ui/SectionCard";

import type { SettingsTabProps, SiteSettings } from "@/types/settings";

type ContactField =
  | "primaryPhone"
  | "alternatePhone"
  | "whatsappNumber"
  | "businessEmail"
  | "officeAddress"
  | "city"
  | "state"
  | "postalCode"
  | "country";

interface FieldSpec {
  key: ContactField;
  label: string;
  hint?: string;
  type?: string;
  placeholder?: string;
  wide?: boolean;
}

const CONTACT_FIELDS: FieldSpec[] = [
  {
    key: "primaryPhone",
    label: "Phone",
    type: "tel",
    placeholder: "+1 555 010 0000",
    hint: "Footer, contact section, the mobile call button and search results.",
  },
  {
    key: "alternatePhone",
    label: "Secondary phone",
    type: "tel",
    hint: "Optional. Listed under the phone in the footer and contact section.",
  },
  {
    key: "whatsappNumber",
    label: "WhatsApp number",
    type: "tel",
    placeholder: "+1 555 010 0000",
    hint: "Include the country code. Empty hides every WhatsApp button.",
  },
  {
    key: "businessEmail",
    label: "Email",
    type: "email",
    placeholder: "hello@example.com",
    hint: "Footer, contact section and search results. The FAQ uses it unless the FAQ sets its own.",
  },
];

const ADDRESS_FIELDS: FieldSpec[] = [
  {
    key: "officeAddress",
    label: "Street address",
    hint: "Leave the address empty if visitors have nowhere to visit.",
    wide: true,
  },
  { key: "city", label: "City" },
  { key: "state", label: "State / region" },
  { key: "postalCode", label: "Postal code" },
  { key: "country", label: "Country" },
];

const ContactLocationTab = (props: SettingsTabProps) => {
  const { data, errors, patch } = props;

  const renderField = ({
    key,
    label,
    hint,
    type,
    placeholder,
    wide,
  }: FieldSpec) => (
    <div key={key} className={wide ? "md:col-span-2" : undefined}>
      <InputField
        label={label}
        type={type}
        placeholder={placeholder}
        value={data[key] ?? ""}
        onChange={(e) =>
          patch({ [key]: e.target.value } as Partial<SiteSettings>)
        }
        error={!!errors[key]}
        hint={errors[key] ?? hint}
      />
    </div>
  );

  return (
    <div className="space-y-6">
      <SectionCard
        title="Contact"
        description="The one place the website reads contact details from. Anything left empty is simply not shown."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {CONTACT_FIELDS.map(renderField)}
        </div>
      </SectionCard>

      <SectionCard
        title="Address"
        description="Shown in the footer and contact section, and given to search engines."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {ADDRESS_FIELDS.map(renderField)}
        </div>
      </SectionCard>

      <BusinessHoursFields {...props} />
    </div>
  );
};

export default ContactLocationTab;
