
export interface ProfitRow {
  id: string;
  user_id: string;
  date: string;
  cpd_category: number;
  product_name: string;
  quantity: number;
  commission_total: number;
  product_id?: string;
  source_type: string; // 'normale' ou 'décalée'
  created_at?: string;
  updated_at?: string;
}

export interface ProfitRowInput {
  date: string;
  cpd_category: number;
  product_name: string;
  quantity: number;
  commission_total: number;
  product_id?: string;
  source_type?: string; // 'normale' par défaut
}

// Catégories CPD incluant toutes les valeurs présentes dans les produits
export const CPD_CATEGORIES = [110, 130, 140, 150, 200, 250, 300, 350, 400, 450, 500];
