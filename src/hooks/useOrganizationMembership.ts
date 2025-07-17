
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useCurrentOrganization } from "./useCurrentOrganization";
import { useActivityLog } from "./useActivityLog";
import { Database } from "@/integrations/supabase/types";

type UserRole = Database["public"]["Enums"]["user_role"];

export function useOrganizationMembership() {
  const { user } = useAuth();
  const { currentOrg } = useCurrentOrganization();
  const queryClient = useQueryClient();
  const { addActivity } = useActivityLog();

  // Récupérer les membres de l'organisation courante
  const { data: members, isLoading } = useQuery({
    queryKey: ["organization-members", currentOrg?.id],
    queryFn: async () => {
      if (!currentOrg) return [];

      const { data, error } = await supabase.rpc("get_organization_members", {
        org_id: currentOrg.id,
      });

      if (error) throw error;
      return data || [];
    },
    enabled: !!currentOrg,
  });

  // Inviter un nouvel utilisateur
  const inviteUser = useMutation({
    mutationFn: async ({ email, role }: { email: string; role: UserRole }) => {
      if (!currentOrg || !user) throw new Error("Organisation ou utilisateur manquant");

      const token = crypto.randomUUID();

      const { data, error } = await supabase
        .from("organization_invitations")
        .insert({
          organization_id: currentOrg.id,
          email,
          role,
          invited_by: user.id,
          token,
        })
        .select("*")
        .single();

      if (error) throw error;

      // Log Activity
      addActivity.mutate({
        action: "invite_user",
        entity_type: "member",
        entity_id: data.id,
        user_id: user.id,
        new_values: { email, role },
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organization-members", currentOrg?.id] });
    },
  });

  // Changer le rôle d'un membre
  const updateMemberRole = useMutation({
    mutationFn: async ({ memberId, newRole }: { memberId: string; newRole: UserRole }) => {
      const { data, error } = await supabase
        .from("organization_members")
        .update({ role: newRole })
        .eq("id", memberId)
        .select("*")
        .single();

      if (error) throw error;

      // Log Activity
      if (user && data)
        addActivity.mutate({
          action: "update_role",
          entity_type: "member",
          entity_id: data.id,
          user_id: user.id,
          new_values: { role: newRole },
        });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organization-members", currentOrg?.id] });
      queryClient.invalidateQueries({ queryKey: ["permissions"] });
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
    },
  });

  // Désactiver un membre
  const removeMember = useMutation({
    mutationFn: async (memberId: string) => {
      const { data, error } = await supabase
        .from("organization_members")
        .update({ deactivated: true })
        .eq("id", memberId)
        .select("*")
        .single();

      if (error) throw error;

      // Log Activity
      if (user && data)
        addActivity.mutate({
          action: "deactivate_member",
          entity_type: "member",
          entity_id: data.id,
          user_id: user.id,
          old_values: { deactivated: false },
          new_values: { deactivated: true },
        });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organization-members", currentOrg?.id] });
    },
  });

  return {
    members: members || [],
    isLoading,
    inviteUser,
    updateMemberRole,
    removeMember,
  };
}
