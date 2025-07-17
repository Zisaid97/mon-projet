
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export function useMonthlyArchive() {
  const queryClient = useQueryClient();

  const archiveMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('close-month');
      
      if (error) {
        throw error;
      }
      
      return data;
    },
    onSuccess: (data) => {
      toast({
        title: "Archivage réussi ✅",
        description: `Les données ont été archivées pour ${data.month_label}`,
      });
      
      // Invalider toutes les requêtes liées aux données
      queryClient.invalidateQueries({ queryKey: ["archive_"] });
      queryClient.invalidateQueries({ queryKey: ["profit_tracking"] });
      queryClient.invalidateQueries({ queryKey: ["marketing_performance"] });
      queryClient.invalidateQueries({ queryKey: ["financial_tracking"] });
      queryClient.invalidateQueries({ queryKey: ["sales_data"] });
      queryClient.invalidateQueries({ queryKey: ["ad_spending_data"] });
    },
    onError: (error) => {
      console.error("Erreur lors de l'archivage:", error);
      toast({
        title: "Erreur d'archivage",
        description: "Impossible d'effectuer l'archivage automatique.",
        variant: "destructive",
      });
    }
  });

  return {
    archiveData: archiveMutation.mutate,
    isArchiving: archiveMutation.isPending,
    error: archiveMutation.error,
  };
}
