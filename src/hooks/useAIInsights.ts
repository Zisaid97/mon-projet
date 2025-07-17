
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface AIInsight {
  id: string;
  content: string;
  insights_type: string;
  generated_at: string;
  expires_at: string;
  created_at: string;
}

export interface AIAlert {
  id: string;
  type: string;
  title: string;
  content: string;
  severity: string;
  is_read: boolean;
  data: any;
  created_at: string;
}

export function useAIInsights() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['ai-insights', user?.id],
    queryFn: async (): Promise<AIInsight[]> => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('insights_cache')
        .select('*')
        .eq('user_id', user.id)
        .gte('expires_at', new Date().toISOString())
        .order('generated_at', { ascending: false });

      if (error) {
        console.error('Error fetching AI insights:', error);
        throw error;
      }

      return data || [];
    },
    enabled: !!user,
  });
}

export function useGenerateAIInsights() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (params?: { month?: number; year?: number }) => {
      const { data, error } = await supabase.functions.invoke('ai-generate-insights', {
        body: { 
          month: params?.month,
          year: params?.year
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-insights', user?.id] });
    },
  });
}

export function useAIAlerts() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['ai-alerts', user?.id],
    queryFn: async (): Promise<AIAlert[]> => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('alerts_ai')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching AI alerts:', error);
        throw error;
      }

      return data || [];
    },
    enabled: !!user,
  });
}

export function useMarkAlertAsRead() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (alertId: string) => {
      const { error } = await supabase
        .from('alerts_ai')
        .update({ is_read: true })
        .eq('id', alertId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-alerts', user?.id] });
    },
  });
}
