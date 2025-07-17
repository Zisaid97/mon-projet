
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface MonthlyKPIData {
  period: string;
  total_revenue: number;
  total_spend: number;
  total_leads: number;
  total_deliveries: number;
  total_bonus: number;
  avg_cpl_mad: number;
  avg_cpd_mad: number;
  roi_percent: number;
  net_profit: number;
}

export function useMonthlyKPIs(month: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['monthly-kpis', user?.id, month],
    queryFn: async (): Promise<MonthlyKPIData | null> => {
      if (!user) return null;

      // Récupérer les données de marketing pour le mois
      const startOfMonth = new Date(month);
      const endOfMonth = new Date(startOfMonth.getFullYear(), startOfMonth.getMonth() + 1, 0);
      
      const { data: marketingData, error: marketingError } = await supabase
        .from('marketing_performance')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', startOfMonth.toISOString().split('T')[0])
        .lte('date', endOfMonth.toISOString().split('T')[0]);

      if (marketingError) {
        console.error('Error fetching marketing data:', marketingError);
        throw marketingError;
      }

      // Récupérer les données de profit pour le mois
      const { data: profitData, error: profitError } = await supabase
        .from('profit_tracking')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', startOfMonth.toISOString().split('T')[0])
        .lte('date', endOfMonth.toISOString().split('T')[0]);

      if (profitError) {
        console.error('Error fetching profit data:', profitError);
        throw profitError;
      }

      // Récupérer les bonus mensuels
      const { data: bonusData, error: bonusError } = await supabase
        .from('monthly_bonus')
        .select('*')
        .eq('user_id', user.id)
        .eq('year', startOfMonth.getFullYear())
        .eq('month', startOfMonth.getMonth() + 1);

      if (bonusError) {
        console.error('Error fetching bonus data:', bonusError);
        throw bonusError;
      }

      // Calculer les KPIs
      const totalSpend = marketingData?.reduce((sum, item) => sum + (item.spend_usd * 10.5), 0) || 0;
      const totalLeads = marketingData?.reduce((sum, item) => sum + item.leads, 0) || 0;
      const totalRevenue = profitData?.reduce((sum, item) => sum + item.commission_total, 0) || 0;
      const totalDeliveries = profitData?.reduce((sum, item) => sum + item.quantity, 0) || 0;
      const totalBonus = bonusData?.reduce((sum, item) => sum + item.amount_dh, 0) || 0;
      
      const avgCplMad = totalLeads > 0 ? totalSpend / totalLeads : 0;
      const avgCpdMad = totalDeliveries > 0 ? totalSpend / totalDeliveries : 0;
      const netProfit = totalRevenue + totalBonus - totalSpend;
      const roiPercent = totalSpend > 0 ? (netProfit / totalSpend) * 100 : 0;

      return {
        period: month,
        total_revenue: totalRevenue,
        total_spend: totalSpend,
        total_leads: totalLeads,
        total_deliveries: totalDeliveries,
        total_bonus: totalBonus,
        avg_cpl_mad: avgCplMad,
        avg_cpd_mad: avgCpdMad,
        roi_percent: roiPercent,
        net_profit: netProfit,
      };
    },
    enabled: !!user && !!month,
  });
}
