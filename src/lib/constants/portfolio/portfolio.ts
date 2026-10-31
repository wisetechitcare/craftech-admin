import type { SectionCopyField } from "@/types/common";
import type { PortfolioSectionContent } from "@/types/portfolio";

export type PortfolioSectionCopy = Pick<
  PortfolioSectionContent,
  "eyebrow" | "title" | "description" | "viewAllLabel"
>;

export const PORTFOLIO_VISIBILITY_KEY = "home.portfolio";

/** The registry group holding the /projects page tools (search, category tabs). */
export const PROJECTS_PAGE_VISIBILITY_GROUP = "projects";

export const PORTFOLIO_SECTION_DEFAULTS: PortfolioSectionContent = {
  eyebrow: "Our Work",
  title: "Engineering Distinction.",
  description:
    "A selection of our recent work across structure, fit-out, and MEP delivery.",
  viewAllLabel: "View All Projects",
};

export const PORTFOLIO_SECTION_FIELDS: SectionCopyField<PortfolioSectionCopy>[] =
  [
    {
      key: "eyebrow",
      label: "Eyebrow",
      placeholder: PORTFOLIO_SECTION_DEFAULTS.eyebrow,
      tooltip: "The short label above the title.",
      narrow: true,
    },
    {
      key: "title",
      label: "Title",
      placeholder: PORTFOLIO_SECTION_DEFAULTS.title,
    },
    {
      key: "description",
      label: "Supporting text",
      placeholder: PORTFOLIO_SECTION_DEFAULTS.description,
      multiline: true,
    },
    {
      key: "viewAllLabel",
      label: "View all projects button",
      placeholder: PORTFOLIO_SECTION_DEFAULTS.viewAllLabel,
      tooltip: "The button links visitors to the full projects page.",
      maxChars: 40,
      narrow: true,
    },
  ];
