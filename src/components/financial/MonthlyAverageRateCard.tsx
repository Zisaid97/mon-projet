
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useMonthlyRateDetails } from "@/hooks/useMonthlyAverageRate";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { ExchangeRateRecalculationButton } from "./ExchangeRateRecalculationButton";

interface MonthlyAverageRateCardProps {
  selectedDate?: Date;
}

export function MonthlyAverageRateCard({ selectedDate }: MonthlyAverageRateCardProps) {
  const { data: rateDetails } = useMonthlyRateDetails(selectedDate);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleForceSync = () => {
    queryClient.invalidateQueries({ queryKey: ["monthly_average_rate"] });
    queryClient.invalidateQueries({ queryKey: ["monthly_rate_details"] });
    queryClient.invalidateQueries({ queryKey: ["exchange_rate"] });
    toast({
      title: "Synchronisation forcée ✅",
      description: "Les taux de change ont été resynchronisés",
    });
  };

  const currentMonth = format(selectedDate || new Date(), "MMMM yyyy", { locale: fr });

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-700">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg text-blue-800 dark:text-blue-400 flex items-center gap-2">
            💱 Taux de change moyen - {currentMonth}
          </CardTitle>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleForceSync}
              className="text-blue-600 border-blue-300 hover:bg-blue-100"
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Sync
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {rateDetails ? (
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-700 dark:text-blue-300">
                {Number(rateDetails.average_rate).toFixed(4)} MAD/$
              </div>
              <div className="text-sm text-blue-600 dark:text-blue-400">
                Taux moyen calculé automatiquement
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <div className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                  {rateDetails.entries_count}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Entrées</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-green-600 dark:text-green-400">
                  {Number(rateDetails.total_usd).toFixed(2)}$
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Total USD</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-orange-600 dark:text-orange-400">
                  {Number(rateDetails.total_mad).toFixed(2)} MAD
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Total MAD</div>
              </div>
            </div>

            <div className="flex justify-center">
              <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                🔄 Synchronisé avec Marketing
              </Badge>
            </div>

            {/* 🔧 FIX BUG #2: Bouton de recalcul des conversions */}
            <div className="pt-3 border-t border-blue-200 dark:border-blue-700">
              <div className="flex justify-center">
                <ExchangeRateRecalculationButton />
              </div>
              <p className="text-xs text-blue-600 dark:text-blue-400 text-center mt-2">
                Recalcule toutes les conversions USD → MAD dans la plateforme
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <div className="text-2xl font-bold text-gray-400 dark:text-gray-600">
              10.00 MAD/$
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-500">
              Taux par défaut (aucune donnée ce mois)
            </div>
            <Badge variant="outline" className="mt-2">
              ⚠️ Non synchronisé
            </Badge>
            
            {/* Bouton de recalcul même sans données */}
            <div className="pt-3 mt-3 border-t border-gray-200">
              <ExchangeRateRecalculationButton />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
