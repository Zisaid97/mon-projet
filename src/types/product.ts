
export interface Product {
  id: string;
  user_id: string;
  name: string;
  cpd_category: number;
  image_url?: string;
  product_link?: string;
  external_links?: string[];
  facebook_keywords?: string[];
  created_at: string;
  updated_at: string;
}

export interface ProductKeyword {
  id: string;
  product_id: string;
  keyword: string;
  note: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export type ProductInput = {
  name: string;
  cpd_category: number;
  image_url?: string;
  product_link?: string;
  external_links?: string[];
  facebook_keywords?: string[];
};

export type ProductKeywordInput = {
  keyword: string;
  note?: string;
};
