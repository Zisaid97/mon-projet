import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useState } from "react";

export function useCurrentOrganization() {
  const { user } = useAuth();
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Liste des organisations dont l'utilisateur est membre
  const { data: organizationsRaw, isLoading } = useQuery({
    queryKey: ["organizations", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      // Récupérer les organisations dont l'utilisateur est membre
      const { data, error } = await supabase
        .from("organization_members")
        .select(`
          organization_id,
          role,
          organizations:organization_id(
            id,
            name,
            logo_url,
            description,
            owner_id
          )
        `)
        .eq("user_id", user.id)
        .eq("deactivated", false);

      if (error) throw error;

      // Transformer les données pour avoir un format plus simple
      return data?.map((row: any) => ({
        id: row.organizations.id,
        name: row.organizations.name,
        logo_url: row.organizations.logo_url,
        description: row.organizations.description,
        owner_id: row.organizations.owner_id,
        user_role: row.role, // Inclure le rôle de l'utilisateur dans l'organisation
      })) || [];
    },
    enabled: !!user,
  });

  // Make sure organizations is always an array
  const organizations = Array.isArray(organizationsRaw) ? organizationsRaw : [];

  // Organisation courante (en mémoire)
  // On priorise l'organisation sélectionnée, puis celle où l'user est owner, puis admin, et enfin la première de la liste.
  const currentOrg =
    organizations.find((org) => org.id === selectedOrgId) ||
    organizations.find((org) => org.user_role === 'owner') ||
    organizations.find((org) => org.user_role === 'admin') ||
    organizations[0] ||
    null;

  // Changer d'organisation (utile si le user appartient à plusieurs)
  const selectOrganization = (orgId: string) => {
    setSelectedOrgId(orgId);
  };

  // Création d'organisation
  const createOrganization = useMutation({
    mutationFn: async ({ name, description }: { name: string; description?: string }) => {
      if (!user) throw new Error("Non connecté");
      
      // 1. Créer l'organisation
      const { data: org, error: orgError } = await supabase
        .from("organizations")
        .insert({ 
          name, 
          description,
          owner_id: user.id 
        })
        .select("*")
        .single();

      if (orgError) throw orgError;

      // 2. Ajouter l'utilisateur comme propriétaire
      const { error: membershipError } = await supabase
        .from("organization_members")
        .insert({
          organization_id: org.id,
          user_id: user.id,
          role: "owner",
        });

      if (membershipError) throw membershipError;

      return org;
    },
    onSuccess: () => {
      // Rechargement de la liste des organisations
      queryClient.invalidateQueries({ queryKey: ["organizations", user?.id] });
    },
  });

  // Vérifier si l'utilisateur est admin/owner de l'organisation courante
  const isAdmin = currentOrg?.user_role === 'admin' || currentOrg?.user_role === 'owner';

  return {
    organizations,
    isLoading,
    currentOrg,
    selectOrganization,
    createOrganization,
    isAdmin,
  };
}
