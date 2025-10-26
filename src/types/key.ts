export interface Key {
  id: string;
  key_number: string;
  description: string;
  keywords: string[];
  status: string;
  location?: string | null;
  additional_notes?: string | null;
  image_urls?: string[] | null;
}
