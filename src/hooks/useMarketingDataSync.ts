
import { useEffect, useRef } from "react";
import { format } from "date-fns";

interface UseMarketingDataSyncProps {
  date: Date | undefined;
  spendMAD: number | "";
  leads: number | "";
  deliveries: number | "";
  marginPerOrderMAD: number | "";
  isLoadingExistingData: boolean;
  monthData: any[];
  loadExistingDataForDate: (dateString: string, monthData: any[], exchangeRate: number) => void;
  hasInitializedRef: React.MutableRefObject<boolean>;
  previousDateRef: React.MutableRefObject<string | null>;
  savePerformanceData: (data: any) => Promise<void>;
  exchangeRate: number;
}

export function useMarketingDataSync({
  date,
  spendMAD,
  leads,
  deliveries,
  marginPerOrderMAD,
  isLoadingExistingData,
  monthData,
  loadExistingDataForDate,
  hasInitializedRef,
  previousDateRef,
  savePerformanceData,
  exchangeRate,
}: UseMarketingDataSyncProps) {
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load existing data when date or monthData changes
  useEffect(() => {
    if (date && monthData.length > 0 && exchangeRate > 0) {
      const dateString = format(date, "yyyy-MM-dd");
      
      if (previousDateRef.current !== dateString && !hasInitializedRef.current) {
        console.log("[Debug] 📅 Chargement données pour nouvelle date:", dateString);
        loadExistingDataForDate(dateString, monthData, exchangeRate);
        hasInitializedRef.current = true;
      }
    }
  }, [date, monthData, exchangeRate, loadExistingDataForDate, hasInitializedRef, previousDateRef]);

  // Auto-save data when form values change
  useEffect(() => {
    // Skip auto-save during data loading
    if (isLoadingExistingData || !date || !exchangeRate) {
      console.log("[Debug] ⏭️ SKIP AUTO-SAVE - Chargement en cours ou données manquantes");
      return;
    }

    // Skip if essential values are empty
    if (spendMAD === "" && leads === "" && deliveries === "") {
      console.log("[Debug] ⏭️ SKIP AUTO-SAVE - Toutes les valeurs sont vides");
      return;
    }

    // Clear previous timeout
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    // Set new timeout for auto-save
    autoSaveTimeoutRef.current = setTimeout(async () => {
      try {
        const dateString = format(date, "yyyy-MM-dd");
        
        // 🔧 FIX BUG #2: Utilisation cohérente du taux moyen mensuel
        // La marge reste en DH mais la dépense utilise le taux moyen
        const marginDH = typeof marginPerOrderMAD === "number" ? marginPerOrderMAD : 150;
        
        const dataToSave = {
          date: dateString,
          spend_usd: typeof spendMAD === "number" ? spendMAD / exchangeRate : 0, // Conversion avec taux moyen
          leads: typeof leads === "number" ? leads : 0,
          deliveries: typeof deliveries === "number" ? deliveries : 0,
          margin_per_order: marginDH, // Stockée directement en DH
        };

        console.log("[Debug] 💾 AUTO-SAVE avec taux moyen mensuel:", {
          ...dataToSave,
          exchangeRateUsed: exchangeRate,
          note: "Utilisation du taux moyen mensuel pour conversion USD"
        });

        await savePerformanceData(dataToSave);
      } catch (error) {
        console.error("[Debug] ❌ Erreur lors de l'auto-save:", error);
      }
    }, 1500); // 1.5 seconds delay

    // Cleanup timeout on unmount
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [date, spendMAD, leads, deliveries, marginPerOrderMAD, isLoadingExistingData, savePerformanceData, exchangeRate]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);
}
