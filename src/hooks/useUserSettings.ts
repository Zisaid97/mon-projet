
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "./use-toast";

export interface UserSettings {
  id?: string;
  user_id: string;
  theme: string;
  language: string;
  currency: string;
  show_dual_amounts: boolean;
  show_margin_percentages: boolean;
  round_numbers: boolean;
  decimal_places: number;
}

export function useUserSettings() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ['user-settings', user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data;
    },
    enabled: !!user,
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (newSettings: Partial<UserSettings>) => {
      if (!user) throw new Error('User not authenticated');

      const settingsData = {
        user_id: user.id,
        ...newSettings,
      };

      const { data, error } = await supabase
        .from('user_settings')
        .upsert(settingsData, { onConflict: 'user_id' })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-settings'] });
      toast({
        title: "Paramètres sauvegardés",
        description: "Vos préférences ont été mises à jour avec succès.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les paramètres.",
        variant: "destructive",
      });
      console.error('Error updating settings:', error);
    },
  });

  const resetSettingsMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('User not authenticated');

      const defaultSettings = {
        user_id: user.id,
        theme: 'system',
        language: 'fr',
        currency: 'MAD',
        show_dual_amounts: false,
        show_margin_percentages: true,
        round_numbers: true,
        decimal_places: 2,
      };

      const { data, error } = await supabase
        .from('user_settings')
        .upsert(defaultSettings, { onConflict: 'user_id' })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-settings'] });
      toast({
        title: "Paramètres réinitialisés",
        description: "Vos préférences ont été remises aux valeurs par défaut.",
      });
    },
  });

  return {
    settings,
    isLoading,
    updateSettings: updateSettingsMutation.mutate,
    resetSettings: resetSettingsMutation.mutate,
    isUpdating: updateSettingsMutation.isPending,
  };
}
