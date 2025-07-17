
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProfitRow, ProfitRowInput } from "@/types/profit";
import { useAuth } from "./useAuth";
import { useExchangeRateSync } from "./useExchangeRateSync";
import { format, parse } from "date-fns";
import { useMonthStore } from "@/stores/monthStore";

function getMonthStart(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

// Wrapper pour logs conditionnels
function debugLog(message: string, data?: any) {
  if (process.env.NODE_ENV !== 'production') {
    console.debug(`[useProfitTracking] ${message}`, data);
  }
}

// Liste des entrées de profits pour le mois sélectionné globalement
export function useProfitRows(selectedDate?: Date) {
  const { user } = useAuth();
  const { current: currentMonth, archiveMode } = useMonthStore();
  
  // Use global month if selectedDate is not provided
  const targetDate = selectedDate || parse(currentMonth + '-01', 'yyyy-MM-dd', new Date());
  const start = getMonthStart(targetDate).toISOString().slice(0, 10);
  const end = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0)
    .toISOString().slice(0, 10);

  return useQuery<ProfitRow[]>({
    queryKey: ["profit_tracking", user?.id, currentMonth, archiveMode, start, end],
    queryFn: async () => {
      if (!user) return [];
      
      debugLog("Récupération des données de profit pour:", { 
        user_id: user.id, 
        start, 
        end, 
        targetDate: format(targetDate, "yyyy-MM-dd") 
      });
      
      // Choose table based on archive mode
      const tableName = archiveMode ? 'archive_profit_tracking' : 'profit_tracking';
      
      const { data, error } = await supabase
        .from(tableName)
        .select("*")
        .eq("user_id", user.id)
        .gte("date", start)
        .lte("date", end)
        .order("date", { ascending: false })
        .order("cpd_category", { ascending: true })
        .order("product_name", { ascending: true });
        
      if (error) {
        console.error("Erreur lors de la récupération des profits:", error);
        throw new Error(error.message);
      }
      
      debugLog("Données de profit récupérées:", {
        count: data?.length || 0,
        dates: [...new Set(data?.map(row => row.date) || [])],
        targetDate: format(targetDate, "yyyy-MM-dd")
      });
      
      return data as ProfitRow[];
    },
    enabled: !!user,
    staleTime: 0, // Forcer le refetch à chaque invalidation
    refetchOnWindowFocus: true,
  });
}

// Hook pour les totaux avec conversion de devise synchronisée
export function useProfitTotals(selectedDate?: Date) {
  const { data: profitRows = [], isLoading } = useProfitRows(selectedDate);
  const { exchangeRate } = useExchangeRateSync(selectedDate);
  
  // Calcul du total des commissions du mois en DH (Chiffre d'affaires)
  const totalCommissionsDh = profitRows.reduce((sum, row) => sum + (row.commission_total || 0), 0);
  
  // Calcul du total des livraisons du mois
  const totalQuantity = profitRows.reduce((sum, row) => sum + (row.quantity || 0), 0);
  
  // Calculs séparés par type de livraison
  const normalRows = profitRows.filter(row => row.source_type === 'normale' || !row.source_type);
  const delayedRows = profitRows.filter(row => row.source_type === 'décalée');
  
  const normalQuantity = normalRows.reduce((sum, row) => sum + (row.quantity || 0), 0);
  const delayedQuantity = delayedRows.reduce((sum, row) => sum + (row.quantity || 0), 0);
  
  const normalCommissions = normalRows.reduce((sum, row) => sum + (row.commission_total || 0), 0);
  const delayedCommissions = delayedRows.reduce((sum, row) => sum + (row.commission_total || 0), 0);
  
  debugLog("Calcul des totaux:", {
    totalCommissionsDh,
    totalQuantity,
    normalQuantity,
    delayedQuantity,
    normalCommissions,
    delayedCommissions,
    exchangeRate
  });
  
  return {
    totalCommissionsDh,
    totalCommissionsUsd: totalCommissionsDh / exchangeRate,
    totalQuantity,
    normalQuantity,
    delayedQuantity,
    normalCommissions,
    delayedCommissions,
    exchangeRate,
    isLoading
  };
}

// Fonction pour vérifier si un produit existe déjà pour une date et catégorie données
export function useCheckExistingProduct() {
  const { user } = useAuth();
  
  return async (productName: string, cpdCategory: number, date: string, sourceType: string = 'normale'): Promise<ProfitRow | null> => {
    if (!user) return null;
    
    debugLog("Vérification produit existant:", { productName, cpdCategory, date, sourceType });
    
    const { data, error } = await supabase
      .from("profit_tracking")
      .select("*")
      .eq("user_id", user.id)
      .eq("product_name", productName)
      .eq("cpd_category", cpdCategory)
      .eq("date", date)
      .eq("source_type", sourceType)
      .maybeSingle();
    
    if (error && error.code !== 'PGRST116') {
      console.error("Erreur lors de la vérification:", error);
      throw new Error(error.message);
    }
    
    debugLog("Produit existant trouvé:", data);
    return data as ProfitRow | null;
  };
}

// Ajout d'une entrée de profit avec vérification d'existance
export function useAddProfitRow() {
  const queryClient = useQueryClient();
  const checkExisting = useCheckExistingProduct();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (row: ProfitRowInput & { user_id: string; source_type?: string }) => {
      const sourceType = row.source_type || 'normale';
      
      debugLog("Tentative d'ajout de livraison:", { 
        productName: row.product_name, 
        sourceType: sourceType,
        date: row.date,
        cpdCategory: row.cpd_category,
        quantity: row.quantity
      });
      
      // Vérifier si le produit existe déjà
      const existingProduct = await checkExisting(row.product_name, row.cpd_category, row.date, sourceType);
      
      if (existingProduct) {
        // Si le produit existe, mettre à jour la quantité
        const newQuantity = existingProduct.quantity + row.quantity;
        const newCommissionTotal = newQuantity * row.cpd_category;
        
        debugLog("Mise à jour du produit existant:", { 
          id: existingProduct.id, 
          oldQuantity: existingProduct.quantity, 
          newQuantity, 
          newCommissionTotal 
        });
        
        const { error, data } = await supabase
          .from("profit_tracking")
          .update({ 
            quantity: newQuantity,
            commission_total: newCommissionTotal 
          })
          .eq("id", existingProduct.id)
          .select()
          .single();
          
        if (error) {
          console.error("Erreur lors de la mise à jour:", error);
          throw new Error(error.message);
        }
        
        debugLog("Mise à jour réussie:", data);
        return { data, wasUpdated: true };
      } else {
        // Si le produit n'existe pas, créer une nouvelle entrée
        const insertData = {
          user_id: row.user_id,
          date: row.date,
          cpd_category: row.cpd_category,
          product_name: row.product_name,
          quantity: row.quantity,
          commission_total: row.commission_total,
          source_type: sourceType,
          product_id: row.product_id || null
        };
        
        debugLog("Données à insérer:", insertData);
        
        const { error, data } = await supabase
          .from("profit_tracking")
          .insert(insertData)
          .select()
          .single();
        
        if (error) {
          console.error("Erreur lors de l'insertion:", error);
          throw new Error(error.message);
        }
        
        debugLog("Insertion réussie:", data);
        return { data, wasUpdated: false };
      }
    },
    onSuccess: (result) => {
      debugLog("Mutation d'ajout réussie:", result);
      // Invalider toutes les requêtes liées aux profits
      queryClient.invalidateQueries({ queryKey: ["profit_tracking"] });
      queryClient.invalidateQueries({ queryKey: ["profit_totals"] });
      queryClient.invalidateQueries({ queryKey: ["profit_summary"] });
      queryClient.invalidateQueries({ queryKey: ["monthly_bonus"] });
      
      // Forcer un nouveau fetch après un délai court pour s'assurer que les données sont à jour
      setTimeout(() => {
        queryClient.refetchQueries({ queryKey: ["profit_tracking"] });
        queryClient.refetchQueries({ queryKey: ["profit_totals"] });
      }, 200);
    },
    onError: (error) => {
      console.error("Erreur dans la mutation d'ajout:", error);
    }
  });
}

export function useUpdateProfitRow() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, quantity, productName, cpdCategory }: { 
      id: string; 
      quantity: number; 
      productName?: string; 
      cpdCategory?: number;
    }) => {
      debugLog("Mise à jour de l'entrée:", { id, quantity, productName, cpdCategory });
      
      // Récupérer l'entrée actuelle
      const { data: currentRow, error: fetchError } = await supabase
        .from("profit_tracking")
        .select("cpd_category, quantity")
        .eq("id", id)
        .single();
      
      if (fetchError) {
        console.error("Erreur lors de la récupération:", fetchError);
        throw new Error(fetchError.message);
      }
      
      // Utiliser les nouvelles valeurs ou les valeurs existantes
      const finalCpdCategory = cpdCategory !== undefined ? cpdCategory : currentRow.cpd_category;
      const finalQuantity = quantity;
      const commission_total = finalQuantity * finalCpdCategory;
      
      // Préparer les données à mettre à jour
      const updateData: any = { 
        quantity: finalQuantity, 
        commission_total 
      };
      
      // Ajouter le CPD si fourni
      if (cpdCategory !== undefined) {
        updateData.cpd_category = cpdCategory;
      }
      
      // Ajouter le nom du produit si fourni
      if (productName !== undefined) {
        updateData.product_name = productName;
      }
      
      debugLog("Données de mise à jour:", updateData);
      
      const { error, data } = await supabase
        .from("profit_tracking")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();
        
      if (error) {
        console.error("Erreur lors de la mise à jour:", error);
        throw new Error(error.message);
      }
      
      debugLog("Mise à jour réussie:", data);
      return data;
    },
    onSuccess: (data) => {
      debugLog("Mutation de mise à jour réussie:", data);
      // Invalider toutes les requêtes liées aux profits
      queryClient.invalidateQueries({ queryKey: ["profit_tracking"] });
      queryClient.invalidateQueries({ queryKey: ["profit_totals"] });
      queryClient.invalidateQueries({ queryKey: ["profit_summary"] });
      queryClient.invalidateQueries({ queryKey: ["monthly_bonus"] });
      
      // Forcer un refetch immédiat
      setTimeout(() => {
        queryClient.refetchQueries({ queryKey: ["profit_tracking"] });
        queryClient.refetchQueries({ queryKey: ["profit_totals"] });
      }, 200);
    },
    onError: (error) => {
      console.error("Erreur dans la mutation de mise à jour:", error);
    }
  });
}

export function useDeleteProfitRow() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      debugLog("Suppression de l'entrée:", id);
      
      const { error } = await supabase
        .from("profit_tracking")
        .delete()
        .eq("id", id);
        
      if (error) {
        console.error("Erreur lors de la suppression:", error);
        throw new Error(error.message);
      }
      
      debugLog("Suppression réussie:", id);
    },
    onSuccess: (_, deletedId) => {
      debugLog("Mutation de suppression réussie:", deletedId);
      // Invalider toutes les requêtes liées aux profits
      queryClient.invalidateQueries({ queryKey: ["profit_tracking"] });
      queryClient.invalidateQueries({ queryKey: ["profit_totals"] });
      queryClient.invalidateQueries({ queryKey: ["profit_summary"] });
      queryClient.invalidateQueries({ queryKey: ["monthly_bonus"] });
      
      // Forcer un refetch immédiat
      setTimeout(() => {
        queryClient.refetchQueries({ queryKey: ["profit_tracking"] });
        queryClient.refetchQueries({ queryKey: ["profit_totals"] });
      }, 200);
    },
    onError: (error) => {
      console.error("Erreur dans la mutation de suppression:", error);
    }
  });
}
