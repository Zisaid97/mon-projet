
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useMonthStore } from '@/stores/monthStore';
import { format, startOfMonth, endOfMonth, parse } from 'date-fns';

export interface MarketingData {
  id: string;
  date: string;
  spend_usd: number;
  leads: number;
  deliveries: number;
  margin_per_order: number;
}

export const useMarketingData = (user?: any) => {
  const [data, setData] = useState<MarketingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const { toast } = useToast();
  const { current: selectedMonth } = useMonthStore();

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Parse selected month to get date range
      const monthStart = startOfMonth(parse(selectedMonth + '-01', 'yyyy-MM-dd', new Date()));
      const monthEnd = endOfMonth(monthStart);
      
      const startDate = format(monthStart, 'yyyy-MM-dd');
      const endDate = format(monthEnd, 'yyyy-MM-dd');
      
      console.log('[Debug] Chargement des données marketing pour:', selectedMonth, {
        startDate,
        endDate
      });

      const { data: marketingData, error } = await supabase
        .from('marketing_performance')
        .select('*')
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: false });

      if (error) throw error;
      
      console.log('[Debug] Données récupérées:', marketingData?.length, 'entrées');
      setData(marketingData || []);
    } catch (error) {
      console.error('Erreur lors du chargement des données marketing:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateField = async (id: string, field: string, value: number) => {
    try {
      setUpdating(true);
      
      const { error } = await supabase
        .from('marketing_performance')
        .update({ [field]: value })
        .eq('id', id);

      if (error) throw error;

      // Update local state
      setData(prevData => 
        prevData.map(item => 
          item.id === id ? { ...item, [field]: value } : item
        )
      );

      // Toast de succès uniquement pour les actions manuelles
      toast({
        title: "✅ Mis à jour",
        description: `${field} modifié avec succès`,
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      toast({
        title: "Erreur de mise à jour",
        description: "Impossible de mettre à jour la donnée",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const deleteEntry = async (id: string) => {
    try {
      setUpdating(true);
      
      const { error } = await supabase
        .from('marketing_performance')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setData(prevData => prevData.filter(item => item.id !== id));
      
      toast({
        title: "Supprimé",
        description: "Entrée supprimée avec succès",
      });
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast({
        title: "Erreur de suppression",
        description: "Impossible de supprimer l'entrée",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const addEntry = async (entry: Omit<MarketingData, 'id'>) => {
    try {
      setUpdating(true);
      
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Utilisateur non connecté');

      const { data: newEntry, error } = await supabase
        .from('marketing_performance')
        .insert({
          ...entry,
          user_id: user.user.id
        })
        .select()
        .single();

      if (error) throw error;

      setData(prevData => [newEntry, ...prevData]);
      
      // Pas de toast pour éviter les notifications répétitives lors de l'auto-sauvegarde
      return newEntry;
    } catch (error) {
      console.error('Erreur lors de l\'ajout:', error);
      // Toast seulement pour les erreurs critiques
      if (!error.message?.includes('duplicate key')) {
        toast({
          title: "Erreur d'ajout",
          description: "Impossible d'ajouter l'entrée",
          variant: "destructive",
        });
      }
      throw error;
    } finally {
      setUpdating(false);
    }
  };

  const savePerformanceData = async (entryData: {
    date: string;
    spend_usd: number;
    leads: number;
    deliveries: number;
    margin_per_order: number;
  }) => {
    const entry = {
      date: entryData.date,
      spend_usd: entryData.spend_usd,
      leads: entryData.leads,
      deliveries: entryData.deliveries,
      margin_per_order: entryData.margin_per_order
    };

    const existingEntry = data.find(item => item.date === entryData.date);
    
    if (existingEntry) {
      // Update existing entry silently (no toast to avoid spam)
      try {
        setUpdating(true);
        const { error } = await supabase
          .from('marketing_performance')
          .update(entry)
          .eq('id', existingEntry.id);

        if (error) throw error;

        setData(prevData => 
          prevData.map(item => 
            item.id === existingEntry.id ? { ...item, ...entry } : item
          )
        );
      } catch (error) {
        console.error('Erreur lors de la mise à jour silencieuse:', error);
      } finally {
        setUpdating(false);
      }
    } else {
      // Create new entry
      await addEntry(entry);
    }
  };

  const deletePerformanceData = async (id: string) => {
    await deleteEntry(id);
  };

  const updateDeliveries = async (id: string, newDeliveries: number) => {
    await updateField(id, 'deliveries', newDeliveries);
  };

  const updateMargin = async (id: string, newMargin: number) => {
    await updateField(id, 'margin_per_order', newMargin);
  };

  // Recharger les données quand le mois sélectionné change
  useEffect(() => {
    fetchData();
  }, [selectedMonth]);

  return {
    data,
    loading,
    updating,
    fetchData,
    updateField,
    deleteEntry,
    addEntry,
    savePerformanceData,
    deletePerformanceData,
    updateDeliveries,
    updateMargin
  };
};
