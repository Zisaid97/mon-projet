
import { useState, useEffect, useMemo } from 'react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface AutomaticMarketingData {
  spendUSD: number;
  leads: number;
  deliveries: number;
  isLoading: boolean;
  lastSyncAt?: Date;
}

export function useAutomaticMarketingData(date: Date | undefined) {
  const { user } = useAuth();
  const [data, setData] = useState<AutomaticMarketingData>({
    spendUSD: 0,
    leads: 0,
    deliveries: 0,
    isLoading: false
  });

  const dateString = useMemo(() => {
    return date ? format(date, 'yyyy-MM-dd') : null;
  }, [date]);

  const fetchAutomaticData = async () => {
    if (!user || !dateString) {
      console.log('[Debug] Pas d\'utilisateur ou de date:', { user: !!user, dateString });
      setData(prev => ({ ...prev, spendUSD: 0, leads: 0, deliveries: 0, isLoading: false }));
      return;
    }

    console.log('[Debug] 🚀 DÉBUT RÉCUPÉRATION AUTO pour:', dateString, 'User:', user.id);
    setData(prev => ({ ...prev, isLoading: true }));

    try {
      // 1. Récupération des dépenses Meta Ads
      console.log('[Debug] 📊 Requête Meta Ads...');
      const { data: metaAdsData, error: metaError } = await supabase
        .from('ad_spending_data')
        .select('amount_spent')
        .eq('user_id', user.id)
        .eq('date', dateString);

      if (metaError) {
        console.error('[Debug] ❌ Erreur Meta Ads:', metaError);
      } else {
        console.log('[Debug] ✅ Meta Ads récupéré:', { 
          count: metaAdsData?.length || 0,
          data: metaAdsData 
        });
      }

      const totalSpendUSD = metaAdsData?.reduce((sum, item) => sum + (item.amount_spent || 0), 0) || 0;
      console.log('[Debug] 💰 Total dépenses USD:', totalSpendUSD);

      // 2. Récupération des données de ventes
      console.log('[Debug] 🛒 Requête Ventes...');
      const { data: salesData, error: salesError } = await supabase
        .from('sales_data')
        .select('id, delivery_status')
        .eq('user_id', user.id)
        .eq('date', dateString);

      if (salesError) {
        console.error('[Debug] ❌ Erreur Ventes:', salesError);
      } else {
        console.log('[Debug] ✅ Ventes récupérées:', { 
          count: salesData?.length || 0,
          data: salesData 
        });
      }

      const totalLeads = salesData?.length || 0;
      
      // Amélioration de la détection des livraisons
      const totalDeliveries = salesData?.filter(sale => {
        const status = (sale.delivery_status || '').toLowerCase().trim();
        const isDelivered = status.includes('livré') || 
                           status.includes('delivered') ||
                           status.includes('livraison') ||
                           status.includes('confirmé') ||
                           status.includes('confirmed') ||
                           status === 'ok' ||
                           status === 'oui';
        console.log('[Debug] 📦 Status:', status, '-> Livré:', isDelivered);
        return isDelivered;
      }).length || 0;

      console.log('[Debug] 📈 TOTAUX CALCULÉS:', {
        spendUSD: totalSpendUSD,
        leads: totalLeads,
        deliveries: totalDeliveries
      });

      // Mise à jour forcée des données
      const newData = {
        spendUSD: totalSpendUSD,
        leads: totalLeads,
        deliveries: totalDeliveries,
        isLoading: false,
        lastSyncAt: new Date()
      };

      console.log('[Debug] 🔄 MISE À JOUR STATE:', newData);
      setData(newData);

    } catch (error) {
      console.error('[Debug] ❌ ERREUR GLOBALE:', error);
      setData(prev => ({ 
        ...prev, 
        isLoading: false,
        spendUSD: 0,
        leads: 0,
        deliveries: 0
      }));
    }
  };

  // Effect principal - déclenché uniquement quand nécessaire
  useEffect(() => {
    console.log('[Debug] 🎯 EFFECT DÉCLENCHÉ:', { 
      dateString, 
      hasUser: !!user?.id,
      shouldFetch: !!(dateString && user?.id)
    });
    
    if (dateString && user?.id) {
      // Délai court pour éviter les appels multiples
      const timeoutId = setTimeout(() => {
        fetchAutomaticData();
      }, 100);
      
      return () => clearTimeout(timeoutId);
    } else {
      // Reset si pas de conditions
      setData(prev => ({ 
        ...prev, 
        spendUSD: 0, 
        leads: 0, 
        deliveries: 0,
        isLoading: false 
      }));
    }
  }, [dateString, user?.id]);

  return {
    ...data,
    refetch: fetchAutomaticData
  };
}
