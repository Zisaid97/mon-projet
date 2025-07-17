
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Info, TrendingUp, TrendingDown, AlertTriangle, Loader2, Package } from "lucide-react";
import { ProductAnalysisResult } from "@/hooks/useProductAnalysis";
import { Product } from "@/types/product";

interface AnalysisResultsProps {
  results: ProductAnalysisResult;
  isLoading: boolean;
  selectedProduct: Product | null;
}

const StatCard = ({ 
  title, 
  value, 
  isLoading, 
  isProfit = false,
  className = ""
}: { 
  title: string, 
  value: string | number, 
  isLoading: boolean,
  isProfit?: boolean,
  className?: string 
}) => (
  <Card className={`transition-all duration-300 hover:shadow-md ${className}`}>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-gray-600 dark:text-slate-400">{title}</CardTitle>
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
      ) : (
        isProfit && typeof value === 'number' && (
          value >= 0 ? (
            <TrendingUp className="h-4 w-4 text-green-600" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-600" />
          )
        )
      )}
    </CardHeader>
    <CardContent>
      {isLoading ? (
        <Skeleton className="h-8 w-24" />
      ) : (
        <div className={`text-2xl font-bold transition-colors duration-200 ${
          isProfit && typeof value === 'number' 
            ? value >= 0 ? 'text-green-600' : 'text-red-600'
            : ''
        }`}>
          {value}
        </div>
      )}
    </CardContent>
  </Card>
);

export default function AnalysisResults({ results, isLoading, selectedProduct }: AnalysisResultsProps) {
  if (!selectedProduct) {
    return (
      <div className="p-6 border rounded-lg bg-white dark:bg-slate-800 text-center text-gray-500 dark:text-slate-400 transition-all duration-300">
        <div className="animate-pulse">
          <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>Veuillez sélectionner un produit pour voir l'analyse.</p>
        </div>
      </div>
    )
  }

  const formatCurrency = (value: number | null) => {
    if (value === null) return "N/A";
    return `${value.toFixed(2)} DH`;
  };

  const formatCPD = (cpd: number | null) => {
    if (cpd === null) return "N/A";
    return `${cpd.toFixed(2)} DH`;
  };

  // Badge d'alerte pour delivery rate < 10%
  const showDeliveryAlert = results.deliveryRate !== null && results.deliveryRate < 10;
  
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Badge d'alerte pour delivery rate faible */}
      {showDeliveryAlert && (
        <Alert className="border-orange-200 bg-orange-50 dark:bg-orange-950 animate-pulse">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertTitle className="text-orange-800 dark:text-orange-200">Attention</AlertTitle>
          <AlertDescription className="text-orange-700 dark:text-orange-300">
            Taux de livraison très faible ({results.deliveryRate?.toFixed(1)}%). 
            Optimisation recommandée.
          </AlertDescription>
        </Alert>
      )}

      {/* Statistiques principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Total livraisons" 
          value={results.totalDeliveries} 
          isLoading={isLoading} 
          className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20"
        />
        <StatCard 
          title="Revenu généré (DH)" 
          value={formatCurrency(results.totalRevenue)} 
          isLoading={isLoading} 
          className="border-green-200 bg-green-50/50 dark:bg-green-950/20"
        />
        <StatCard 
          title="Dépenses attribuées (DH)" 
          value={formatCurrency(results.marketingSpend)} 
          isLoading={isLoading} 
          className="border-orange-200 bg-orange-50/50 dark:bg-orange-950/20"
        />
        <StatCard 
          title="Profit net (DH)" 
          value={formatCurrency(results.netProfit)} 
          isLoading={isLoading}
          isProfit={true}
          className="border-purple-200 bg-purple-50/50 dark:bg-purple-950/20"
        />
      </div>

      {/* Métriques additionnelles avec animations */}
      {results.marketingSpend !== null && (
        <div className="grid gap-4 md:grid-cols-3 animate-slide-up">
          <StatCard 
            title="CPD (Coût par livraison)" 
            value={formatCPD(results.cpd)} 
            isLoading={isLoading} 
            className="border-indigo-200 bg-indigo-50/50 dark:bg-indigo-950/20"
          />
          <StatCard 
            title="ROI (%)" 
            value={results.netProfit !== null && results.marketingSpend !== null && results.marketingSpend > 0 
              ? `${((results.netProfit / results.marketingSpend) * 100).toFixed(1)}%`
              : "N/A"
            } 
            isLoading={isLoading}
            isProfit={true}
            className="border-teal-200 bg-teal-50/50 dark:bg-teal-950/20"
          />
          <StatCard 
            title="Marge par livraison (DH)" 
            value={results.totalDeliveries > 0 
              ? `${(results.totalRevenue / results.totalDeliveries).toFixed(2)} DH`
              : "N/A"
            } 
            isLoading={isLoading} 
            className="border-cyan-200 bg-cyan-50/50 dark:bg-cyan-950/20"
          />
        </div>
      )}

      {/* Analyse de rentabilité avec animation */}
      <Alert className="transition-all duration-300 hover:shadow-sm">
        <Info className="h-4 w-4" />
        <AlertTitle>💡 Analyse de rentabilité</AlertTitle>
        <AlertDescription>
          {results.marketingSpend !== null ? (
            <div className="space-y-2">
              <p>
                Cette analyse inclut les dépenses marketing attribuées automatiquement depuis la section Attribution Marketing.
              </p>
              {results.netProfit !== null && (
                <div className="flex items-center gap-2 mt-2">
                  {results.netProfit >= 0 ? (
                    <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
                      ✅ Produit rentable (+{results.netProfit.toFixed(2)} DH)
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-200">
                      ❌ Produit en perte ({results.netProfit.toFixed(2)} DH)
                    </Badge>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <p>
                Aucune dépense marketing n'a été attribuée à ce produit pour la période sélectionnée.
              </p>
              <Badge variant="outline" className="text-blue-600">
                💡 Utilisez le module Marketing → Attribution des Dépenses pour améliorer l'analyse
              </Badge>
            </div>
          )}
        </AlertDescription>
      </Alert>

      {/* Indicateur de chargement global */}
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center gap-3 text-gray-500">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Calcul des métriques en temps réel...</span>
          </div>
        </div>
      )}
    </div>
  );
}
