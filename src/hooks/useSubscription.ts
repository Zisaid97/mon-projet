
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export function useSubscription() {
  const { user } = useAuth();

  const { data: subscription, isLoading } = useQuery({
    queryKey: ['subscription', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('subscribers')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data;
    },
    enabled: !!user,
  });

  return {
    subscription,
    isLoading,
  };
}
