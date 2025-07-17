
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { Filters } from "@/stores/filtersStore";

export interface FilteredStatsData {
  deliveries: Array<{
    product: string;
    qty: number;
    revenue_mad: number;
  }>;
  revenueByCity: Array<{
    city: string;
    amount_mad: number;
  }>;
  deliveriesDaily: Array<{
    day: string;
    qty: number;
  }>;
}

export function useFilteredStats(filters: Filters) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['filtered-stats', user?.id, filters],
    queryFn: async (): Promise<FilteredStatsData> => {
      if (!user) return { deliveries: [], revenueByCity: [], deliveriesDaily: [] };

      const startDate = filters.start?.toISOString().split('T')[0] || '2020-01-01';
      const endDate = filters.end?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0];

      // Récupérer les données de livraisons par produit
      let deliveriesQuery = supabase
        .from('profit_tracking')
        .select('product_name, quantity, commission_total')
        .eq('user_id', user.id)
        .gte('date', startDate)
        .lte('date', endDate);

      if (filters.productIds.length > 0) {
        deliveriesQuery = deliveriesQuery.in('product_name', filters.productIds);
      }

      const { data: deliveriesData, error: deliveriesError } = await deliveriesQuery;

      if (deliveriesError) {
        console.error('Error fetching deliveries data:', deliveriesError);
        throw deliveriesError;
      }

      // Récupérer les données de ventes par ville
      let salesQuery = supabase
        .from('sales_data')
        .select('city, price')
        .eq('user_id', user.id)
        .gte('date', startDate)
        .lte('date', endDate);

      if (filters.cities.length > 0) {
        salesQuery = salesQuery.in('city', filters.cities);
      }

      if (filters.channels.length > 0) {
        salesQuery = salesQuery.in('sales_channel', filters.channels);
      }

      const { data: salesData, error: salesError } = await salesQuery;

      if (salesError) {
        console.error('Error fetching sales data:', salesError);
        throw salesError;
      }

      // Récupérer les livraisons quotidiennes
      let dailyQuery = supabase
        .from('profit_tracking')
        .select('date, quantity')
        .eq('user_id', user.id)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date');

      if (filters.productIds.length > 0) {
        dailyQuery = dailyQuery.in('product_name', filters.productIds);
      }

      const { data: dailyData, error: dailyError } = await dailyQuery;

      if (dailyError) {
        console.error('Error fetching daily data:', dailyError);
        throw dailyError;
      }

      // Agréger les données
      const deliveriesMap = new Map<string, { qty: number; revenue_mad: number }>();
      deliveriesData?.forEach(item => {
        const existing = deliveriesMap.get(item.product_name) || { qty: 0, revenue_mad: 0 };
        deliveriesMap.set(item.product_name, {
          qty: existing.qty + item.quantity,
          revenue_mad: existing.revenue_mad + item.commission_total,
        });
      });

      const deliveries = Array.from(deliveriesMap.entries()).map(([product, data]) => ({
        product,
        qty: data.qty,
        revenue_mad: data.revenue_mad,
      }));

      const citiesMap = new Map<string, number>();
      salesData?.forEach(item => {
        const existing = citiesMap.get(item.city) || 0;
        citiesMap.set(item.city, existing + item.price);
      });

      const revenueByCity = Array.from(citiesMap.entries()).map(([city, amount_mad]) => ({
        city,
        amount_mad,
      }));

      const dailyMap = new Map<string, number>();
      dailyData?.forEach(item => {
        const existing = dailyMap.get(item.date) || 0;
        dailyMap.set(item.date, existing + item.quantity);
      });

      const deliveriesDaily = Array.from(dailyMap.entries()).map(([day, qty]) => ({
        day,
        qty,
      }));

      return {
        deliveries,
        revenueByCity,
        deliveriesDaily,
      };
    },
    enabled: !!user,
  });
}
