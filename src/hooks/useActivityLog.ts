
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentOrganization } from "./useCurrentOrganization";

/**
 * Hook pour consigner les actions clé dans la table activity_log
 */
export function useActivityLog() {
  const { currentOrg } = useCurrentOrganization();
  const queryClient = useQueryClient();

  // Ajout d'une activité
  const addActivity = useMutation({
    mutationFn: async ({
      action,
      entity_type,
      entity_id,
      user_id,
      old_values,
      new_values
    }: {
      action: string;
      entity_type: string;
      entity_id?: string | null;
      user_id: string;
      old_values?: any;
      new_values?: any;
    }) => {
      if (!currentOrg) throw new Error("Organisation non définie");
      const { error } = await supabase.from("activity_log").insert({
        action,
        entity_type,
        entity_id,
        user_id,
        organization_id: currentOrg.id,
        old_values,
        new_values
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activity-log", currentOrg?.id] });
    },
  });

  // Récupération historique activité de l'orga courante
  const { data: log, isLoading } = useQuery({
    queryKey: ["activity-log", currentOrg?.id],
    queryFn: async () => {
      if (!currentOrg) return [];
      const { data, error } = await supabase
        .from("activity_log")
        .select("*")
        .eq("organization_id", currentOrg.id)
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data;
    },
    enabled: !!currentOrg,
  });

  return { addActivity, log, isLoading };
}
