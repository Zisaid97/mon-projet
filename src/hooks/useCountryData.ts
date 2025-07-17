
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface CountryData {
  id: string;
  country_code: string;
  country_name: string;
  city?: string;
  revenue_mad: number;
  spend_mad: number;
  profit_mad: number;
  roi_percent: number;
  delivery_rate: number;
  cpl_mad: number;
  cpd_mad: number;
  period_start: string;
  period_end: string;
}

export function useCountryData(selectedCountries?: string[]) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['country-data', user?.id, selectedCountries],
    queryFn: async (): Promise<CountryData[]> => {
      console.log('useCountryData - Fetching data for user:', user?.id);
      console.log('useCountryData - selectedCountries:', selectedCountries);
      
      if (!user) {
        console.log('useCountryData - No user, returning empty array');
        return [];
      }

      let query = supabase
        .from('country_data')
        .select('*')
        .eq('user_id', user.id)
        .order('roi_percent', { ascending: false });

      if (selectedCountries && selectedCountries.length > 0) {
        query = query.in('country_code', selectedCountries);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching country data:', error);
        throw error;
      }

      console.log('useCountryData - Fetched data:', data);
      return data || [];
    },
    enabled: !!user,
  });
}

export function useUpdateCountryData() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async () => {
      console.log('useUpdateCountryData - Calling update_country_data RPC');
      const { error } = await supabase.rpc('update_country_data');
      if (error) {
        console.error('Error calling update_country_data:', error);
        throw error;
      }
      return true;
    },
    onSuccess: () => {
      console.log('useUpdateCountryData - Success, invalidating queries');
      queryClient.invalidateQueries({ queryKey: ['country-data', user?.id] });
    },
    onError: (error) => {
      console.error('useUpdateCountryData - Error:', error);
    }
  });
}
