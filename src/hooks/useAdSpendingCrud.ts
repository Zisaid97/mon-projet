
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AdSpendingData } from '@/hooks/useAdSpendingData';

export const useAdSpendingCrud = () => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const deleteDay = async (date: string) => {
    if (!user?.id) return false;

    setLoading(true);
    try {
      // 1. Supprimer les données Ad Spending
      const { error: adSpendingError } = await supabase
        .from('ad_spending_data' as any)
        .delete()
        .eq('user_id', user.id)
        .eq('date', date);

      if (adSpendingError) throw adSpendingError;

      // 2. Supprimer automatiquement les attributions Meta correspondantes
      const { error: attributionsError } = await supabase
        .from('attributions_meta')
        .delete()
        .eq('user_id', user.id)
        .eq('date', date);

      if (attributionsError) {
        console.warn('Erreur lors de la suppression des attributions:', attributionsError);
        // Ne pas faire échouer l'opération principale
      }

      // 3. Supprimer aussi les attributions dans marketing_spend_attrib
      const { error: marketingSpendError } = await supabase
        .from('marketing_spend_attrib')
        .delete()
        .eq('user_id', user.id)
        .eq('date', date);

      if (marketingSpendError) {
        console.warn('Erreur lors de la suppression des attributions marketing:', marketingSpendError);
        // Ne pas faire échouer l'opération principale
      }

      toast({
        title: "✅ Suppression réussie",
        description: `Données et attributions du ${new Date(date).toLocaleDateString('fr-FR')} supprimées`,
      });

      // Déclencher les événements de rafraîchissement pour les autres composants
      window.dispatchEvent(new CustomEvent('ad-spending-deleted'));
      window.dispatchEvent(new CustomEvent('meta-attributions-updated'));
      window.dispatchEvent(new CustomEvent('attributions-updated'));

      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast({
        title: "❌ Erreur de suppression",
        description: "Impossible de supprimer les données",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateDay = async (date: string, updatedData: AdSpendingData[]) => {
    if (!user?.id) return false;

    setLoading(true);
    try {
      // Supprimer les anciennes données
      await supabase
        .from('ad_spending_data' as any)
        .delete()
        .eq('user_id', user.id)
        .eq('date', date);

      // Insérer les nouvelles données
      const { error } = await supabase
        .from('ad_spending_data' as any)
        .insert(updatedData.map(item => ({
          ...item,
          user_id: user.id,
          date: date
        })));

      if (error) throw error;

      toast({
        title: "✅ Mise à jour réussie",
        description: `Données du ${new Date(date).toLocaleDateString('fr-FR')} mises à jour`,
      });

      // Déclencher les événements de rafraîchissement
      window.dispatchEvent(new CustomEvent('ad-spending-updated'));
      window.dispatchEvent(new CustomEvent('meta-attributions-updated'));

      return true;
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      toast({
        title: "❌ Erreur de mise à jour",
        description: "Impossible de mettre à jour les données",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    deleteDay,
    updateDay
  };
};
