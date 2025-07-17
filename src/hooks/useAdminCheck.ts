
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export function useAdminCheck() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['admin-check', user?.id],
    queryFn: async () => {
      if (!user) {
        console.log('useAdminCheck: No user found');
        return false;
      }

      console.log('useAdminCheck: Checking admin status for user:', user.id);

      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();

      if (error) {
        console.log('useAdminCheck: Error checking admin status:', error);
        return false;
      }

      const isAdmin = !!data;
      console.log('useAdminCheck: Admin check result:', isAdmin);
      return isAdmin;
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (remplace cacheTime)
  });
}
