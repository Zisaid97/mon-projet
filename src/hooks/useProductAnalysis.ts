
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useProducts } from "./useProducts";
import { useAuth } from "./useAuth";
import { Product } from "@/types/product";
import { ProfitRow } from "@/types/profit";
import { type DateRange } from "react-day-picker";
import { subDays } from "date-fns";
import { useExchangeRateSync } from "./useExchangeRateSync";
import { useRealTimeAttributions } from "./useRealTimeAttributions";

export interface ProductAnalysisResult {
  totalDeliveries: number;
  totalRevenue: number;
  marketingSpend: number | null;
  netProfit: number | null;
  deliveryRate: number | null;
  cpl: number | null;
  cpd: number | null;
}

// Interface pour les données d'attribution marketing
interface MarketingSpendAttribution {
  id: string;
  user_id: string;
  date: string;
  country: string;
  product: string;
  spend_usd: number;
  spend_dh: number;
  source: string;
}

const fetchProfitDataForProduct = async (
  userId: string,
  productName: string,
  dateRange: DateRange
) => {
  if (!productName || !dateRange.from) return [];

  const { data, error } = await supabase
    .from("profit_tracking")
    .select("*")
    .eq("user_id", userId)
    .eq("product_name", productName)
    .gte("date", dateRange.from.toISOString().split("T")[0])
    .lte("date", (dateRange.to ?? dateRange.from).toISOString().split("T")[0]);

  if (error) throw new Error(error.message);
  return (data as ProfitRow[]) || [];
};

const fetchMarketingSpendForProduct = async (
  userId: string,
  productName: string,
  dateRange: DateRange,
  exchangeRate: number
) => {
  if (!productName || !dateRange.from) return [];

  const { data, error } = await supabase
    .from("marketing_spend_attrib")
    .select("*")
    .eq("user_id", userId)
    .eq("product", productName)
    .gte("date", dateRange.from.toISOString().split("T")[0])
    .lte("date", (dateRange.to ?? dateRange.from).toISOString().split("T")[0]);

  if (error) throw new Error(error.message);
  
  // 🔧 FIX BUG #2: Recalculer les montants MAD avec le taux moyen mensuel
  const dataWithRecalculatedMAD = (data as MarketingSpendAttribution[])?.map(item => ({
    ...item,
    spend_dh: item.spend_usd * exchangeRate // Recalcul avec taux moyen mensuel
  })) || [];
  
  return dataWithRecalculatedMAD;
};

export function useProductAnalysis() {
  const { user } = useAuth();
  const { data: products = [] } = useProducts();
  const { lastUpdate } = useRealTimeAttributions();
  
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  const [forceRefresh, setForceRefresh] = useState(0);

  // 🔧 FIX BUG #2: Utiliser le taux moyen mensuel
  const { exchangeRate } = useExchangeRateSync(dateRange?.from);

  const { data: profitData, isLoading: isProfitLoading } = useQuery({
    queryKey: ["product_analysis_profit", user?.id, selectedProduct?.name, dateRange, forceRefresh],
    queryFn: () => fetchProfitDataForProduct(user!.id, selectedProduct!.name, dateRange!),
    enabled: !!user && !!selectedProduct && !!dateRange?.from,
  });

  const { data: spendData, isLoading: isSpendLoading } = useQuery({
    queryKey: ["product_analysis_marketing_spend", user?.id, selectedProduct?.name, dateRange, exchangeRate, forceRefresh],
    queryFn: () => fetchMarketingSpendForProduct(user!.id, selectedProduct!.name, dateRange!, exchangeRate),
    enabled: !!user && !!selectedProduct && !!dateRange?.from && !!exchangeRate,
  });

  // Mise à jour automatique lors des changements en temps réel
  useEffect(() => {
    if (lastUpdate && selectedProduct) {
      // Vérifier si la mise à jour concerne le produit sélectionné
      if (lastUpdate.productCountry.product === selectedProduct.name) {
        console.log('🔄 Actualisation de l\'analyse de rentabilité pour:', selectedProduct.name);
        // Debounce pour éviter trop de rechargements
        const timer = setTimeout(() => {
          setForceRefresh(prev => prev + 1);
        }, 500);
        
        return () => clearTimeout(timer);
      }
    }
  }, [lastUpdate, selectedProduct]);

  const isLoading = isProfitLoading || isSpendLoading;

  const [analysisResults, setAnalysisResults] = useState<ProductAnalysisResult>({
    totalDeliveries: 0,
    totalRevenue: 0,
    marketingSpend: null,
    netProfit: null,
    deliveryRate: null,
    cpl: null,
    cpd: null,
  });

  useEffect(() => {
    if (profitData && spendData !== undefined) {
      const totalDeliveries = profitData.reduce((acc, row) => acc + row.quantity, 0);
      const totalRevenue = profitData.reduce((acc, row) => acc + row.commission_total, 0);
      
      // 🔧 FIX BUG #2: Utiliser les montants MAD recalculés avec le taux moyen
      const totalSpend = spendData.reduce((acc, spend) => acc + spend.spend_dh, 0);
      
      // Calculer le profit net (revenus - dépenses)
      const netProfit = totalSpend > 0 ? totalRevenue - totalSpend : null;
      
      console.log(`[ProductAnalysis] Calcul avec taux moyen: ${exchangeRate}`, {
        totalDeliveries,
        totalRevenue,
        totalSpend,
        netProfit,
        exchangeRateUsed: exchangeRate
      });
      
      setAnalysisResults({
        totalDeliveries,
        totalRevenue,
        marketingSpend: totalSpend > 0 ? totalSpend : null,
        netProfit,
        deliveryRate: null, // Nous n'avons pas les données de leads pour calculer le taux
        cpl: null,
        cpd: totalDeliveries > 0 && totalSpend > 0 ? totalSpend / totalDeliveries : null,
      });
    } else if (!selectedProduct) {
      setAnalysisResults({
        totalDeliveries: 0,
        totalRevenue: 0,
        marketingSpend: null,
        netProfit: null,
        deliveryRate: null,
        cpl: null,
        cpd: null,
      });
    }
  }, [profitData, spendData, selectedProduct, exchangeRate]);

  return {
    products,
    selectedProduct,
    setSelectedProduct,
    dateRange,
    setDateRange,
    analysisResults,
    isLoading,
    exchangeRate, // Exposer le taux utilisé pour la transparence
  };
}
