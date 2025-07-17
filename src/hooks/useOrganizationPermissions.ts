
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentOrganization } from "./useCurrentOrganization";

/**
 * Hook pour récupérer les permissions détaillées des membres (lecture seule)
 */
export function useOrganizationPermissions() {
  const { currentOrg } = useCurrentOrganization();

  const { data, isLoading } = useQuery({
    queryKey: ["organization-permissions", currentOrg?.id],
    queryFn: async () => {
      if (!currentOrg) return {};
      const { data, error } = await supabase
        .from("permissions")
        .select("*")
        .eq("organization_id", currentOrg.id);

      if (error) throw error;

      // Structure: permissionsByUserId[userId] = {module: {can_read, can_write, can_delete}}
      const permissionsByUserId: Record<string, Record<string, any>> = {};
      (data || []).forEach((perm) => {
        if (!permissionsByUserId[perm.user_id]) permissionsByUserId[perm.user_id] = {};
        permissionsByUserId[perm.user_id][perm.module] = {
          can_read: perm.can_read,
          can_write: perm.can_write,
          can_delete: perm.can_delete,
        };
      });
      return permissionsByUserId;
    },
    enabled: !!currentOrg,
  });

  return { permissionsByUserId: data || {}, isLoading };
}
