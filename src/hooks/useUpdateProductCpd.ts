import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "./useAuth";

interface UpdateCpdParams {
  profitRowId: string;
  newCpd: number;
  productName: string;
  quantity: number;
}

export function useUpdateProductCpd() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ profitRowId, newCpd, productName, quantity }: UpdateCpdParams) => {
      if (!user) throw new Error("User not authenticated");

      // 1. Mettre à jour la ligne de profit avec le nouveau CPD
      const newCommissionTotal = quantity * newCpd;
      
      const { error: profitError } = await supabase
        .from('profit_tracking')
        .update({
          cpd_category: newCpd,
          commission_total: newCommissionTotal
        })
        .eq('id', profitRowId)
        .eq('user_id', user.id);

      if (profitError) {
        throw new Error(`Erreur lors de la mise à jour des profits: ${profitError.message}`);
      }

      // 2. Chercher le produit dans la base products
      const { data: existingProduct } = await supabase
        .from('products')
        .select('id, cpd_category')
        .eq('user_id', user.id)
        .eq('name', productName)
        .maybeSingle();

      if (existingProduct && existingProduct.cpd_category !== newCpd) {
        // 3. Mettre à jour le CPD du produit dans la table products
        const { error: productError } = await supabase
          .from('products')
          .update({ cpd_category: newCpd })
          .eq('id', existingProduct.id)
          .eq('user_id', user.id);

        if (productError) {
          console.warn(`Erreur lors de la mise à jour du produit: ${productError.message}`);
          // Ne pas faire échouer toute l'opération pour cette erreur
        }
      } else if (!existingProduct) {
        // 4. Créer le produit avec le nouveau CPD s'il n'existe pas
        const { error: createError } = await supabase
          .from('products')
          .insert({
            name: productName,
            cpd_category: newCpd,
            user_id: user.id,
            facebook_keywords: []
          });

        if (createError) {
          console.warn(`Erreur lors de la création du produit: ${createError.message}`);
          // Ne pas faire échouer toute l'opération pour cette erreur
        }
      }

      return { profitRowId, newCpd, newCommissionTotal };
    },
    onSuccess: () => {
      // Invalider les caches des requêtes pertinentes
      queryClient.invalidateQueries({ queryKey: ['profits'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['profit-history'] });
      
      toast({
        title: "CPD mis à jour",
        description: "Le CPD a été mis à jour avec succès dans les profits et produits.",
      });
    },
    onError: (error) => {
      console.error('Erreur lors de la mise à jour du CPD:', error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Erreur lors de la mise à jour du CPD",
        variant: "destructive",
      });
    },
  });
}