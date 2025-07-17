
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "./useAuth";
import { supabase } from "@/integrations/supabase/client";
import { startOfMonth, endOfMonth, format, eachDayOfInterval } from "date-fns";

export function useNetProfitEvolution() {
  const { user } = useAuth();
  const now = new Date();
  const startDate = startOfMonth(now);
  const endDate = endOfMonth(now);

  const queryKey = ['net_profit_evolution', user?.id, format(startDate, 'yyyy-MM-dd'), format(endDate, 'yyyy-MM-dd')];

  return useQuery({
    queryKey: queryKey,
    queryFn: async () => {
      if (!user) return null;

      const startDateString = format(startDate, 'yyyy-MM-dd');
      const endDateString = format(endDate, 'yyyy-MM-dd');

      // 1. Fetch profit data (revenue)
      const { data: profitData, error: profitError } = await supabase
        .from('profit_tracking')
        .select('date, commission_total')
        .eq('user_id', user.id)
        .gte('date', startDateString)
        .lte('date', endDateString);

      if (profitError) throw profitError;

      // 2. Fetch marketing spend data
      const { data: marketingData, error: marketingError } = await supabase
        .from('marketing_performance')
        .select('date, spend_usd')
        .eq('user_id', user.id)
        .gte('date', startDateString)
        .lte('date', endDateString);
      
      if (marketingError) throw marketingError;

      // 3. Fetch exchange rates
      const { data: exchangeRateData, error: exchangeRateError } = await supabase
        .from('financial_tracking')
        .select('date, exchange_rate')
        .eq('user_id', user.id)
        .gte('date', startDateString)
        .lte('date', endDateString)
        .order('date', { ascending: true });

      if (exchangeRateError) throw exchangeRateError;
      
      const exchangeRateMap = new Map<string, number>();
      let lastRate = 10.0;
      
      const { data: latestPreviousRate } = await supabase
          .from("financial_tracking")
          .select("exchange_rate")
          .eq("user_id", user.id)
          .lte("date", startDateString)
          .order("date", { ascending: false })
          .limit(1)
          .maybeSingle();
          
      if (latestPreviousRate) {
          lastRate = Number(latestPreviousRate.exchange_rate);
      }
      
      const interval = eachDayOfInterval({ start: startDate, end: endDate });

      for(const day of interval) {
          const dateString = format(day, 'yyyy-MM-dd');
          const rateForDay = exchangeRateData.find(r => r.date === dateString);
          if (rateForDay) {
              lastRate = Number(rateForDay.exchange_rate);
          }
          exchangeRateMap.set(dateString, lastRate);
      }

      const dailyMetrics = new Map<string, { revenue: number, spend: number }>();

      profitData.forEach(row => {
          const day = row.date;
          const current = dailyMetrics.get(day) || { revenue: 0, spend: 0 };
          current.revenue += row.commission_total || 0;
          dailyMetrics.set(day, current);
      });

      marketingData.forEach(row => {
          const day = row.date;
          const current = dailyMetrics.get(day) || { revenue: 0, spend: 0 };
          current.spend += row.spend_usd || 0;
          dailyMetrics.set(day, current);
      });

      const evolutionData = interval.map(day => {
        const dateString = format(day, 'yyyy-MM-dd');
        const metrics = dailyMetrics.get(dateString) || { revenue: 0, spend: 0 };
        const exchangeRate = exchangeRateMap.get(dateString) || lastRate;
        const spendDh = metrics.spend * exchangeRate;
        const netProfit = metrics.revenue - spendDh;
        
        return {
          date: format(day, 'dd/MM'),
          "Profit Net (DH)": netProfit.toFixed(2),
        };
      });

      return evolutionData;
    },
    enabled: !!user,
  });
}
