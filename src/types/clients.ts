import type { LayoutVariant } from "./common";

export interface ClientsSectionContent {
  title: string;
  description: string;
}

export interface ClientsCopyFieldRule {
  max: number;
  helper: string;
  visible: boolean;
}

export interface ClientsCopyRules {
  title: ClientsCopyFieldRule;
  description: ClientsCopyFieldRule;
}

export interface ClientsSectionResponse extends ClientsSectionContent {
  variant: LayoutVariant;
  rules: ClientsCopyRules;
}

export interface ClientRecord {
  _id: string;
  name: string;
  displayName?: string | null;
  logo?: string;
  website?: string;
}

export interface ClientFormValues {
  logo: string;
  website: string;
  displayName: string;
}
