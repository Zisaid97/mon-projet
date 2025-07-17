
export type FinancialRow = {
  id: string;
  user_id: string;
  date: string;
  exchange_rate: number;
  amount_received_usd: number;
  amount_received_mad: number;
  created_at: string;
  updated_at: string;
};

export type FinancialRowInput = {
  date: string;
  exchange_rate: number;
  amount_received_usd: number;
};
