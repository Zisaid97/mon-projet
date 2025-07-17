
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, DollarSign } from "lucide-react";

interface DelayedDeliveriesSummaryProps {
  totalQuantity: number;
  totalCommission: number;
}

export default function DelayedDeliveriesSummary({ 
  totalQuantity, 
  totalCommission 
}: DelayedDeliveriesSummaryProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <Card className="border-purple-200 bg-purple-50 dark:bg-purple-900/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300 flex items-center gap-2">
            <Package className="h-4 w-4" />
            Livraisons Décalées du Jour
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-800 dark:text-purple-200">
            {totalQuantity}
          </div>
          <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
            Nombre total de livraisons
          </p>
        </CardContent>
      </Card>

      <Card className="border-green-200 bg-green-50 dark:bg-green-900/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300 flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Commission Totale
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-800 dark:text-green-200">
            {totalCommission.toFixed(2)} DH
          </div>
          <p className="text-xs text-green-600 dark:text-green-400 mt-1">
            Revenus des livraisons décalées
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
