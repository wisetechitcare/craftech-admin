import type { ProjectFieldDefinition } from "@/types/project";

export interface PortfolioSectionContent {
  eyebrow: string;
  title: string;
  description: string;
  viewAllLabel: string;
  fields?: ProjectFieldDefinition[];
}
