
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface ProductProfitability {
  product_name: string;
  total_deliveries: number;
  total_revenue: number;
  total_spend: number;
  profit_net: number;
  roi_percent: number;
}

export function useProductProfitability(startDate?: Date, endDate?: Date) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['product-profitability', user?.id, startDate, endDate],
    queryFn: async (): Promise<ProductProfitability[]> => {
      if (!user) return [];

      const start = startDate?.toISOString().split('T')[0] || '2020-01-01';
      const end = endDate?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0];

      // Get profit data
      const { data: profitData, error: profitError } = await supabase
        .from('profit_tracking')
        .select('product_name, quantity, commission_total')
        .eq('user_id', user.id)
        .gte('date', start)
        .lte('date', end);

      if (profitError) {
        console.error('Error fetching profit data:', profitError);
        throw profitError;
      }

      // Get marketing spend data
      const { data: marketingData, error: marketingError } = await supabase
        .from('marketing_performance')
        .select('spend_usd, deliveries')
        .eq('user_id', user.id)
        .gte('date', start)
        .lte('date', end);

      if (marketingError) {
        console.error('Error fetching marketing data:', marketingError);
        throw marketingError;
      }

      // Calculate totals
      const totalSpend = marketingData?.reduce((sum, item) => sum + (item.spend_usd * 10.5), 0) || 0;
      const totalDeliveries = marketingData?.reduce((sum, item) => sum + item.deliveries, 0) || 0;

      // Group by product
      const productMap = new Map<string, ProductProfitability>();

      profitData?.forEach(item => {
        const existing = productMap.get(item.product_name) || {
          product_name: item.product_name,
          total_deliveries: 0,
          total_revenue: 0,
          total_spend: 0,
          profit_net: 0,
          roi_percent: 0,
        };

        existing.total_deliveries += item.quantity;
        existing.total_revenue += item.commission_total;
        
        productMap.set(item.product_name, existing);
      });

      // Distribute spend proportionally
      const results = Array.from(productMap.values()).map(product => {
        const spendRatio = totalDeliveries > 0 ? product.total_deliveries / totalDeliveries : 0;
        product.total_spend = totalSpend * spendRatio;
        product.profit_net = product.total_revenue - product.total_spend;
        product.roi_percent = product.total_spend > 0 ? (product.profit_net / product.total_spend) * 100 : 0;
        
        return product;
      });

      return results.sort((a, b) => b.profit_net - a.profit_net);
    },
    enabled: !!user,
  });
}
