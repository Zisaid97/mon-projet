
import { useState, useCallback, useEffect, useMemo } from "react";
import { format } from "date-fns";
import { useMarketingForm } from "./useMarketingForm";
import { useMarketingData } from "./useMarketingData";
import { useMarketingDataSync } from "./useMarketingDataSync";
import { useExchangeRateSync } from "./useExchangeRateSync";
import { useAuth } from "./useAuth";
import { calculateResults, calculateMonthlyResume } from "@/utils/marketingCalculations";

export function useMarketingPage() {
  const { user } = useAuth();
  const { exchangeRate, syncAllRates } = useExchangeRateSync();
  
  // Get marketing data
  const {
    data: monthData,
    loading,
    savePerformanceData,
    deletePerformanceData,
    updateDeliveries,
    updateMargin,
  } = useMarketingData(user);
  
  // Get form state
  const {
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
    isLoadingExistingData,
    loadExistingDataForDate,
    hasInitializedRef,
    previousDateRef,
  } = useMarketingForm();

  // Data sync for auto-save
  useMarketingDataSync({
    date,
    spendMAD,
    leads,
    deliveries,
    marginPerOrderMAD,
    isLoadingExistingData,
    monthData: monthData || [],
    loadExistingDataForDate,
    hasInitializedRef,
    previousDateRef,
    savePerformanceData,
    exchangeRate: exchangeRate || 10,
  });

  // Calculate marketing results - se recalcule à chaque changement
  const marketingResults = useMemo(() => {
    console.log("[Debug] Recalcul des résultats marketing");
    return calculateResults(
      spendMAD,
      leads,
      deliveries,
      marginPerOrderMAD,
      exchangeRate || 10
    );
  }, [spendMAD, leads, deliveries, marginPerOrderMAD, exchangeRate]);

  // Calculate monthly resume - se recalcule automatiquement
  const monthlyResume = useMemo(() => {
    console.log("[Debug] Recalcul du résumé mensuel", { 
      dataLength: monthData?.length || 0, 
      exchangeRate 
    });
    return calculateMonthlyResume(monthData || [], exchangeRate || 10);
  }, [monthData, exchangeRate]);

  // Force synchronisation when exchange rate changes
  useEffect(() => {
    if (exchangeRate && date && monthData?.length > 0) {
      const currentDateString = format(date, "yyyy-MM-dd");
      console.log("[Debug] Taux de change modifié, re-synchronisation des données");
      loadExistingDataForDate(currentDateString, monthData, exchangeRate);
    }
  }, [exchangeRate, date, monthData, loadExistingDataForDate]);

  // Computed properties
  const selectedDateIsFuture = date ? date > new Date() : false;
  const hasDataForSelectedDate = date && monthData ? 
    monthData.some(item => item.date === format(date, "yyyy-MM-dd")) : false;
  const isConnected = !!user;

  // Delete handler
  const onDeleteData = useCallback(async () => {
    if (!date || !monthData) return;
    
    const dateString = format(date, "yyyy-MM-dd");
    const dataToDelete = monthData.find(item => item.date === dateString);
    
    if (dataToDelete) {
      await deletePerformanceData(dataToDelete.id);
    }
  }, [date, monthData, deletePerformanceData]);

  // Update deliveries handler
  const onUpdateDeliveries = useCallback(async (id: string, newDeliveries: number) => {
    console.log("[Debug] Mise à jour des livraisons, forçage de la synchronisation");
    await updateDeliveries(id, newDeliveries);
  }, [updateDeliveries]);

  // Update margin handler
  const onUpdateMargin = useCallback(async (id: string, newMargin: number) => {
    console.log("[Debug] Mise à jour de la marge, forçage de la synchronisation");
    await updateMargin(id, newMargin);
  }, [updateMargin]);

  return {
    // Date state
    date,
    setDate,
    // Form state
    spendMAD,
    setSpendMAD,
    leads,
    setLeads,
    deliveries,
    setDeliveries,
    marginPerOrderMAD,
    setMarginPerOrderMAD,
    // Data state
    monthData: monthData || [],
    loading,
    // Calculated results
    marketingResults,
    monthlyResume,
    // Validation
    selectedDateIsFuture,
    hasDataForSelectedDate,
    // Actions
    onDeleteData,
    onUpdateDeliveries,
    onUpdateMargin,
    // Exchange rate
    exchangeRate,
    syncAllRates,
    // User state
    isConnected,
  };
}
