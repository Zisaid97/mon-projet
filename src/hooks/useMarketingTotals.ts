
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "./useAuth";
import { supabase } from "@/integrations/supabase/client";
import { startOfMonth, endOfMonth, format } from "date-fns";

export function useMonthlyMarketingTotals() {
  const { user } = useAuth();
  const now = new Date();
  const startDate = format(startOfMonth(now), 'yyyy-MM-dd');
  const endDate = format(endOfMonth(now), 'yyyy-MM-dd');

  return useQuery({
    queryKey: ['marketing_totals', user?.id, startDate, endDate],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from('marketing_performance')
        .select('spend_usd, leads, deliveries')
        .eq('user_id', user.id)
        .gte('date', startDate)
        .lte('date', endDate);
      
      if (error) throw error;

      const totals = data.reduce((acc, row) => {
        acc.totalSpend += row.spend_usd || 0;
        acc.totalLeads += row.leads || 0;
        acc.totalDeliveries += row.deliveries || 0;
        return acc;
      }, { totalSpend: 0, totalLeads: 0, totalDeliveries: 0 });

      return totals;
    },
    enabled: !!user,
  });
}
