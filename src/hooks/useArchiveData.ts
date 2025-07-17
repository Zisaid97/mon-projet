
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { format } from "date-fns";

interface ArchiveDataParams {
  selectedMonth: string;
}

export function useArchiveData(selectedMonth: string) {
  const { user } = useAuth();
  
  // Calculer les dates de début et fin du mois
  const startDate = `${selectedMonth}-01`;
  const year = parseInt(selectedMonth.split('-')[0]);
  const month = parseInt(selectedMonth.split('-')[1]);
  const endDate = new Date(year, month, 0).toISOString().slice(0, 10);

  // Données Marketing (courantes + archivées)
  const { data: marketingData = [], isLoading: isLoadingMarketing } = useQuery({
    queryKey: ["archive_marketing", user?.id, selectedMonth],
    queryFn: async () => {
      if (!user) return [];
      
      // Récupérer les données courantes
      const { data: currentData, error: currentError } = await supabase
        .from("marketing_performance")
        .select("*")
        .eq("user_id", user.id)
        .gte("date", startDate)
        .lte("date", endDate)
        .order("date", { ascending: true });
      
      if (currentError) throw new Error(currentError.message);
      
      // Récupérer les données archivées
      const { data: archivedData, error: archivedError } = await supabase
        .from("archive_marketing_performance")
        .select("*")
        .eq("user_id", user.id)
        .gte("date", startDate)
        .lte("date", endDate)
        .order("date", { ascending: true });
      
      if (archivedError) throw new Error(archivedError.message);
      
      // Combiner les données
      return [...(currentData || []), ...(archivedData || [])];
    },
    enabled: !!user,
  });

  // Données Finances (courantes + archivées)
  const { data: financialData = [], isLoading: isLoadingFinancial } = useQuery({
    queryKey: ["archive_financial", user?.id, selectedMonth],
    queryFn: async () => {
      if (!user) return [];
      
      const { data: currentData, error: currentError } = await supabase
        .from("financial_tracking")
        .select("*")
        .eq("user_id", user.id)
        .gte("date", startDate)
        .lte("date", endDate)
        .order("date", { ascending: true });
      
      if (currentError) throw new Error(currentError.message);
      
      const { data: archivedData, error: archivedError } = await supabase
        .from("archive_financial_tracking")
        .select("*")
        .eq("user_id", user.id)
        .gte("date", startDate)
        .lte("date", endDate)
        .order("date", { ascending: true });
      
      if (archivedError) throw new Error(archivedError.message);
      
      return [...(currentData || []), ...(archivedData || [])];
    },
    enabled: !!user,
  });

  // Données Profits (courantes + archivées)
  const { data: profitData = [], isLoading: isLoadingProfit } = useQuery({
    queryKey: ["archive_profit", user?.id, selectedMonth],
    queryFn: async () => {
      if (!user) return [];
      
      const { data: currentData, error: currentError } = await supabase
        .from("profit_tracking")
        .select("*")
        .eq("user_id", user.id)
        .gte("date", startDate)
        .lte("date", endDate)
        .order("date", { ascending: true });
      
      if (currentError) throw new Error(currentError.message);
      
      const { data: archivedData, error: archivedError } = await supabase
        .from("archive_profit_tracking")
        .select("*")
        .eq("user_id", user.id)
        .gte("date", startDate)
        .lte("date", endDate)
        .order("date", { ascending: true });
      
      if (archivedError) throw new Error(archivedError.message);
      
      return [...(currentData || []), ...(archivedData || [])];
    },
    enabled: !!user,
  });

  // Données Ad Spending (courantes + archivées)
  const { data: adSpendingData = [], isLoading: isLoadingAdSpending } = useQuery({
    queryKey: ["archive_ad_spending", user?.id, selectedMonth],
    queryFn: async () => {
      if (!user) return [];
      
      const { data: currentData, error: currentError } = await supabase
        .from("ad_spending_data")
        .select("*")
        .eq("user_id", user.id)
        .gte("date", startDate)
        .lte("date", endDate)
        .order("date", { ascending: true });
      
      if (currentError) throw new Error(currentError.message);
      
      const { data: archivedData, error: archivedError } = await supabase
        .from("archive_ad_spending_data")
        .select("*")
        .eq("user_id", user.id)
        .gte("date", startDate)
        .lte("date", endDate)
        .order("date", { ascending: true });
      
      if (archivedError) throw new Error(archivedError.message);
      
      return [...(currentData || []), ...(archivedData || [])];
    },
    enabled: !!user,
  });

  // Données Sales (courantes + archivées)
  const { data: salesData = [], isLoading: isLoadingSales } = useQuery({
    queryKey: ["archive_sales", user?.id, selectedMonth],
    queryFn: async () => {
      if (!user) return [];
      
      const { data: currentData, error: currentError } = await supabase
        .from("sales_data")
        .select("*")
        .eq("user_id", user.id)
        .gte("date", startDate)
        .lte("date", endDate)
        .order("date", { ascending: true });
      
      if (currentError) throw new Error(currentError.message);
      
      const { data: archivedData, error: archivedError } = await supabase
        .from("archive_sales_data")
        .select("*")
        .eq("user_id", user.id)
        .gte("date", startDate)
        .lte("date", endDate)
        .order("date", { ascending: true });
      
      if (archivedError) throw new Error(archivedError.message);
      
      return [...(currentData || []), ...(archivedData || [])];
    },
    enabled: !!user,
  });

  return {
    marketingData,
    financialData,
    profitData,
    adSpendingData,
    salesData,
    isLoading: isLoadingMarketing || isLoadingFinancial || isLoadingProfit || isLoadingAdSpending || isLoadingSales,
  };
}
