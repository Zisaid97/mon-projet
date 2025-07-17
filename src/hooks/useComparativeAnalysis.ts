
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface ComparativeKPIs {
  revenue_mad: number;
  spend_mad: number;
  profit_mad: number;
  roi_percent: number;
  cpl_mad: number;
  cpd_mad: number;
  leads: number;
  deliveries: number;
}

interface ComparativeAnalysisData {
  periodA: ComparativeKPIs;
  periodB: ComparativeKPIs;
  variations: {
    revenue: number;
    spend: number;
    profit: number;
    roi: number;
    cpl: number;
    cpd: number;
  };
}

export function useComparativeAnalysis(
  periodA: { start: Date; end: Date },
  periodB: { start: Date; end: Date },
  filters?: { product?: string; channel?: string; country?: string }
) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['comparative-analysis', user?.id, periodA, periodB, filters],
    queryFn: async (): Promise<ComparativeAnalysisData> => {
      if (!user) throw new Error('User not authenticated');

      const formatDate = (date: Date) => date.toISOString().split('T')[0];

      // Fonction pour récupérer les données d'une période
      const fetchPeriodData = async (start: Date, end: Date) => {
        // Récupérer données marketing
        const { data: marketingData, error: marketingError } = await supabase
          .from('marketing_performance')
          .select('*')
          .eq('user_id', user.id)
          .gte('date', formatDate(start))
          .lte('date', formatDate(end));

        if (marketingError) throw marketingError;

        // Récupérer données de profits
        const { data: profitData, error: profitError } = await supabase
          .from('profit_tracking')
          .select('*')
          .eq('user_id', user.id)
          .gte('date', formatDate(start))
          .lte('date', formatDate(end));

        if (profitError) throw profitError;

        return { marketingData: marketingData || [], profitData: profitData || [] };
      };

      // Récupérer les données pour les deux périodes
      const [dataA, dataB] = await Promise.all([
        fetchPeriodData(periodA.start, periodA.end),
        fetchPeriodData(periodB.start, periodB.end)
      ]);

      // Calculate KPIs for each period
      const calculateKPIs = (marketingData: any[], profitData: any[]): ComparativeKPIs => {
        const marketingTotals = marketingData.reduce((acc, item) => ({
          spend_usd: acc.spend_usd + (item.spend_usd || 0),
          leads: acc.leads + (item.leads || 0),
          deliveries: acc.deliveries + (item.deliveries || 0),
          margin_per_order: acc.margin_per_order + (item.margin_per_order || 0),
        }), {
          spend_usd: 0,
          leads: 0,
          deliveries: 0,
          margin_per_order: 0,
        });

        const profitTotals = profitData.reduce((acc, item) => ({
          commission_total: acc.commission_total + (item.commission_total || 0),
          quantity: acc.quantity + (item.quantity || 0),
        }), {
          commission_total: 0,
          quantity: 0,
        });

        // Conversion USD to MAD (approximation avec taux de 10.5)
        const spend_mad = marketingTotals.spend_usd * 10.5;
        const revenue_mad = marketingTotals.deliveries * (marketingTotals.margin_per_order / Math.max(marketingData.length, 1));
        const profit_mad = revenue_mad - spend_mad + profitTotals.commission_total;

        return {
          revenue_mad,
          spend_mad,
          profit_mad,
          roi_percent: spend_mad > 0 ? (profit_mad / spend_mad) * 100 : 0,
          cpl_mad: marketingTotals.leads > 0 ? spend_mad / marketingTotals.leads : 0,
          cpd_mad: marketingTotals.deliveries > 0 ? spend_mad / marketingTotals.deliveries : 0,
          leads: marketingTotals.leads,
          deliveries: marketingTotals.deliveries,
        };
      };

      const kpisA = calculateKPIs(dataA.marketingData, dataA.profitData);
      const kpisB = calculateKPIs(dataB.marketingData, dataB.profitData);

      // Calculate variations
      const calculateVariation = (a: number, b: number) => {
        if (b === 0) return a > 0 ? 100 : 0;
        return ((a - b) / b) * 100;
      };

      const variations = {
        revenue: calculateVariation(kpisA.revenue_mad, kpisB.revenue_mad),
        spend: calculateVariation(kpisA.spend_mad, kpisB.spend_mad),
        profit: calculateVariation(kpisA.profit_mad, kpisB.profit_mad),
        roi: calculateVariation(kpisA.roi_percent, kpisB.roi_percent),
        cpl: calculateVariation(kpisA.cpl_mad, kpisB.cpl_mad),
        cpd: calculateVariation(kpisA.cpd_mad, kpisB.cpd_mad),
      };

      return {
        periodA: kpisA,
        periodB: kpisB,
        variations,
      };
    },
    enabled: !!user,
  });
}
