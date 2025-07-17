
import AnalysisFilters from "@/components/product-analysis/AnalysisFilters";
import AnalysisResults from "@/components/product-analysis/AnalysisResults";
import { useProductAnalysis } from "@/hooks/useProductAnalysis";
import { RealTimeStatusIndicator } from "@/components/marketing/RealTimeStatusIndicator";

export default function ProductAnalysisDialog() {
  const {
    products,
    selectedProduct,
    setSelectedProduct,
    dateRange,
    setDateRange,
    analysisResults,
    isLoading,
  } = useProductAnalysis();

  return (
    <div className="p-1">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Analyse de Rentabilité par Produit</h2>
          <RealTimeStatusIndicator />
        </div>
        
        <AnalysisFilters
          products={products}
          selectedProduct={selectedProduct}
          onProductChange={setSelectedProduct}
          dateRange={dateRange}
          onDateChange={setDateRange}
        />

        <AnalysisResults 
          results={analysisResults} 
          isLoading={isLoading} 
          selectedProduct={selectedProduct}
        />
        
        {selectedProduct && (
          <div className="p-4 border rounded-lg bg-white dark:bg-slate-800 text-center text-gray-500 dark:text-slate-400">
            💡 Analyse de rentabilité
            <br />
            Cette analyse inclut les dépenses marketing attribuées automatiquement depuis la section Attribution Marketing.
          </div>
        )}
      </div>
    </div>
  );
}
