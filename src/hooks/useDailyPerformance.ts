
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface DailyPerformance {
  id: string;
  date: string;
  cpd_usd: number;
  roi_percent: number;
  delivery_rate: number;
  score: number;
  performance_label: 'Excellente' | 'Attention' | 'Critique';
}

export function useDailyPerformance(startDate?: Date, endDate?: Date) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['daily-performance', user?.id, startDate, endDate],
    queryFn: async (): Promise<DailyPerformance[]> => {
      if (!user) return [];

      const targetDate = startDate || new Date();
      const dateStr = targetDate.toISOString().split('T')[0];

      // Calculate daily performance from existing data until daily_performance table is available
      const { data: marketingData, error: marketingError } = await supabase
        .from('marketing_performance')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', dateStr);

      if (marketingError) {
        console.error('Error fetching marketing data:', marketingError);
        throw marketingError;
      }

      const { data: profitData, error: profitError } = await supabase
        .from('profit_tracking')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', dateStr);

      if (profitError) {
        console.error('Error fetching profit data:', profitError);
        throw profitError;
      }

      if (!marketingData?.length) return [];

      // Calculate KPIs
      const totalSpend = marketingData.reduce((sum, item) => sum + item.spend_usd, 0);
      const totalLeads = marketingData.reduce((sum, item) => sum + item.leads, 0);
      const totalDeliveries = marketingData.reduce((sum, item) => sum + item.deliveries, 0);
      const totalRevenue = profitData?.reduce((sum, item) => sum + item.commission_total, 0) || 0;

      const cpd_usd = totalDeliveries > 0 ? totalSpend / totalDeliveries : 0;
      const roi_percent = totalSpend > 0 ? ((totalRevenue - totalSpend * 10.5) / (totalSpend * 10.5)) * 100 : 0;
      const delivery_rate = totalLeads > 0 ? (totalDeliveries / totalLeads) * 100 : 0;

      // Calculate score
      let greenCount = 0;
      let redCount = 0;

      if (cpd_usd < 10) greenCount++;
      else if (cpd_usd > 15) redCount++;

      if (roi_percent >= 30) greenCount++;
      else if (roi_percent < 15) redCount++;

      if (delivery_rate >= 15) greenCount++;
      else if (delivery_rate < 10) redCount++;

      let score = 0;
      let performance_label: 'Excellente' | 'Attention' | 'Critique' = 'Attention';

      if (greenCount >= 2) {
        score = 1;
        performance_label = 'Excellente';
      } else if (redCount >= 2) {
        score = -1;
        performance_label = 'Critique';
      }

      return [{
        id: 'daily-' + dateStr,
        date: dateStr,
        cpd_usd,
        roi_percent,
        delivery_rate,
        score,
        performance_label
      }];
    },
    enabled: !!user,
  });
}

export function getPerformanceColor(label: string): string {
  switch (label) {
    case 'Excellente':
      return 'text-green-600 bg-green-50';
    case 'Critique':
      return 'text-red-600 bg-red-50';
    default:
      return 'text-orange-600 bg-orange-50';
  }
}

export function getKpiColor(kpi: string, value: number): string {
  switch (kpi) {
    case 'cpd':
      if (value < 10) return 'text-green-600';
      if (value <= 15) return 'text-orange-600';
      return 'text-red-600';
    case 'roi':
      if (value >= 30) return 'text-green-600';
      if (value >= 15) return 'text-orange-600';
      return 'text-red-600';
    case 'delivery_rate':
      if (value >= 15) return 'text-green-600';
      if (value >= 10) return 'text-orange-600';
      return 'text-red-600';
    default:
      return 'text-gray-600';
  }
}
