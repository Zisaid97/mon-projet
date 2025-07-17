
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';

interface MonthlyBonus {
  id: string;
  user_id: string;
  year: number;
  month: number;
  amount_dh: number;
  created_at: string;
  updated_at: string;
}

export function useMonthlyBonus(selectedDate?: Date) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [bonus, setBonus] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const targetDate = selectedDate || new Date();
  const year = targetDate.getFullYear();
  const month = targetDate.getMonth() + 1;

  // Charger le bonus du mois courant
  useEffect(() => {
    const fetchBonus = async () => {
      if (!user) return;

      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('monthly_bonus')
          .select('amount_dh')
          .eq('user_id', user.id)
          .eq('year', year)
          .eq('month', month)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') {
          throw error;
        }

        setBonus(data?.amount_dh || 0);
      } catch (error) {
        console.error('Erreur lors du chargement du bonus:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBonus();
  }, [user, year, month]);

  // Sauvegarder le bonus
  const saveBonus = async (newAmount: number) => {
    if (!user) return;

    setIsSaving(true);
    try {
      // Vérifier si un bonus existe déjà pour ce mois
      const { data: existing } = await supabase
        .from('monthly_bonus')
        .select('id')
        .eq('user_id', user.id)
        .eq('year', year)
        .eq('month', month)
        .maybeSingle();

      if (existing) {
        // Mettre à jour
        const { error } = await supabase
          .from('monthly_bonus')
          .update({ amount_dh: newAmount })
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        // Créer
        const { error } = await supabase
          .from('monthly_bonus')
          .insert({
            user_id: user.id,
            year,
            month,
            amount_dh: newAmount
          });

        if (error) throw error;
      }

      setBonus(newAmount);
      toast({
        title: "✅ Bonus sauvegardé",
        description: `Bonus mensuel mis à jour : ${newAmount.toFixed(0)} DH`,
      });
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du bonus:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder le bonus",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return {
    bonus,
    isLoading,
    isSaving,
    saveBonus
  };
}
