
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface ProductDeliveriesCardProps {
  productDeliveries: { [productName: string]: number };
  isLoading?: boolean;
}

export function ProductDeliveriesCard({ productDeliveries, isLoading }: ProductDeliveriesCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-blue-500" />
            Livraisons par Produit
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="w-full h-32" />
        </CardContent>
      </Card>
    );
  }

  const products = Object.entries(productDeliveries).sort((a, b) => b[1] - a[1]);
  const totalDeliveries = Object.values(productDeliveries).reduce((sum, qty) => sum + qty, 0);

  if (products.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-blue-500" />
            Livraisons par Produit
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-4">Aucune livraison ce mois-ci</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5 text-blue-500" />
          Livraisons par Produit
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {products.map(([productName, quantity]) => {
          const percentage = totalDeliveries > 0 ? (quantity / totalDeliveries) * 100 : 0;
          
          return (
            <div key={productName} className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {productName}
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {quantity} ({percentage.toFixed(1)}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
        
        <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-between text-sm font-semibold">
            <span>Total :</span>
            <span>{totalDeliveries} livraisons</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
