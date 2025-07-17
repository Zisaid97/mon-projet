import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, startOfMonth, endOfMonth, parse } from 'date-fns';
import { useMonthStore } from '@/stores/monthStore';

interface DeliverySummaryItem {
  productName: string;
  quantity: number;
  percentage: number;
}

interface DeliverySummary {
  total: number;
  items: DeliverySummaryItem[];
}

async function getMonthlyDeliveriesByProduct(month: string, isArchiveMode: boolean = false): Promise<DeliverySummary> {
  // Parse selected month to get date range
  const monthStart = startOfMonth(parse(month + '-01', 'yyyy-MM-dd', new Date()));
  const monthEnd = endOfMonth(monthStart);
  
  const startDate = format(monthStart, 'yyyy-MM-dd');
  const endDate = format(monthEnd, 'yyyy-MM-dd');

  // Choose table based on archive mode
  const tableName = isArchiveMode ? 'archive_profit_tracking' : 'profit_tracking';

  const { data, error } = await supabase
    .from(tableName)
    .select('product_name, quantity')
    .gte('date', startDate)
    .lte('date', endDate);

  if (error) throw error;

  // Aggregate data by product
  const productMap = new Map<string, number>();
  
  data.forEach(({ product_name, quantity }) => {
    const current = productMap.get(product_name) || 0;
    productMap.set(product_name, current + quantity);
  });

  const total = Array.from(productMap.values()).reduce((sum, qty) => sum + qty, 0);
  
  const items: DeliverySummaryItem[] = Array.from(productMap.entries())
    .map(([productName, quantity]) => ({
      productName,
      quantity,
      percentage: total > 0 ? (quantity / total) * 100 : 0
    }))
    .sort((a, b) => b.quantity - a.quantity); // Sort by quantity descending

  return { total, items };
}

export const useDeliveriesSummary = (month: string) => {
  const { archiveMode } = useMonthStore();
  
  return useQuery({
    queryKey: ['deliveriesSummary', month, archiveMode],
    queryFn: () => getMonthlyDeliveriesByProduct(month, archiveMode),
    enabled: !!month
  });
};