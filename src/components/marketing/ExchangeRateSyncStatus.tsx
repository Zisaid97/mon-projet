
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, TrendingUp } from "lucide-react";
import { useExchangeRateSync } from "@/hooks/useExchangeRateSync";
import { useToast } from "@/hooks/use-toast";

export function ExchangeRateSyncStatus() {
  const { exchangeRate, monthlyAverageRate, syncAllRates, isUsingMonthlyAverage } = useExchangeRateSync();
  const { toast } = useToast();

  const handleSync = () => {
    syncAllRates();
    toast({
      title: "Synchronisation effectuée ✅",
      description: "Les taux de change ont été resynchronisés depuis la page Finances",
    });
  };

  // ✅ CORRECTION: Toujours utiliser le taux moyen mensuel pour les calculs
  const activeRate = monthlyAverageRate || 10.0;

  return (
    <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-purple-200 dark:border-purple-700">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-5 w-5 text-purple-600" />
            <div>
              <div className="font-medium text-purple-800 dark:text-purple-300">
                Taux USD → MAD : {activeRate.toFixed(4)}
              </div>
              <div className="text-sm text-purple-600 dark:text-purple-400">
                {monthlyAverageRate && monthlyAverageRate !== 10.0
                  ? "🔄 Synchronisé avec la moyenne mensuelle"
                  : "⚠️ Taux par défaut (aucune donnée financière ce mois)"
                }
              </div>
              {monthlyAverageRate && monthlyAverageRate !== 10.0 && (
                <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                  ✅ Utilisé pour tous les calculs de dépenses Marketing
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge 
              variant="secondary" 
              className={`${
                monthlyAverageRate && monthlyAverageRate !== 10.0
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
              }`}
            >
              {monthlyAverageRate && monthlyAverageRate !== 10.0 ? 'Taux moyen' : 'Défaut'}
            </Badge>
            <Button
              size="sm"
              variant="outline"
              onClick={handleSync}
              className="text-purple-600 border-purple-300 hover:bg-purple-100"
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Sync
            </Button>
          </div>
        </div>
        
        {/* Message informatif sur l'utilisation du taux */}
        <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-md border border-blue-200 dark:border-blue-700">
          <div className="text-xs text-blue-700 dark:text-blue-300">
            <strong>💡 Info :</strong> Ce taux est automatiquement utilisé pour convertir toutes les dépenses USD → MAD dans :
            <ul className="mt-1 ml-4 list-disc">
              <li>Attribution des dépenses par produit/pays</li>
              <li>Calculs de rentabilité Marketing</li>
              <li>Tableaux de performance et résumés</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
