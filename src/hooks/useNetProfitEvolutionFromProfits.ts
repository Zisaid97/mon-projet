
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useExchangeRateSync } from "./useExchangeRateSync";
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";

interface NetProfitDataPoint {
  date: string;
  'Profit Net (DH)': number;
}

export function useNetProfitEvolutionFromProfits(selectedDate?: Date) {
  const { user } = useAuth();
  const targetDate = selectedDate || new Date();
  const { exchangeRate } = useExchangeRateSync(targetDate);

  return useQuery<NetProfitDataPoint[]>({
    queryKey: ['net_profit_evolution_profits', user?.id, format(targetDate, 'yyyy-MM'), exchangeRate],
    queryFn: async () => {
      if (!user) return [];

      const startDate = startOfMonth(targetDate);
      const endDate = endOfMonth(targetDate);
      const dateRange = eachDayOfInterval({ start: startDate, end: endDate });

      // Récupérer les données de profit_tracking par jour
      const { data: profitData, error: profitError } = await supabase
        .from('profit_tracking')
        .select('date, commission_total')
        .eq('user_id', user.id)
        .gte('date', format(startDate, 'yyyy-MM-dd'))
        .lte('date', format(endDate, 'yyyy-MM-dd'))
        .order('date', { ascending: true });

      if (profitError) throw profitError;

      // Récupérer les données marketing par jour
      const { data: marketingData, error: marketingError } = await supabase
        .from('marketing_performance')
        .select('date, spend_usd')
        .eq('user_id', user.id)
        .gte('date', format(startDate, 'yyyy-MM-dd'))
        .lte('date', format(endDate, 'yyyy-MM-dd'))
        .order('date', { ascending: true });

      if (marketingError) throw marketingError;

      // Créer un objet pour les données par date
      const dataByDate: Record<string, NetProfitDataPoint> = {};

      // Initialiser toutes les dates avec 0
      dateRange.forEach(date => {
        const dateStr = format(date, 'yyyy-MM-dd');
        dataByDate[dateStr] = {
          date: format(date, 'dd/MM'),
          'Profit Net (DH)': 0
        };
      });

      // Consolider les revenus par jour depuis profit_tracking
      const revenueByDate: Record<string, number> = {};
      profitData?.forEach(item => {
        const dateStr = item.date;
        if (revenueByDate[dateStr]) {
          revenueByDate[dateStr] += item.commission_total;
        } else {
          revenueByDate[dateStr] = item.commission_total;
        }
      });

      // Consolider les dépenses par jour depuis marketing_performance
      const spendByDate: Record<string, number> = {};
      marketingData?.forEach(item => {
        const dateStr = item.date;
        const spendDh = item.spend_usd * exchangeRate;
        if (spendByDate[dateStr]) {
          spendByDate[dateStr] += spendDh;
        } else {
          spendByDate[dateStr] = spendDh;
        }
      });

      // Calculer le profit net par jour
      Object.keys(dataByDate).forEach(dateStr => {
        const displayDate = format(new Date(dateStr), 'dd/MM');
        const revenueDh = revenueByDate[dateStr] || 0;
        const spendDh = spendByDate[dateStr] || 0;
        const netProfitDh = revenueDh - spendDh;

        dataByDate[dateStr] = {
          date: displayDate,
          'Profit Net (DH)': netProfitDh
        };
      });

      // Convertir en tableau et filtrer les données nulles pour un graphique plus propre
      const result = Object.values(dataByDate).filter(item => 
        item['Profit Net (DH)'] !== 0 || format(new Date(), 'yyyy-MM-dd') >= format(new Date(targetDate.getFullYear(), targetDate.getMonth(), parseInt(item.date.split('/')[0])), 'yyyy-MM-dd')
      );

      console.log('[Net Profit Evolution] 📈 Données du graphique (corrigées):', {
        month: format(targetDate, 'yyyy-MM'),
        pointsCount: result.length,
        totalProfit: result.reduce((sum, item) => sum + item['Profit Net (DH)'], 0).toFixed(0) + ' DH',
        source: 'profit_tracking + marketing_performance'
      });

      return result;
    },
    enabled: !!user,
  });
}
