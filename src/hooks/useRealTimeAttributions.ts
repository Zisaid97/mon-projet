import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface AttributionUpdate {
  type: 'delivery_update' | 'attribution_update';
  productCountry: {
    product: string;
    country: string;
  };
  timestamp: number;
}

export const useRealTimeAttributions = () => {
  const [lastUpdate, setLastUpdate] = useState<AttributionUpdate | null>(null);
  const { user } = useAuth();

  const triggerUpdate = useCallback((update: AttributionUpdate) => {
    setLastUpdate(update);
    // Déclencher un événement global pour les autres composants
    window.dispatchEvent(new CustomEvent('attribution-realtime-update', { 
      detail: update 
    }));
  }, []);

  useEffect(() => {
    if (!user?.id) return;

    let deliveriesChannel: any = null;
    let attributionsChannel: any = null;

    try {
      // Créer un canal unique avec un ID basé sur l'utilisateur et timestamp
      const channelId = `realtime_${user.id}_${Date.now()}`;
      
      // Écouter les changements sur les livraisons
      deliveriesChannel = supabase
        .channel(`deliveries_${channelId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'product_country_deliveries',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            console.log('📦 Mise à jour livraisons en temps réel:', payload);
            
            const record = payload.new as any || payload.old as any;
            if (record && record.product && record.country) {
              triggerUpdate({
                type: 'delivery_update',
                productCountry: {
                  product: record.product,
                  country: record.country
                },
                timestamp: Date.now()
              });
            }
          }
        )
        .subscribe();

      // Écouter les changements sur les attributions marketing
      attributionsChannel = supabase
        .channel(`attributions_${channelId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'marketing_spend_attrib',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            console.log('💰 Mise à jour attributions en temps réel:', payload);
            
            const record = payload.new as any || payload.old as any;
            if (record && record.product && record.country) {
              triggerUpdate({
                type: 'attribution_update',
                productCountry: {
                  product: record.product,
                  country: record.country
                },
                timestamp: Date.now()
              });
            }
          }
        )
        .subscribe();

    } catch (error) {
      console.error('Erreur lors de la configuration des canaux temps réel:', error);
    }

    return () => {
      try {
        if (deliveriesChannel) {
          supabase.removeChannel(deliveriesChannel);
        }
        if (attributionsChannel) {
          supabase.removeChannel(attributionsChannel);
        }
      } catch (error) {
        console.error('Erreur lors de la fermeture des canaux:', error);
      }
    };
  }, [user?.id, triggerUpdate]);

  return {
    lastUpdate,
    triggerUpdate
  };
};