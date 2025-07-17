
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface MetaAttribution {
  id: string;
  user_id: string;
  date: string;  // Changed from 'month' to 'date' for daily granularity
  product: string;
  country: string;
  spend_usd: number;
  spend_dh: number;
  created_at: string;
  updated_at: string;
}

export interface SyncStatus {
  status: 'success' | 'error' | 'pending' | null;
  lastSyncAt: string | null;
}

export const useMetaAttributions = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const getAttributions = useCallback(async (startDate: string, endDate: string, userId?: string): Promise<MetaAttribution[]> => {
    try {
      setLoading(true);
      clearError();

      const targetUserId = userId || user?.id;
      if (!targetUserId) {
        throw new Error('User ID not available');
      }

      console.log(`🔍 Récupération des attributions Meta pour: ${startDate} → ${endDate}, User: ${targetUserId}`);

      const { data, error } = await supabase
        .from('attributions_meta')
        .select('*')
        .eq('user_id', targetUserId)
        .gte('date', startDate)  // Using 'date' field for daily filtering
        .lte('date', endDate)
        .order('date', { ascending: false });

      if (error) {
        console.error('❌ Erreur Supabase lors de la récupération des attributions:', error);
        throw error;
      }

      console.log(`📊 Attributions récupérées: ${data?.length || 0} entrées`);
      return data as MetaAttribution[] || [];

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      console.error('❌ Erreur dans getAttributions:', errorMessage);
      setError(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  }, [user?.id, clearError]);

  const processMetaData = useCallback(async (metaAdsData: any[], targetDate?: string): Promise<boolean> => {
    if (!user?.id) {
      throw new Error('User not authenticated');
    }

    try {
      setLoading(true);
      clearError();

      console.log(`🚀 Traitement des données Meta Ads: ${metaAdsData.length} entrées`);

      // Group data by date, product, and country
      const attributionsByDate = new Map<string, Map<string, Map<string, { spend_usd: number; spend_dh: number }>>>();

      metaAdsData.forEach(row => {
        const date = row.date || targetDate;
        if (!date) return;

        const { product, country } = extractProductAndCountry(row.campaign_name || '');
        if (!product || !country) return;

        if (!attributionsByDate.has(date)) {
          attributionsByDate.set(date, new Map());
        }

        const dateMap = attributionsByDate.get(date)!;
        if (!dateMap.has(product)) {
          dateMap.set(product, new Map());
        }

        const productMap = dateMap.get(product)!;
        const existing = productMap.get(country) || { spend_usd: 0, spend_dh: 0 };

        productMap.set(country, {
          spend_usd: existing.spend_usd + (row.amount_spent || 0),
          spend_dh: existing.spend_dh + (row.amount_spent || 0) * 10.5 // Exchange rate approximation
        });
      });

      // Convert to insert format
      const attributionsToInsert: any[] = [];

      attributionsByDate.forEach((productMap, date) => {
        productMap.forEach((countryMap, product) => {
          countryMap.forEach((amounts, country) => {
            attributionsToInsert.push({
              user_id: user.id,
              date: date,
              product: product,
              country: country,
              spend_usd: amounts.spend_usd,
              spend_dh: amounts.spend_dh,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
          });
        });
      });

      if (attributionsToInsert.length > 0) {
        // Use upsert to avoid duplicates
        const { error } = await supabase
          .from('attributions_meta')
          .upsert(attributionsToInsert, {
            onConflict: 'user_id,date,product,country'
          });

        if (error) throw error;

        console.log(`✅ ${attributionsToInsert.length} attributions Meta générées avec succès`);

        toast({
          title: "Attributions générées",
          description: `${attributionsToInsert.length} attributions créées automatiquement`,
        });

        // Trigger refresh event
        window.dispatchEvent(new CustomEvent('meta-attributions-updated'));
        return true;
      }

      return false;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      console.error('❌ Erreur lors du traitement des données Meta:', errorMessage);
      setError(errorMessage);
      
      toast({
        title: "Erreur de traitement",
        description: errorMessage,
        variant: "destructive",
      });

      return false;
    } finally {
      setLoading(false);
    }
  }, [user?.id, toast, clearError]);

  const getSyncStatus = useCallback(async (): Promise<SyncStatus> => {
    // This would typically check the last sync timestamp from your sync logs
    // For now, return a basic status
    return {
      status: 'success',
      lastSyncAt: new Date().toISOString()
    };
  }, []);

  return {
    loading,
    error,
    getAttributions,
    processMetaData,
    getSyncStatus,
    clearError
  };
};

// Helper function to extract product and country from campaign name
function extractProductAndCountry(campaignName: string): { product: string; country: string } {
  const productPatterns = [
    { pattern: /viramax/i, product: 'VIRAMAX' },
    { pattern: /gluco/i, product: 'GLUCO CONTROL' },
    { pattern: /stud/i, product: 'STUD 5000' },
    { pattern: /shilamax/i, product: 'SHILAMAX' },
    { pattern: /alprostadil/i, product: 'ALPROSTADIL' }
  ];
  
  const countryPatterns = [
    { pattern: /\b(ma|maroc|morocco)\b/i, country: 'MAL' },
    { pattern: /\b(rdc|congo|drc)\b/i, country: 'RDC' },
    { pattern: /\b(cm|cameroun|cameroon)\b/i, country: 'CM' },
    { pattern: /\b(gn|guinee|guinea)\b/i, country: 'GN' },
    { pattern: /\b(bj|benin)\b/i, country: 'BJ' },
    { pattern: /\b(bf|burkina)\b/i, country: 'BFA' }
  ];
  
  let product = '';
  let country = '';
  
  for (const p of productPatterns) {
    if (p.pattern.test(campaignName)) {
      product = p.product;
      break;
    }
  }
  
  for (const c of countryPatterns) {
    if (c.pattern.test(campaignName)) {
      country = c.country;
      break;
    }
  }
  
  return { product, country };
}
