import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface ProductCountryDelivery {
  id: string;
  user_id: string;
  product: string;
  country: string;
  date: string;
  deliveries: number;
  created_at: string;
  updated_at: string;
}

export const useProductCountryDeliveries = () => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const getDeliveries = useCallback(async (product: string, country: string, dates: string[]) => {
    if (!user?.id) return [];

    try {
      const { data, error } = await supabase
        .from('product_country_deliveries')
        .select('*')
        .eq('user_id', user.id)
        .eq('product', product)
        .eq('country', country)
        .in('date', dates)
        .order('date', { ascending: false });

      if (error) throw error;
      return data as ProductCountryDelivery[];
    } catch (error) {
      console.error('Erreur lors du chargement des livraisons:', error);
      return [];
    }
  }, [user?.id]);

  const updateDeliveries = useCallback(async (
    product: string, 
    country: string, 
    date: string, 
    deliveries: number
  ) => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('product_country_deliveries')
        .upsert({
          user_id: user.id,
          product,
          country,
          date,
          deliveries
        }, {
          onConflict: 'user_id,product,country,date'
        });

      if (error) throw error;

      toast({
        title: "✅ Livraisons mises à jour",
        description: `${deliveries} livraisons pour ${product} - ${country}`,
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour des livraisons:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour les livraisons",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user?.id, toast]);

  return {
    loading,
    getDeliveries,
    updateDeliveries
  };
};