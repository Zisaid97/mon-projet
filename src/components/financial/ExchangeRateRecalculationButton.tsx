
import { Button } from "@/components/ui/button";
import { RefreshCw, Calculator } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

export function ExchangeRateRecalculationButton() {
  const [isRecalculating, setIsRecalculating] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  const handleForceRecalculation = async () => {
    if (!user?.id) return;
    
    setIsRecalculating(true);
    
    try {
      // 🔧 FIX BUG #2: Forcer le recalcul de toutes les conversions
      
      // 1. Invalider tous les caches liés aux taux de change
      await queryClient.invalidateQueries({ queryKey: ["exchange_rate"] });
      await queryClient.invalidateQueries({ queryKey: ["exchange_rate_sync"] });
      await queryClient.invalidateQueries({ queryKey: ["monthly_average_rate"] });
      await queryClient.invalidateQueries({ queryKey: ["monthly_rate_details"] });
      
      // 2. Invalider les données qui dépendent des conversions
      await queryClient.invalidateQueries({ queryKey: ["marketing_performance"] });
      await queryClient.invalidateQueries({ queryKey: ["profit_tracking"] });
      await queryClient.invalidateQueries({ queryKey: ["marketing_spend_attrib"] });
      await queryClient.invalidateQueries({ queryKey: ["product_analysis"] });
      
      // 3. Attendre un court délai pour que les nouveaux taux soient récupérés
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 4. Forcer le rechargement des données calculées
      await queryClient.refetchQueries({ 
        queryKey: ["marketing_performance"],
        type: 'active'
      });
      
      toast({
        title: "✅ Recalcul terminé",
        description: "Toutes les conversions USD → MAD ont été recalculées avec le taux moyen mensuel",
      });
      
    } catch (error) {
      console.error("Erreur lors du recalcul:", error);
      toast({
        title: "❌ Erreur de recalcul",
        description: "Impossible de recalculer les conversions",
        variant: "destructive",
      });
    } finally {
      setIsRecalculating(false);
    }
  };

  return (
    <Button
      onClick={handleForceRecalculation}
      disabled={isRecalculating}
      variant="outline"
      size="sm"
      className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 hover:from-blue-100 hover:to-purple-100 text-blue-700 hover:text-blue-800 transition-all duration-200"
    >
      {isRecalculating ? (
        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <Calculator className="h-4 w-4 mr-2" />
      )}
      {isRecalculating ? 'Recalcul en cours...' : 'Forcer recalcul $ → MAD'}
    </Button>
  );
}
