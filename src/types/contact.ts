export type ContactSubmissionMode = "mail" | "whatsapp";

export type ContactFormFieldKey =
  "name" | "email" | "company" | "phone" | "message";

export interface ContactFormFieldConfig {
  label: string;
  placeholder: string;
  required: boolean;
}

export interface ContactSectionContent {
  title: string;
  description: string;
  submissionMode: ContactSubmissionMode;
  submitLabel: string;
  fields: Record<ContactFormFieldKey, ContactFormFieldConfig>;
  /** The order the website renders the inputs in. */
  fieldOrder: ContactFormFieldKey[];
}

export const EMPTY_CONTACT_SECTION: ContactSectionContent = {
  title: "",
  description: "",
  submissionMode: "mail",
  submitLabel: "",
  fieldOrder: ["name", "email", "company", "phone", "message"],
  fields: {
    name: { label: "", placeholder: "", required: true },
    email: { label: "", placeholder: "", required: true },
    company: { label: "", placeholder: "", required: false },
    phone: { label: "", placeholder: "", required: true },
    message: { label: "", placeholder: "", required: true },
  },
};
