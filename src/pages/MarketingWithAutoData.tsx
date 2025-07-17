
import { Header } from "@/components/layout/Header";
import { MarketingFormWithAutoData } from "@/components/marketing/MarketingFormWithAutoData";
import { MarketingTabsContent } from "@/components/marketing/shared/MarketingTabsContent";
import { NotesWidget } from "@/components/notes/NotesWidget";
import { UnrecognizedCampaignsAlert } from "@/components/marketing/UnrecognizedCampaignsAlert";
import { useMarketingPageWithAutoData } from "@/hooks/useMarketingPageWithAutoData";
import { useAuth } from "@/hooks/useAuth";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Zap } from "lucide-react";
import { ExchangeRateSyncStatus } from "@/components/marketing/ExchangeRateSyncStatus";
import { DateRangeProvider } from "@/contexts/DateRangeContext";
import { useState } from "react";

export default function MarketingWithAutoData() {
  const { user } = useAuth();
  
  const {
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
    monthData,
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
    // User state
    isConnected,
    // Auto data state
    isLoadingAutoData,
    lastSyncAt,
    onRefreshAutoData,
  } = useMarketingPageWithAutoData();

  // 🔧 FIX BUG #1: État pour les campagnes non reconnues
  const [unrecognizedCampaigns, setUnrecognizedCampaigns] = useState({
    count: 0,
    totalSpend: 0
  });

  const handleConfigureMapping = () => {
    // TODO: Ouvrir une modale de configuration des mappings
    console.log("Configuration des mappings de campagnes");
  };

  return (
    <DateRangeProvider>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-7xl mx-auto px-6 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-white rounded-lg border border-gray-200">
                <Zap className="h-6 w-6 text-yellow-500" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Module Marketing - Automatisé
                </h1>
                <p className="text-gray-600 mt-1">
                  Saisie automatique des données depuis Meta Ads et Ventes
                </p>
              </div>
            </div>
          </div>

          {/* Statut de synchronisation des taux */}
          <div className="mb-6">
            <ExchangeRateSyncStatus />
          </div>

          {/* 🔧 FIX BUG #1: Alerte pour campagnes non reconnues */}
          {unrecognizedCampaigns.count > 0 && (
            <div className="mb-6">
              <UnrecognizedCampaignsAlert 
                unrecognizedCount={unrecognizedCampaigns.count}
                totalSpendUnrecognized={unrecognizedCampaigns.totalSpend}
                onConfigureMapping={handleConfigureMapping}
              />
            </div>
          )}

          {/* Onglets principaux */}
          <Tabs defaultValue="performance" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="performance">🤖 Performance Automatisée</TabsTrigger>
              <TabsTrigger value="attribution">🎯 Attribution des Dépenses</TabsTrigger>
            </TabsList>

            <MarketingTabsContent
              monthData={monthData}
              marketingResults={marketingResults}
              monthlyResume={monthlyResume}
              exchangeRate={exchangeRate || 10}
              loading={loading}
              onUpdateDeliveries={onUpdateDeliveries}
              onUpdateMargin={onUpdateMargin}
              onDeleteData={onDeleteData}
              FormComponent={MarketingFormWithAutoData}
              formProps={{
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
                selectedDateIsFuture,
                exchangeRate,
                isLoadingAutoData,
                lastSyncAt,
                onRefreshAutoData
              }}
            />
          </Tabs>
        </main>

        {/* Widget de notes */}
        <NotesWidget pageType="marketing" />
      </div>
    </DateRangeProvider>
  );
}
