import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface ArchivedKeyword {
  id: string;
  original_keyword_id: string;
  product_id: string;
  product_name: string;
  keyword: string;
  note?: string;
  user_id: string;
  deleted_at: string;
  deletion_reason: string;
  created_at: string;
  updated_at: string;
}

export const useKeywordRestore = () => {
  const [loading, setLoading] = useState(false);
  const [archivedKeywords, setArchivedKeywords] = useState<ArchivedKeyword[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();

  // Charger les mots-clés archivés pour un produit
  const loadArchivedKeywords = async (productId: string) => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('product_keywords_archive')
        .select('*')
        .eq('product_id', productId)
        .eq('user_id', user.id)
        .order('deleted_at', { ascending: false });

      if (error) throw error;
      setArchivedKeywords(data || []);
    } catch (error) {
      console.error('Erreur chargement archives:', error);
      toast({
        title: "Erreur de chargement",
        description: "Impossible de charger les mots-clés archivés",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Charger tous les mots-clés archivés récents de l'utilisateur
  const loadRecentArchivedKeywords = async (limit = 50) => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('product_keywords_archive')
        .select('*')
        .eq('user_id', user.id)
        .order('deleted_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      setArchivedKeywords(data || []);
    } catch (error) {
      console.error('Erreur chargement archives récentes:', error);
      toast({
        title: "Erreur de chargement",
        description: "Impossible de charger les mots-clés archivés",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Restaurer un mot-clé depuis l'archive
  const restoreKeyword = async (archiveId: string, targetProductId?: string) => {
    if (!user?.id) return false;

    try {
      // Récupérer les détails de l'archive
      const { data: archiveData, error: fetchError } = await supabase
        .from('product_keywords_archive')
        .select('*')
        .eq('id', archiveId)
        .eq('user_id', user.id)
        .single();

      if (fetchError) throw fetchError;

      const productId = targetProductId || archiveData.product_id;

      // Vérifier si le mot-clé existe déjà
      const { data: existingKeyword } = await supabase
        .from('product_keywords')
        .select('id')
        .eq('product_id', productId)
        .eq('keyword', archiveData.keyword)
        .eq('user_id', user.id)
        .single();

      if (existingKeyword) {
        toast({
          title: "Mot-clé déjà existant",
          description: `"${archiveData.keyword}" existe déjà pour ce produit`,
          variant: "destructive",
        });
        return false;
      }

      // Restaurer le mot-clé
      const { error: insertError } = await supabase
        .from('product_keywords')
        .insert({
          product_id: productId,
          keyword: archiveData.keyword,
          note: archiveData.note || '',
          user_id: user.id
        });

      if (insertError) throw insertError;

      // Optionnel: supprimer de l'archive après restauration
      const { error: deleteError } = await supabase
        .from('product_keywords_archive')
        .delete()
        .eq('id', archiveId)
        .eq('user_id', user.id);

      if (deleteError) {
        console.warn('Impossible de supprimer l\'archive:', deleteError);
      }

      toast({
        title: "✅ Mot-clé restauré",
        description: `"${archiveData.keyword}" a été restauré avec succès`,
      });

      // Actualiser la liste des archives
      setArchivedKeywords(prev => prev.filter(k => k.id !== archiveId));
      return true;
    } catch (error) {
      console.error('Erreur restauration mot-clé:', error);
      toast({
        title: "Erreur de restauration",
        description: "Impossible de restaurer le mot-clé",
        variant: "destructive",
      });
      return false;
    }
  };

  // Restaurer tous les mots-clés d'un produit supprimé
  const restoreAllKeywordsForProduct = async (originalProductId: string, targetProductId: string) => {
    if (!user?.id) return false;

    try {
      const { data: archives, error: fetchError } = await supabase
        .from('product_keywords_archive')
        .select('*')
        .eq('product_id', originalProductId)
        .eq('user_id', user.id);

      if (fetchError) throw fetchError;

      if (!archives || archives.length === 0) {
        toast({
          title: "Aucun mot-clé à restaurer",
          description: "Aucun mot-clé archivé trouvé pour ce produit",
          variant: "destructive",
        });
        return false;
      }

      let restoredCount = 0;
      let errorCount = 0;

      for (const archive of archives) {
        const success = await restoreKeyword(archive.id, targetProductId);
        if (success) {
          restoredCount++;
        } else {
          errorCount++;
        }
      }

      toast({
        title: "Restauration terminée",
        description: `${restoredCount} mot(s)-clé(s) restauré(s)${errorCount > 0 ? `, ${errorCount} erreur(s)` : ''}`,
      });

      return restoredCount > 0;
    } catch (error) {
      console.error('Erreur restauration globale:', error);
      toast({
        title: "Erreur de restauration",
        description: "Impossible de restaurer les mots-clés",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    archivedKeywords,
    loading,
    loadArchivedKeywords,
    loadRecentArchivedKeywords,
    restoreKeyword,
    restoreAllKeywordsForProduct
  };
};