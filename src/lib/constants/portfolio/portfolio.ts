import type { SectionCopyField } from "@/types/common";
import type { PortfolioSectionContent } from "@/types/portfolio";

export const PORTFOLIO_VISIBILITY_KEY = "home.portfolio";

export const PORTFOLIO_SECTION_DEFAULTS: PortfolioSectionContent = {
  eyebrow: "Our Work",
  title: "Engineering Distinction.",
  description:
    "A selection of our recent work across structure, fit-out, and MEP delivery.",
};

export const PORTFOLIO_SECTION_FIELDS: SectionCopyField<PortfolioSectionContent>[] =
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
  ];
