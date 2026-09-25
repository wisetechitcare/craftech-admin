import type { ContactFormFieldKey } from "@/types/contact";

/** What the live Contact section shows while copy is left empty. */
export const CONTACT_SECTION_DEFAULTS = {
  title: "Contact us",
  description:
    "We are always looking for ways to improve our products and services. Contact us and let us know how we can help you.",
};

export const CONTACT_SUBMIT_LABEL_DEFAULTS = {
  mail: "Send Message",
  whatsapp: "Chat on WhatsApp",
} as const;

export const CONTACT_FIELD_DEFAULTS: Record<
  ContactFormFieldKey,
  { label: string; placeholder: string; required: boolean }
> = {
  name: { label: "Full name", placeholder: "Your name", required: true },
  email: {
    label: "Email Address",
    placeholder: "you@company.com",
    required: true,
  },
  company: {
    label: "Company",
    placeholder: "Your company",
    required: false,
  },
  phone: {
    label: "Phone",
    placeholder: "Your phone number",
    required: true,
  },
  message: {
    label: "Message",
    placeholder: "Type your message here",
    required: true,
  },
};

export const CONTACT_FORM_FIELD_KEYS: ContactFormFieldKey[] = [
  "name",
  "email",
  "company",
  "phone",
  "message",
];

export const CONTACT_FIELD_LABELS: Record<ContactFormFieldKey, string> = {
  name: "Name",
  email: "Email",
  company: "Company",
  phone: "Phone",
  message: "Message",
};

/** The appearance flag for the whole Contact section. */
export const CONTACT_VISIBILITY_KEY = "home.contact";
