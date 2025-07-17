
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useExchangeRateSync } from "./useExchangeRateSync";
import { useMonthlyBonus } from "./useMonthlyBonus";
import { format, startOfMonth, endOfMonth } from "date-fns";

interface DashboardStats {
  totalRevenueUsd: number;
  totalRevenueDh: number;
  totalAdSpendUsd: number;
  totalAdSpendDh: number;
  netProfitUsd: number;
  netProfitDh: number;
  totalLeads: number;
  totalDeliveries: number;
  deliveryRate: number;
  avgCPL: number;
  avgCPD: number;
  roi: number;
  exchangeRate: number;
  bonus: number;
  productDeliveries: { [productName: string]: number };
}

export function useProfitsDashboardStats(selectedDate?: Date) {
  const { user } = useAuth();
  const targetDate = selectedDate || new Date();
  const { exchangeRate } = useExchangeRateSync(targetDate);
  const { bonus } = useMonthlyBonus(targetDate);

  return useQuery<DashboardStats>({
    queryKey: ['profits_dashboard_stats', user?.id, format(targetDate, 'yyyy-MM'), exchangeRate, bonus],
    queryFn: async () => {
      if (!user) {
        return {
          totalRevenueUsd: 0,
          totalRevenueDh: 0,
          totalAdSpendUsd: 0,
          totalAdSpendDh: 0,
          netProfitUsd: 0,
          netProfitDh: 0,
          totalLeads: 0,
          totalDeliveries: 0,
          deliveryRate: 0,
          avgCPL: 0,
          avgCPD: 0,
          roi: 0,
          exchangeRate,
          bonus: 0,
          productDeliveries: {}
        };
      }

      const startDate = format(startOfMonth(targetDate), 'yyyy-MM-dd');
      const endDate = format(endOfMonth(targetDate), 'yyyy-MM-dd');

      // 1. Récupérer les données marketing pour les dépenses et métriques
      const { data: marketingData, error: marketingError } = await supabase
        .from('marketing_performance')
        .select('spend_usd, leads, deliveries, margin_per_order')
        .eq('user_id', user.id)
        .gte('date', startDate)
        .lte('date', endDate);

      if (marketingError) throw marketingError;

      // 2. Récupérer les données de profits pour les livraisons par produit (source principale)
      const { data: profitData, error: profitError } = await supabase
        .from('profit_tracking')
        .select('product_name, quantity, commission_total, cpd_category')
        .eq('user_id', user.id)
        .gte('date', startDate)
        .lte('date', endDate);

      if (profitError) throw profitError;

      // 3. Calculs basés sur les données marketing (pour cohérence avec ancienne logique)
      const totalLeads = marketingData?.reduce((sum, item) => sum + item.leads, 0) || 0;
      const totalDeliveriesMarketing = marketingData?.reduce((sum, item) => sum + item.deliveries, 0) || 0;
      const totalAdSpendUsd = marketingData?.reduce((sum, item) => sum + item.spend_usd, 0) || 0;

      // 4. Calculs basés sur les données de profit (source de vérité pour les livraisons)
      const totalDeliveriesProfit = profitData?.reduce((sum, item) => sum + item.quantity, 0) || 0;
      const totalRevenueDh = profitData?.reduce((sum, item) => sum + item.commission_total, 0) || 0;

      // 5. Livraisons par produit depuis profit_tracking
      const productDeliveries: { [productName: string]: number } = {};
      profitData?.forEach(item => {
        if (productDeliveries[item.product_name]) {
          productDeliveries[item.product_name] += item.quantity;
        } else {
          productDeliveries[item.product_name] = item.quantity;
        }
      });

      // 6. Utiliser les livraisons de profit_tracking comme source de vérité
      const totalDeliveries = totalDeliveriesProfit;
      const deliveryRate = totalLeads > 0 ? (totalDeliveries / totalLeads) * 100 : 0;

      // 7. Conversions et calculs finaux
      const totalAdSpendDh = totalAdSpendUsd * exchangeRate;
      const totalRevenueUsd = totalRevenueDh / exchangeRate;
      const netProfitDh = totalRevenueDh - totalAdSpendDh + bonus;
      const netProfitUsd = netProfitDh / exchangeRate;

      // 8. Métriques de performance
      const avgCPL = totalLeads > 0 ? totalAdSpendUsd / totalLeads : 0;
      const avgCPD = totalDeliveries > 0 ? totalAdSpendUsd / totalDeliveries : 0;
      const roi = totalAdSpendDh > 0 ? (netProfitDh / totalAdSpendDh) * 100 : 0;

      console.log('[Dashboard Stats] 📊 Données consolidées:', {
        targetMonth: format(targetDate, 'yyyy-MM'),
        source: 'profit_tracking + marketing_performance',
        totalLeads,
        totalDeliveries: totalDeliveries,
        totalDeliveriesMarketing: totalDeliveriesMarketing,
        totalDeliveriesProfit: totalDeliveriesProfit,
        deliveryRate: deliveryRate.toFixed(2) + '%',
        totalRevenueDh: totalRevenueDh.toFixed(0),
        totalAdSpendDh: totalAdSpendDh.toFixed(0),
        netProfitDh: netProfitDh.toFixed(0),
        productDeliveries,
        roi: roi.toFixed(2) + '%'
      });

      return {
        totalRevenueUsd,
        totalRevenueDh,
        totalAdSpendUsd,
        totalAdSpendDh,
        netProfitUsd,
        netProfitDh,
        totalLeads,
        totalDeliveries,
        deliveryRate,
        avgCPL,
        avgCPD,
        roi,
        exchangeRate,
        bonus,
        productDeliveries
      };
    },
    enabled: !!user,
  });
}
