import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useDeliveriesSummary } from "@/hooks/useDeliveriesSummary";
import { useMonthStore } from "@/stores/monthStore";
import { format, parse } from "date-fns";
import { fr } from "date-fns/locale";
import { Truck } from "lucide-react";

export function ProductDeliverySummary() {
  const { current } = useMonthStore();
  const { data, isLoading, error } = useDeliveriesSummary(current);

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-slate-800 dark:to-slate-700 border-blue-200 dark:border-slate-600 mb-6">
        <CardHeader>
          <Skeleton className="h-6 w-64" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-8 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-red-200 dark:border-red-800 mb-6">
        <CardContent className="p-4">
          <p className="text-red-600 dark:text-red-400">
            Erreur lors du chargement des données de livraison
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.total === 0) {
    return (
      <Card className="bg-gradient-to-r from-gray-50 to-slate-50 dark:from-slate-800 dark:to-slate-700 border-gray-200 dark:border-slate-600 mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <Truck className="h-5 w-5" />
            Livraisons par produit – {format(parse(current + '-01', 'yyyy-MM-dd', new Date()), 'MMMM yyyy', { locale: fr })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 dark:text-gray-400 text-center py-4">
            Aucune livraison enregistrée ce mois-ci
          </p>
        </CardContent>
      </Card>
    );
  }

  const monthLabel = format(parse(current + '-01', 'yyyy-MM-dd', new Date()), 'MMMM yyyy', { locale: fr });

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-slate-800 dark:to-slate-700 border-blue-200 dark:border-slate-600 mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-400">
          <Truck className="h-5 w-5" />
          🚚 Livraisons par produit – {monthLabel}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {data.items.map(({ productName, quantity, percentage }) => (
          <div key={productName} className="flex items-center gap-3">
            <div className="w-28 text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
              {productName}
            </div>
            <div className="flex-1">
              <Progress 
                value={percentage} 
                className="h-3 bg-gray-200 dark:bg-slate-600"
              />
            </div>
            <div className="w-20 text-right">
              <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                {quantity}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                ({percentage.toFixed(1)}%)
              </span>
            </div>
          </div>
        ))}
        
        <Separator className="my-4" />
        
        <div className="flex justify-between items-center pt-2">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Total :
          </span>
          <span className="text-lg font-bold text-green-600 dark:text-green-400">
            {data.total} livraisons
          </span>
        </div>
      </CardContent>
    </Card>
  );
}