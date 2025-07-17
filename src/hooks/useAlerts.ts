
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface Alert {
  id: string;
  date: string;
  type: string;
  kpi: string;
  value: number;
  threshold: number;
  is_read: boolean;
  created_at: string;
}

export function useAlerts() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['alerts', user?.id],
    queryFn: async (): Promise<Alert[]> => {
      if (!user) return [];

      // Temporarily return mock data until alerts table is available in types
      // In production, this would query the alerts table directly
      return [];
    },
    enabled: !!user,
  });
}

export function useMarkAlertAsRead() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (alertId: string) => {
      // Temporarily disabled until alerts table is available in types
      console.log('Mark alert as read:', alertId);
      return Promise.resolve();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts', user?.id] });
    },
  });
}
