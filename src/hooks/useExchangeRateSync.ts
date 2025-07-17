
import { useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useMonthlyAverageRate } from "./useMonthlyAverageRate";
import { format } from "date-fns";

export function useExchangeRateSync(selectedDate?: Date) {
  const { user } = useAuth();
  const { data: monthlyAverageRate } = useMonthlyAverageRate(selectedDate);
  const queryClient = useQueryClient();

  // Hook principal qui utilise le taux moyen mensuel pour les conversions
  const { data: exchangeRate = 10.0 } = useQuery({
    queryKey: ["exchange_rate_sync", user?.id, selectedDate ? format(selectedDate, "yyyy-MM-dd") : null],
    queryFn: async () => {
      if (!user?.id) return 10.0;

      const targetDate = selectedDate ? format(selectedDate, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd");

      // D'abord, chercher le taux spécifique pour cette date
      const { data: exactData, error: exactError } = await supabase
        .from("financial_tracking")
        .select("exchange_rate")
        .eq("user_id", user.id)
        .eq("date", targetDate)
        .maybeSingle();

      if (exactError && exactError.code !== 'PGRST116') {
        console.error("Erreur lors de la récupération du taux exact:", exactError);
      }

      if (exactData) {
        return Number(exactData.exchange_rate);
      }

      // Si pas de taux pour cette date, utiliser le taux moyen mensuel
      if (monthlyAverageRate && monthlyAverageRate !== 10.0) {
        return monthlyAverageRate;
      }

      // En dernier recours, récupérer le dernier taux disponible
      const { data: latestData, error: latestError } = await supabase
        .from("financial_tracking")
        .select("exchange_rate")
        .eq("user_id", user.id)
        .lte("date", targetDate)
        .order("date", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (latestError && latestError.code !== 'PGRST116') {
        console.error("Erreur lors de la récupération du dernier taux:", latestError);
      }

      return latestData ? Number(latestData.exchange_rate) : 10.0;
    },
    enabled: !!user,
  });

  const syncAllRates = useCallback(() => {
    // Invalider tous les caches liés aux taux de change
    queryClient.invalidateQueries({ queryKey: ["exchange_rate"] });
    queryClient.invalidateQueries({ queryKey: ["exchange_rate_sync"] });
    queryClient.invalidateQueries({ queryKey: ["monthly_average_rate"] });
    queryClient.invalidateQueries({ queryKey: ["monthly_rate_details"] });
    
    // Invalider aussi les données marketing qui dépendent du taux
    queryClient.invalidateQueries({ queryKey: ["marketing_performance"] });
    queryClient.invalidateQueries({ queryKey: ["profit_tracking"] });
  }, [queryClient]);

  return {
    exchangeRate,
    monthlyAverageRate,
    syncAllRates,
    isUsingMonthlyAverage: monthlyAverageRate && monthlyAverageRate !== 10.0,
  };
}
