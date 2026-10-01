import type { SectionCopyField } from "@/types/common";
import type { ClientsSectionContent } from "@/types/clients";

export const CLIENTS_UPLOAD_FOLDER = "clients";
export const CLIENTS_ADMIN_PATH = "/admin/clients";

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
      "Fixed logo loop at the bottom of every public page, like the Navbar. Turns off Home and About sections automatically.",
  },
  {
    key: CLIENTS_VISIBILITY.HOME,
    label: "Homepage section",
    helper: "Full-width band on the homepage when Global strip is off.",
  },
  {
    key: CLIENTS_VISIBILITY.ABOUT,
    label: "About page section",
    helper: "Full-width band on /about when Global strip is off.",
  },
] as const;

export const CLIENTS_SECTION_FIELDS: SectionCopyField<ClientsSectionContent>[] =
  [
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
