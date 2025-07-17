import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "./use-toast";

export interface NotificationSettings {
  id?: string;
  user_id: string;
  enable_notifications: boolean;
  channels: string[];
  types: string[];
  email_summary_frequency: string;
  email_signature?: string | null;
}

export function useNotificationSettings() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ["notification-settings", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("notification_settings")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      if (error && error.code !== "PGRST116") throw error;
      return data;
    },
    enabled: !!user,
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (newSettings: Partial<NotificationSettings>) => {
      if (!user) throw new Error("User not authenticated");
      const settingsData = {
        user_id: user.id,
        ...newSettings,
      };
      const { data, error } = await supabase
        .from("notification_settings")
        .upsert(settingsData, { onConflict: "user_id" })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notification-settings"] });
      toast({
        title: "Préférences sauvegardées",
        description: "Vos réglages de notifications ont été mis à jour.",
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les préférences.",
        variant: "destructive",
      });
    },
  });

  return {
    settings,
    isLoading,
    updateSettings: updateSettingsMutation.mutate,
  };
}
