
import { useState, useRef, useCallback, useEffect } from "react";
import { format } from "date-fns";

const FIXED_MARGIN_PER_ORDER_MAD = 150; // Marge par défaut de 150 DH

export function useMarketingForm() {
  // Form inputs - spendMAD stocke en MAD, marginPerOrderMAD en DH absolu
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [spendMAD, setSpendMAD] = useState<number | "">("");
  const [leads, setLeads] = useState<number | "">("");
  const [deliveries, setDeliveries] = useState<number | "">("");
  const [marginPerOrderMAD, setMarginPerOrderMAD] = useState<number | "">(FIXED_MARGIN_PER_ORDER_MAD);

  // State management for loading protection
  const [isLoadingExistingData, setIsLoadingExistingData] = useState(false);
  const previousDateRef = useRef<string | null>(null);
  const hasInitializedRef = useRef(false);

  // Function to load existing data for a date
  const loadExistingDataForDate = useCallback((dateString: string, monthData: any[], exchangeRate: number) => {
    console.log("[Debug] Recherche de données existantes pour:", dateString);
    const existingData = monthData.find((d) => d.date === dateString);
    
    if (existingData) {
      console.log("[Debug] Données trouvées, chargement:", existingData);
      setIsLoadingExistingData(true);
      // Convertir les données USD stockées en MAD pour l'affichage
      setSpendMAD(existingData.spend_usd * exchangeRate);
      setLeads(existingData.leads);
      setDeliveries(existingData.deliveries);
      
      // SOLUTION FINALE : Charger la marge directement en DH
      // La valeur stockée est maintenant directement en DH
      const marginMAD = Math.round(existingData.margin_per_order);
      setMarginPerOrderMAD(marginMAD);
      setIsLoadingExistingData(false);
    } else {
      console.log("[Debug] Aucune donnée trouvée, champs vides");
      setSpendMAD("");
      setLeads("");
      setDeliveries("");
      setMarginPerOrderMAD(FIXED_MARGIN_PER_ORDER_MAD);
    }
  }, []);

  // Clear form data
  const clearFormData = useCallback(() => {
    setSpendMAD("");
    setLeads("");
    setDeliveries("");
    setMarginPerOrderMAD(FIXED_MARGIN_PER_ORDER_MAD);
  }, []);

  // Reset initialization flag when date changes
  useEffect(() => {
    if (date) {
      const currentDateString = format(date, "yyyy-MM-dd");
      if (previousDateRef.current !== currentDateString) {
        hasInitializedRef.current = false;
        previousDateRef.current = currentDateString;
      }
    }
  }, [date]);

  return {
    // Form state
    date,
    setDate,
    spendMAD,
    setSpendMAD,
    leads,
    setLeads,
    deliveries,
    setDeliveries,
    marginPerOrderMAD,
    setMarginPerOrderMAD,
    
    // Loading state
    isLoadingExistingData,
    setIsLoadingExistingData,
    
    // Helper functions
    loadExistingDataForDate,
    clearFormData,
    
    // Refs for tracking
    previousDateRef,
    hasInitializedRef,
  };
}
