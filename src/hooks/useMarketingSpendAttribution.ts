
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useExchangeRateSync } from '@/hooks/useExchangeRateSync';
import { GroupedSpending } from '@/utils/countryMap';

export interface MarketingSpendAttribution {
  id: string;
  user_id: string;
  date: string;
  country: string;
  product: string;
  spend_usd: number;
  spend_dh: number;
  source: string;
  created_at: string;
  updated_at: string;
}

export const useMarketingSpendAttribution = () => {
  const [loading, setLoading] = useState(false);
  const [unrecognizedCount, setUnrecognizedCount] = useState(0);
  const [totalUnrecognizedSpend, setTotalUnrecognizedSpend] = useState(0);
  const { user } = useAuth();
  const { toast } = useToast();
  const { monthlyAverageRate } = useExchangeRateSync();

  const processAutoAttribution = useCallback(async (groupedSpending: GroupedSpending[]) => {
    const activeRate = monthlyAverageRate || 10.0;
    if (!user?.id || !activeRate) {
      console.error('User or exchange rate not available');
      return;
    }

    setLoading(true);
    
    try {
      // ✅ CORRECTION: Compter les campagnes non reconnues
      const unrecognized = groupedSpending.filter(item => item.isUnrecognized);
      const unrecognizedSpendTotal = unrecognized.reduce((sum, item) => sum + item.spend_usd, 0);
      
      setUnrecognizedCount(unrecognized.length);
      setTotalUnrecognizedSpend(unrecognizedSpendTotal);

      console.log(`📊 Attribution: ${groupedSpending.length} total, ${unrecognized.length} non reconnues (${unrecognizedSpendTotal.toFixed(2)}$)`);

      const attributions = groupedSpending.map(item => ({
        user_id: user.id,
        date: item.date,
        country: item.country,
        product: item.product,
        spend_usd: item.spend_usd,
        spend_dh: item.spend_usd * activeRate,
        source: 'Meta Ads'
      }));

      // Upsert avec gestion des conflits
      const { data, error } = await supabase
        .from('marketing_spend_attrib')
        .upsert(attributions, {
          onConflict: 'user_id,date,country,product,source'
        })
        .select();

      if (error) throw error;

      // Compter les produits et pays uniques
      const uniqueProducts = new Set(groupedSpending.map(g => g.product));
      const uniqueCountries = new Set(groupedSpending.map(g => g.country));

      // Message d'alerte si campagnes non reconnues
      if (unrecognized.length > 0) {
        toast({
          title: "⚠️ Attribution avec alertes",
          description: `${unrecognized.length} campagnes nécessitent une vérification manuelle (${unrecognizedSpendTotal.toFixed(2)}$ concerné)`,
          variant: "default",
        });
      } else {
        toast({
          title: "✅ Attribution automatique terminée",
          description: `Dépenses attribuées à ${uniqueProducts.size} produits dans ${uniqueCountries.size} pays.`,
        });
      }

      // Déclencher un événement pour rafraîchir l'affichage
      window.dispatchEvent(new CustomEvent('attributions-updated'));

      return data;
    } catch (error) {
      console.error('Erreur lors de l\'attribution automatique:', error);
      toast({
        title: "Erreur d'attribution",
        description: "Impossible d'attribuer les dépenses automatiquement",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [user?.id, monthlyAverageRate, toast]);

  const getAttributions = useCallback(async (startDate: string, endDate: string) => {
    if (!user?.id) return [];

    try {
      const { data, error } = await supabase
        .from('marketing_spend_attrib')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: false });

      if (error) {
        console.error('Erreur lors du chargement des attributions:', error);
        return [];
      }

      return data as MarketingSpendAttribution[];
    } catch (error) {
      console.error('Erreur lors du chargement des attributions:', error);
      return [];
    }
  }, [user?.id]);

  return {
    loading,
    unrecognizedCount,
    totalUnrecognizedSpend,
    processAutoAttribution,
    getAttributions
  };
};
