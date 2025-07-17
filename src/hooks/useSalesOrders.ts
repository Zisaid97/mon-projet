
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface SalesOrder {
  id: string;
  product_name: string;
  confirmed_at: string;
  qty: number;
  total_amount_mad: number;
  city?: string;
  channel?: string;
  status: string;
}

export function useSalesOrders() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['sales-orders', user?.id],
    queryFn: async (): Promise<SalesOrder[]> => {
      if (!user) return [];

      // Use profit_tracking as the source until sales_orders table is available in types
      const { data, error } = await supabase
        .from('profit_tracking')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) {
        console.error('Error fetching sales orders:', error);
        throw error;
      }

      // Transform profit_tracking data to match SalesOrder interface
      return (data || []).map(item => ({
        id: item.id,
        product_name: item.product_name,
        confirmed_at: item.date,
        qty: item.quantity,
        total_amount_mad: item.commission_total,
        city: undefined,
        channel: undefined,
        status: 'delivered'
      }));
    },
    enabled: !!user,
  });
}
