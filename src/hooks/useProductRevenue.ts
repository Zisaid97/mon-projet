
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "./useAuth";
import { supabase } from "@/integrations/supabase/client";
import { startOfMonth, endOfMonth, format } from "date-fns";

export function useProductRevenue() {
  const { user } = useAuth();
  const now = new Date();
  const startDate = startOfMonth(now);
  const endDate = endOfMonth(now);

  const queryKey = ['product_revenue', user?.id, format(startDate, 'yyyy-MM-dd'), format(endDate, 'yyyy-MM-dd')];

  return useQuery({
    queryKey: queryKey,
    queryFn: async () => {
      if (!user) return null;

      const startDateString = format(startDate, 'yyyy-MM-dd');
      const endDateString = format(endDate, 'yyyy-MM-dd');

      // 1. Fetch profit data for the month.
      const { data: profitData, error: profitError } = await supabase
        .from('profit_tracking')
        .select('product_id, commission_total')
        .eq('user_id', user.id)
        .gte('date', startDateString)
        .lte('date', endDateString);

      if (profitError) throw profitError;
      
      if (!profitData || profitData.length === 0) {
        return [];
      }

      const productIds = [...new Set(profitData.map(p => p.product_id).filter(id => id))];

      if (productIds.length === 0) {
        return [];
      }

      // 2. Fetch product names for the relevant products
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('id, name')
        .in('id', productIds);
      
      if (productsError) throw productsError;

      const productMap = new Map(productsData.map(p => [p.id, p.name]));

      // 3. Aggregate revenue by product
      const revenueByProduct = profitData.reduce((acc, row) => {
        if (row.product_id) {
          const productId = row.product_id;
          acc[productId] = (acc[productId] || 0) + (row.commission_total || 0);
        }
        return acc;
      }, {} as Record<string, number>);
      
      // 4. Format data for the chart
      const chartData = Object.entries(revenueByProduct).map(([productId, totalRevenue]) => ({
        name: productMap.get(productId) || 'Produit Inconnu',
        value: totalRevenue,
      }));

      return chartData;
    },
    enabled: !!user,
  });
}
