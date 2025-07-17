
import { useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { FinancialRow, FinancialRowInput } from "@/types/financial";
import { useAuth } from "./useAuth";

function getMonthStart(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

// Liste des entrées pour le mois courant
export function useFinancialRows() {
  const { user } = useAuth();
  const now = new Date();
  const start = getMonthStart(now).toISOString().slice(0,10);
  const end = new Date(now.getFullYear(), now.getMonth()+1, 0)
    .toISOString().slice(0,10);

  return useQuery<FinancialRow[]>({
    queryKey: ["financial_tracking", user?.id, start, end],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("financial_tracking")
        .select("*")
        .eq("user_id", user.id)
        .gte("date", start)
        .lte("date", end)
        .order("date", { ascending: true });
      if (error) throw new Error(error.message);
      return data as FinancialRow[];
    },
    enabled: !!user,
  });
}

// Charger une ligne existante pour une date donnée
export function useFinancialRowForDate(date: string) {
  const { user } = useAuth();
  return useQuery<FinancialRow | null>({
    queryKey: ["financial_tracking", user?.id, date],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("financial_tracking")
        .select("*")
        .eq("user_id", user.id)
        .eq("date", date)
        .maybeSingle();
      if (error) throw new Error(error.message);
      return data || null;
    },
    enabled: !!user && !!date,
  });
}

// Ajout ou édition d'une ligne pour la date (upsert)
export function useUpsertFinancialRow() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (row: FinancialRowInput & { user_id: string }) => {
      const amount_received_mad = row.amount_received_usd * row.exchange_rate;
      const { error, data } = await supabase
        .from("financial_tracking")
        .upsert({ ...row, amount_received_mad }, { onConflict: "user_id,date" })
        .select()
        .maybeSingle();
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["financial_tracking"] });
    },
  });
}

// Suppression 
export function useDeleteFinancialRow() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ user_id, date }: { user_id: string, date: string }) => {
      const { error } = await supabase
        .from("financial_tracking")
        .delete()
        .eq("user_id", user_id)
        .eq("date", date);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["financial_tracking"] });
    },
  });
}
