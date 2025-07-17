
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { ProductKeyword, ProductKeywordInput } from '@/types/product';

export const useProductKeywords = (productId: string) => {
  const [keywords, setKeywords] = useState<ProductKeyword[]>([]);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();

  // Charger les mots-clés d'un produit
  const loadKeywords = async () => {
    if (!user?.id || !productId) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('product_keywords')
        .select('*')
        .eq('product_id', productId)
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setKeywords(data || []);
    } catch (error) {
      console.error('Erreur chargement mots-clés:', error);
      toast({
        title: "Erreur de chargement",
        description: "Impossible de charger les mots-clés",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Charger les suggestions de mots-clés
  const loadSuggestions = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('product_keywords')
        .select('keyword')
        .eq('user_id', user.id)
        .order('keyword');

      if (error) throw error;
      
      const uniqueKeywords = [...new Set(data?.map(item => item.keyword) || [])];
      setSuggestions(uniqueKeywords);
    } catch (error) {
      console.error('Erreur chargement suggestions:', error);
    }
  };

  // Ajouter un mot-clé
  const addKeyword = async (input: ProductKeywordInput) => {
    if (!user?.id || !productId) return false;

    // Vérifier si le mot-clé existe déjà
    const keywordLower = input.keyword.trim().toLowerCase();
    const existingKeyword = keywords.find(k => k.keyword.toLowerCase() === keywordLower);
    
    if (existingKeyword) {
      toast({
        title: "Mot-clé déjà existant",
        description: `"${input.keyword}" existe déjà pour ce produit`,
        variant: "destructive",
      });
      return false;
    }

    try {
      const { data, error } = await supabase
        .from('product_keywords')
        .insert({
          product_id: productId,
          keyword: input.keyword.trim(),
          note: input.note || '',
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      setKeywords(prev => [...prev, data]);
      await loadSuggestions(); // Rafraîchir les suggestions
      
      toast({
        title: "✅ Mot-clé ajouté",
        description: `"${input.keyword}" a été ajouté`,
      });

      return true;
    } catch (error: any) {
      console.error('Erreur ajout mot-clé:', error);
      
      if (error.code === '23505') {
        toast({
          title: "Mot-clé déjà existant",
          description: "Ce mot-clé existe déjà pour ce produit",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erreur d'ajout",
          description: "Impossible d'ajouter le mot-clé",
          variant: "destructive",
        });
      }
      return false;
    }
  };

  // Supprimer un mot-clé
  const removeKeyword = async (keywordId: string) => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('product_keywords')
        .delete()
        .eq('id', keywordId)
        .eq('user_id', user.id);

      if (error) throw error;

      setKeywords(prev => prev.filter(k => k.id !== keywordId));
      
      toast({
        title: "✅ Mot-clé supprimé",
        description: "Le mot-clé a été retiré",
      });
    } catch (error) {
      console.error('Erreur suppression mot-clé:', error);
      toast({
        title: "Erreur de suppression",
        description: "Impossible de supprimer le mot-clé",
        variant: "destructive",
      });
    }
  };

  // Mettre à jour un mot-clé
  const updateKeyword = async (keywordId: string, updates: { note: string }) => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('product_keywords')
        .update(updates)
        .eq('id', keywordId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      setKeywords(prev => prev.map(k => k.id === keywordId ? data : k));
      
      toast({
        title: "✅ Note mise à jour",
        description: "La note du mot-clé a été modifiée",
      });
    } catch (error) {
      console.error('Erreur mise à jour mot-clé:', error);
      toast({
        title: "Erreur de mise à jour",
        description: "Impossible de modifier la note",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (productId) {
      loadKeywords();
    }
  }, [productId, user?.id]);

  useEffect(() => {
    if (user?.id) {
      loadSuggestions();
    }
  }, [user?.id]);

  return {
    keywords,
    loading,
    suggestions,
    addKeyword,
    removeKeyword,
    updateKeyword,
    refreshKeywords: loadKeywords
  };
};
