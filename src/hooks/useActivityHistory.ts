
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentOrganization } from "./useCurrentOrganization";

/**
 * Hook pour lire l'historique des activités d'une organisation (lecture seule)
 */
export function useActivityHistory() {
  const { currentOrg } = useCurrentOrganization();

  const { data, isLoading } = useQuery({
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

  return { activityLog: data || [], isLoading };
}
