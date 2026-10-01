export interface ClientsSectionContent {
  title: string;
  description: string;
}

export interface ClientRecord {
  _id: string;
  name: string;
  logo?: string;
  website?: string;
}

export interface ClientFormValues {
  logo: string;
  website: string;
}
