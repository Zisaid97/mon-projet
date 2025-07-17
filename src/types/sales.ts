
export interface SalesData {
  id: string;
  external_order_id: string;
  date: string;
  sales_channel: string;
  tracking_number: string;
  customer: string;
  products: string;
  price: number;
  payment_method: string;
  deposit: number;
  customer_shipping: string;
  phone: string;
  address: string;
  city: string;
  notes: string;
  confirmation_status: string;
  confirmation_note: string;
  delivery_agent: string;
  delivery_status: string;
  delivery_note: string;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SalesFilters {
  city: string;
  confirmationStatus: string;
  deliveryStatus: string;
  stockStatus: string;
  salesChannel: string;
  product: string;
  agent: string;
  dateFrom: string;
  dateTo: string;
  searchTerm: string;
}

export interface SalesStats {
  totalSales: number;
  confirmedPercentage: number;
  deliveredPercentage: number;
  failedPercentage: number;
  pendingPercentage: number;
}
