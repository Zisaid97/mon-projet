
import { useMonthlyMarketingTotals } from "./useMarketingTotals";
import { useExchangeRate } from "./useExchangeRate";
import { useMonthlyBonus } from "./useMonthlyBonus";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "./useAuth";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfMonth, endOfMonth } from "date-fns";

export function useDashboardStats() {
  const { user } = useAuth();
  const { data: marketingTotals, isLoading: isLoadingMarketing } = useMonthlyMarketingTotals();
  const { data: exchangeRate = 10, isLoading: isLoadingExchangeRate } = useExchangeRate();
  const { bonus } = useMonthlyBonus();

  // CORRECTION : Récupérer tous les calculs depuis marketing_performance avec logique corrigée
  const { data: dashboardData, isLoading: isLoadingDashboard } = useQuery({
    queryKey: ['dashboard_stats', user?.id, exchangeRate, bonus],
    queryFn: async () => {
      if (!user) return {
        totalLeads: 0,
        totalDeliveries: 0,
        deliveryRate: 0,
        totalAdSpendUsd: 0,
        totalAdSpendDh: 0,
        totalRevenueUsd: 0,
        totalRevenueDh: 0,
        netProfitUsd: 0,
        netProfitDh: 0
      };

      const now = new Date();
      const startDate = format(startOfMonth(now), 'yyyy-MM-dd');
      const endDate = format(endOfMonth(now), 'yyyy-MM-dd');

      // Récupérer toutes les données marketing du mois courant
      const { data: marketingData, error } = await supabase
        .from('marketing_performance')
        .select('spend_usd, leads, deliveries, margin_per_order')
        .eq('user_id', user.id)
        .gte('date', startDate)
        .lte('date', endDate);

      if (error) throw error;

      // Calculer tous les totaux avec la logique corrigée
      const totalLeads = marketingData?.reduce((sum, item) => sum + item.leads, 0) || 0;
      const totalDeliveries = marketingData?.reduce((sum, item) => sum + item.deliveries, 0) || 0;
      const deliveryRate = totalLeads > 0 ? (totalDeliveries / totalLeads) * 100 : 0;
      
      const totalAdSpendUsd = marketingData?.reduce((sum, item) => sum + item.spend_usd, 0) || 0;
      const totalAdSpendDh = totalAdSpendUsd * exchangeRate;

      // CORRECTION : Calcul du revenu total avec marges en DH
      const totalRevenueDh = marketingData?.reduce((sum, item) => {
        const marginDh = item.margin_per_order * exchangeRate; // Convertir USD vers DH
        return sum + (item.deliveries * marginDh);
      }, 0) || 0;
      const totalRevenueUsd = totalRevenueDh / exchangeRate;

      // CORRECTION : Le bénéfice net = revenu - dépenses + bonus (cohérent en DH)
      const netProfitDh = totalRevenueDh - totalAdSpendDh + bonus;
      const netProfitUsd = netProfitDh / exchangeRate;

      console.log('[Debug] 📊 Calculs dashboard RECONSTRUCTION complète avec bonus:', {
        marketingDataCount: marketingData?.length || 0,
        totalLeads,
        totalDeliveries,
        deliveryRate: deliveryRate.toFixed(2) + '%',
        totalAdSpendUsd: totalAdSpendUsd.toFixed(2),
        totalAdSpendDh: totalAdSpendDh.toFixed(0),
        totalRevenueUsd: totalRevenueUsd.toFixed(2),
        totalRevenueDh: totalRevenueDh.toFixed(0),
        bonus: bonus.toFixed(0),
        netProfitUsd: netProfitUsd.toFixed(2),
        netProfitDh: netProfitDh.toFixed(0),
        exchangeRate
      });

      return {
        totalLeads,
        totalDeliveries,
        deliveryRate,
        totalAdSpendUsd,
        totalAdSpendDh,
        totalRevenueUsd,
        totalRevenueDh,
        netProfitUsd,
        netProfitDh
      };
    },
    enabled: !!user && !isLoadingExchangeRate,
  });

  const isLoading = isLoadingMarketing || isLoadingExchangeRate || isLoadingDashboard;

  return {
    totalLeads: dashboardData?.totalLeads || 0,
    totalDeliveries: dashboardData?.totalDeliveries || 0,
    deliveryRate: dashboardData?.deliveryRate || 0,
    totalAdSpendUsd: dashboardData?.totalAdSpendUsd || 0,
    totalAdSpendDh: dashboardData?.totalAdSpendDh || 0,
    totalRevenueUsd: dashboardData?.totalRevenueUsd || 0,
    totalRevenueDh: dashboardData?.totalRevenueDh || 0,
    netProfitUsd: dashboardData?.netProfitUsd || 0,
    netProfitDh: dashboardData?.netProfitDh || 0,
    bonus,
    exchangeRate,
    isLoading,
  };
}
