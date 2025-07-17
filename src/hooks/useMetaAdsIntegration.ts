
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface MetaSpendData {
  id: string;
  campaign_id: string;
  campaign_name: string;
  date: string;
  spend_usd: number;
  spend_mad: number;
  impressions: number;
  clicks: number;
  leads: number;
  exchange_rate: number;
  synced_at: string;
}

export function useMetaSpendData(startDate?: Date, endDate?: Date) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['meta-spend-data', user?.id, startDate, endDate],
    queryFn: async (): Promise<MetaSpendData[]> => {
      if (!user) return [];

      let query = supabase
        .from('meta_spend_daily')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (startDate) {
        query = query.gte('date', startDate.toISOString().split('T')[0]);
      }
      if (endDate) {
        query = query.lte('date', endDate.toISOString().split('T')[0]);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching Meta spend data:', error);
        throw error;
      }

      return data || [];
    },
    enabled: !!user,
  });
}

export function useMetaAdsConnection() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (config: { clientId: string; clientSecret: string; redirectUri: string }) => {
      const { data, error } = await supabase
        .from('meta_ads_config')
        .upsert({
          user_id: user?.id,
          client_id: config.clientId,
          client_secret: config.clientSecret,
          redirect_uri: config.redirectUri,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meta-ads-config'] });
    },
  });
}
