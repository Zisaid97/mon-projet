
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { format } from "date-fns";

export function useMonthlyAverageRate(selectedDate?: Date) {
  const { user } = useAuth();
  const targetDate = selectedDate || new Date();
  const year = targetDate.getFullYear();
  const month = targetDate.getMonth() + 1;

  return useQuery({
    queryKey: ["monthly_average_rate", user?.id, year, month],
    queryFn: async () => {
      if (!user?.id) return 10.0; // Taux par défaut

      // Calculer dynamiquement à partir de financial_tracking si pas de données pré-calculées
      const { data: existingData, error: existingError } = await supabase
        .from("monthly_average_exchange_rates")
        .select("average_rate, entries_count, total_usd, total_mad")
        .eq("user_id", user.id)
        .eq("year", year)
        .eq("month", month)
        .maybeSingle();

      if (existingData && !existingError) {
        return Number(existingData.average_rate);
      }

      // Si pas de données pré-calculées, calculer en temps réel
      const { data: financialData, error } = await supabase
        .from("financial_tracking")
        .select("amount_received_mad, amount_received_usd")
        .eq("user_id", user.id)
        .gte("date", `${year}-${month.toString().padStart(2, '0')}-01`)
        .lt("date", `${year}-${(month + 1).toString().padStart(2, '0')}-01`)
        .gt("amount_received_usd", 0);

      if (error) {
        console.error("Erreur lors de la récupération des données financières:", error);
        return 10.0;
      }

      if (!financialData || financialData.length === 0) {
        return 10.0;
      }

      const totalUsd = financialData.reduce((sum, item) => sum + item.amount_received_usd, 0);
      const totalMad = financialData.reduce((sum, item) => sum + item.amount_received_mad, 0);
      
      return totalUsd > 0 ? totalMad / totalUsd : 10.0;
    },
    enabled: !!user,
  });
}

export function useMonthlyRateDetails(selectedDate?: Date) {
  const { user } = useAuth();
  const targetDate = selectedDate || new Date();
  const year = targetDate.getFullYear();
  const month = targetDate.getMonth() + 1;

  return useQuery({
    queryKey: ["monthly_rate_details", user?.id, year, month],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from("monthly_average_exchange_rates")
        .select("*")
        .eq("user_id", user.id)
        .eq("year", year)
        .eq("month", month)
        .maybeSingle();

      if (error) {
        console.error("Erreur lors de la récupération des détails:", error);
        return null;
      }

      return data;
    },
    enabled: !!user,
  });
}
