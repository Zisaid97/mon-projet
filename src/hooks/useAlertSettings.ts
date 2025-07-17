
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "./use-toast";

export interface AlertSettings {
  id?: string;
  user_id: string;
  send_email: boolean;
  alert_daily_spend_threshold: number;
  alert_days_without_delivery: number;
  roi_min_percent: number;
  delivery_rate_min_percent: number;
  cpd_threshold_usd: number;
  cpl_threshold_usd: number;
  alert_scope: string;
}

export function useAlertSettings() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["alert-settings", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("alert_settings")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      if (error && error.code !== "PGRST116") throw error;
      return data as AlertSettings | null;
    },
    enabled: !!user,
  });
}

export function useUpdateAlertSettings() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newSettings: Partial<AlertSettings>) => {
      if (!user) throw new Error("User not authenticated");
      const settingsData = {
        user_id: user.id,
        ...newSettings,
      };
      const { data, error } = await supabase
        .from("alert_settings")
        .upsert(settingsData, { onConflict: "user_id" })
        .select()
        .single();
      if (error) throw error;
      return data as AlertSettings;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alert-settings"] });
      toast({
        title: "Paramètres sauvegardés",
        description: "Vos paramètres d'alerte ont été mis à jour.",
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les paramètres.",
        variant: "destructive",
      });
    },
  });
}
