
export interface ProductSpendAttribution {
  id: string;
  user_id: string;
  product_id?: string;
  product_name: string;
  amount_spent_mad: number;
  start_date: string;
  end_date: string;
  platform: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ProductSpendAttributionInput {
  product_id?: string;
  product_name: string;
  amount_spent_mad: number;
  start_date: string;
  end_date: string;
  platform: string;
  notes?: string;
}

export const ATTRIBUTION_PLATFORMS = [
  'Meta Ads',
  'Google Ads',
  'TikTok Ads',
  'Autre'
] as const;

export type AttributionPlatform = typeof ATTRIBUTION_PLATFORMS[number];
