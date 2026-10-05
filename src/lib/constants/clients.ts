import { LayoutVariant, type SectionCopyField } from "@/types/common";
import type { ClientsCopyRules, ClientsSectionContent } from "@/types/clients";

export const CLIENTS_VARIANT_DEFAULT = LayoutVariant.PREMIUM_GLASS;

export const CLIENTS_UPLOAD_FOLDER = "clients";
export const CLIENTS_ADMIN_PATH = "/admin/clients";

/** Keep in sync with craftech-backend-ts `CLIENT_DISPLAY_NAME_MAX`. */
export const CLIENT_DISPLAY_NAME_MAX = 28;

export const CLIENT_DISPLAY_NAME_HELPER = `Variant 2 shows “Trusted by …” on logo hover. Max ${CLIENT_DISPLAY_NAME_MAX} characters so the headline stays on one line on small screens.`;

export const CLIENTS_VISIBILITY = {
  GLOBAL: "global.clients",
  HOME: "home.clients",
  ABOUT: "about.clients",
} as const;

/** Section copy card + field visibility toggles use the global placement key. */
export const CLIENTS_SECTION_VISIBILITY_KEY = CLIENTS_VISIBILITY.GLOBAL;

export const CLIENTS_SECTION_DEFAULTS: ClientsSectionContent = {
  title: "Clients & partners",
  description: "Organizations we are proud to work with.",
};

export const CLIENTS_PLACEMENT_SWITCHES = [
  {
    key: CLIENTS_VISIBILITY.GLOBAL,
    label: "Global strip",
    helper:
      "Fixed logo loop at the bottom of every public page, like the Navbar.",
  },
  {
    key: CLIENTS_VISIBILITY.HOME,
    label: "Homepage section",
    helper: "Full-width clients band on the homepage.",
  },
  {
    key: CLIENTS_VISIBILITY.ABOUT,
    label: "About page section",
    helper: "Full-width clients band on /about.",
  },
] as const;

const BASE_FIELDS: SectionCopyField<ClientsSectionContent>[] = [
  {
    key: "title",
    label: "Title",
    placeholder: CLIENTS_SECTION_DEFAULTS.title,
  },
  {
    key: "description",
    label: "Supporting text",
    placeholder: CLIENTS_SECTION_DEFAULTS.description,
    multiline: true,
  },
];

export function clientsSectionFields(
  rules: ClientsCopyRules,
): SectionCopyField<ClientsSectionContent>[] {
  return BASE_FIELDS.map((field) => ({
    ...field,
    tooltip: rules[field.key].helper,
    maxChars: rules[field.key].max,
  }));
}
