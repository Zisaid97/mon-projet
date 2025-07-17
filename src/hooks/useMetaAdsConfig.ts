
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "./use-toast";

interface MetaAdsConfig {
  id: string;
  user_id: string;
  client_id: string;
  client_secret: string;
  redirect_uri: string;
  created_at: string;
  updated_at: string;
}

export function useMetaAdsConfig() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Récupérer la configuration existante
  const { data: config, isLoading } = useQuery({
    queryKey: ['meta-ads-config', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('meta_ads_config')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data as MetaAdsConfig | null;
    },
    enabled: !!user,
  });

  // Sauvegarder la configuration
  const saveConfigMutation = useMutation({
    mutationFn: async (configData: { clientId: string; clientSecret: string; redirectUri: string }) => {
      if (!user) throw new Error('User not authenticated');

      // Use the edge function for secure saving
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error("Session non valide, veuillez vous reconnecter");
      }

      const response = await fetch(
        `https://uqqajzfkqushviwuayng.supabase.co/functions/v1/save-meta-config`,
        {
          method: "POST",
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            clientId: configData.clientId,
            clientSecret: configData.clientSecret,
            redirectUri: configData.redirectUri
          })
        }
      );

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Erreur lors de la sauvegarde');
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meta-ads-config'] });
      toast({
        title: "Configuration sauvegardée",
        description: "Les paramètres Meta Ads ont été enregistrés avec succès",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur de sauvegarde",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Supprimer la configuration
  const deleteConfigMutation = useMutation({
    mutationFn: async () => {
      if (!config) throw new Error('Aucune configuration à supprimer');

      const { error } = await supabase
        .from('meta_ads_config')
        .delete()
        .eq('id', config.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meta-ads-config'] });
      toast({
        title: "Configuration supprimée",
        description: "La configuration Meta Ads a été supprimée avec succès",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la configuration",
        variant: "destructive",
      });
    },
  });

  return {
    config,
    isLoading,
    saveConfig: saveConfigMutation.mutate,
    isSaving: saveConfigMutation.isPending,
    deleteConfig: deleteConfigMutation.mutate,
    isDeleting: deleteConfigMutation.isPending,
  };
}
