
import { useState, useRef, useCallback, useEffect } from "react";
import { format } from "date-fns";
import { useAutomaticMarketingData } from "./useAutomaticMarketingData";
import { useExchangeRateSync } from "./useExchangeRateSync";

const FIXED_MARGIN_PER_ORDER_MAD = 150; // Marge par défaut de 150 DH

export function useMarketingFormWithAutoData() {
  const { exchangeRate } = useExchangeRateSync();
  
  // Form inputs
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [spendMAD, setSpendMAD] = useState<number | "">("");
  const [leads, setLeads] = useState<number | "">("");
  const [deliveries, setDeliveries] = useState<number | "">("");
  const [marginPerOrderMAD, setMarginPerOrderMAD] = useState<number | "">(FIXED_MARGIN_PER_ORDER_MAD);

  // Récupération automatique des données
  const { 
    spendUSD: autoSpendUSD, 
    leads: autoLeads, 
    deliveries: autoDeliveries,
    isLoading: isLoadingAutoData,
    lastSyncAt,
    refetch: refetchAutoData
  } = useAutomaticMarketingData(date);

  // State management
  const [isLoadingExistingData, setIsLoadingExistingData] = useState(false);
  const previousDateRef = useRef<string | null>(null);
  const hasInitializedRef = useRef(false);

  // EFFET PRINCIPAL - Mise à jour avec données automatiques
  useEffect(() => {
    console.log('[Debug] 🔄 FORM UPDATE EFFECT:', {
      autoSpendUSD,
      autoLeads,
      autoDeliveries,
      exchangeRate,
      isLoadingAutoData,
      isLoadingExistingData,
      date: date ? format(date, 'yyyy-MM-dd') : null
    });

    // Ne pas mettre à jour si on charge des données existantes
    if (isLoadingExistingData || isLoadingAutoData) {
      console.log('[Debug] ⏳ SKIP - Chargement en cours');
      return;
    }

    // Attendre d'avoir un taux de change valide
    if (!exchangeRate || exchangeRate <= 0) {
      console.log('[Debug] ⏳ SKIP - Pas de taux de change');
      return;
    }

    if (date) {
      console.log('[Debug] ✅ CONDITIONS OK - Mise à jour des champs');
      
      // 1. Conversion des dépenses USD vers MAD
      if (typeof autoSpendUSD === 'number') {
        const calculatedSpendMAD = autoSpendUSD > 0 ? autoSpendUSD * exchangeRate : "";
        console.log('[Debug] 💰 SpendMAD:', autoSpendUSD, '*', exchangeRate, '=', calculatedSpendMAD);
        setSpendMAD(calculatedSpendMAD);
      } else {
        setSpendMAD("");
      }
      
      // 2. Leads
      console.log('[Debug] 👥 Leads:', autoLeads);
      setLeads(typeof autoLeads === 'number' ? (autoLeads > 0 ? autoLeads : "") : "");
      
      // 3. Deliveries
      console.log('[Debug] 📦 Deliveries:', autoDeliveries);
      setDeliveries(typeof autoDeliveries === 'number' ? (autoDeliveries > 0 ? autoDeliveries : "") : "");

      // 4. CORRECTION : Toujours maintenir la marge à 150 DH pour les nouvelles données
      console.log('[Debug] 💰 Maintien de la marge par défaut à 150 DH');
      setMarginPerOrderMAD(FIXED_MARGIN_PER_ORDER_MAD);
    }
  }, [autoSpendUSD, autoLeads, autoDeliveries, exchangeRate, isLoadingAutoData, isLoadingExistingData, date]);

  // Function to load existing data for a date
  const loadExistingDataForDate = useCallback((dateString: string, monthData: any[], exchangeRateValue: number) => {
    console.log("[Debug] 🔍 RECHERCHE données existantes pour:", dateString);
    const existingData = monthData.find((d) => d.date === dateString);
    
    if (existingData) {
      console.log("[Debug] ✅ TROUVÉ données existantes:", existingData);
      setIsLoadingExistingData(true);
      
      // Bloquer temporairement les mises à jour automatiques
      setTimeout(() => {
        setSpendMAD(existingData.spend_usd * exchangeRateValue);
        setLeads(existingData.leads);
        setDeliveries(existingData.deliveries);
        
        // CORRECTION CRITIQUE : S'assurer que la marge est toujours en DH
        let marginToUse = FIXED_MARGIN_PER_ORDER_MAD; // Valeur par défaut
        
        console.log("[Debug] 🔍 Marge stockée brute:", existingData.margin_per_order);
        
        // NOUVEAU : Logique de détection intelligente de l'unité
        if (existingData.margin_per_order >= 100 && existingData.margin_per_order <= 300) {
          // Si la valeur est entre 100-300, c'est probablement déjà en DH
          marginToUse = Math.round(existingData.margin_per_order);
          console.log("[Debug] ✅ Marge interprétée comme DH:", marginToUse);
        } else if (existingData.margin_per_order >= 10 && existingData.margin_per_order <= 30) {
          // Si la valeur est entre 10-30, c'est probablement en USD, convertir
          marginToUse = Math.round(existingData.margin_per_order * exchangeRateValue);
          console.log("[Debug] ✅ Marge convertie USD->DH:", existingData.margin_per_order, "->", marginToUse);
        } else {
          // Valeur aberrante, utiliser la valeur par défaut
          console.log("[Debug] ⚠️ Marge aberrante, utilisation par défaut:", marginToUse);
        }
        
        setMarginPerOrderMAD(marginToUse);
        setIsLoadingExistingData(false);
      }, 50);
    } else {
      console.log("[Debug] ❌ AUCUNE donnée existante - utilisation marge par défaut");
      setMarginPerOrderMAD(FIXED_MARGIN_PER_ORDER_MAD);
      setIsLoadingExistingData(false);
    }
  }, []);

  // Clear form data
  const clearFormData = useCallback(() => {
    console.log("[Debug] 🗑️ CLEAR FORM");
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
        console.log("[Debug] 📅 CHANGEMENT DATE:", {
          previous: previousDateRef.current,
          current: currentDateString
        });
        hasInitializedRef.current = false;
        previousDateRef.current = currentDateString;
        setIsLoadingExistingData(false);
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
    
    // Automatic data state
    isLoadingAutoData,
    lastSyncAt,
    refetchAutoData,
    
    // Helper functions
    loadExistingDataForDate,
    clearFormData,
    
    // Refs for tracking
    previousDateRef,
    hasInitializedRef,
  };
}
