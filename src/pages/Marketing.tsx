
import { Header } from "@/components/layout/Header";
import { MarketingFormWithAutoData } from "@/components/marketing/MarketingFormWithAutoData";
import { MarketingTabsContent } from "@/components/marketing/shared/MarketingTabsContent";
import { MonthlyBonusCard } from "@/components/bonus/MonthlyBonusCard";
import { NotesWidget } from "@/components/notes/NotesWidget";
import { UnrecognizedCampaignsAlert } from "@/components/marketing/UnrecognizedCampaignsAlert";
import { useMarketingPageWithAutoData } from "@/hooks/useMarketingPageWithAutoData";
import { useAuth } from "@/hooks/useAuth";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, ChevronDown, ChevronUp, DollarSign, Info } from "lucide-react";
import { ExchangeRateSyncStatus } from "@/components/marketing/ExchangeRateSyncStatus";
import { useMonthInitializer } from "@/hooks/useMonthInitializer";
import { DateRangeProvider } from "@/contexts/DateRangeContext";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

export default function Marketing() {
  const { user } = useAuth();
  
  // Initialize month from URL
  useMonthInitializer();
  
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

  // États pour les sections pliables
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isExchangeInfoOpen, setIsExchangeInfoOpen] = useState(false);
  const [unrecognizedCampaigns, setUnrecognizedCampaigns] = useState({
    count: 0,
    totalSpend: 0
  });

  const handleConfigureMapping = () => {
    console.log("Configuration des mappings de campagnes");
  };

  return (
    <DateRangeProvider>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-7xl mx-auto px-6 py-8">
          {/* En-tête de page professionnel */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                  <TrendingUp className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    Module Marketing
                  </h1>
                  <p className="text-gray-600 mt-1">
                    Analysez vos campagnes publicitaires et optimisez votre ROI
                  </p>
                </div>
              </div>
              
              {/* Indicateurs en haut à droite */}
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="px-3 py-1">
                  {monthData.length} jours de données
                </Badge>
                {exchangeRate && (
                  <Badge variant="outline" className="px-3 py-1">
                    <DollarSign className="h-3 w-3 mr-1" />
                    {exchangeRate.toFixed(4)} MAD/$
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Alertes pour campagnes non reconnues */}
          {unrecognizedCampaigns.count > 0 && (
            <div className="mb-6">
              <UnrecognizedCampaignsAlert 
                unrecognizedCount={unrecognizedCampaigns.count}
                totalSpendUnrecognized={unrecognizedCampaigns.totalSpend}
                onConfigureMapping={handleConfigureMapping}
              />
            </div>
          )}

          {/* Bonus mensuel */}
          <div className="mb-6">
            <MonthlyBonusCard />
          </div>

          {/* Section de saisie pliable */}
          <div className="mb-6">
            <Collapsible open={isFormOpen} onOpenChange={setIsFormOpen}>
              <Card className="shadow-sm">
                <CollapsibleTrigger asChild>
                  <div className="p-4 hover:bg-gray-50 cursor-pointer transition-colors border-b">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <TrendingUp className="h-5 w-5 text-blue-600" />
                        <h3 className="text-lg font-semibold text-gray-900">
                          📊 Saisie des Données Marketing
                        </h3>
                        <Badge variant="secondary" className="text-xs">
                          Automatisé
                        </Badge>
                      </div>
                      {isFormOpen ? (
                        <ChevronUp className="h-5 w-5 text-gray-500" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-500" />
                      )}
                    </div>
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="p-0">
                    <MarketingFormWithAutoData
                      date={date}
                      setDate={setDate}
                      spendMAD={spendMAD}
                      setSpendMAD={setSpendMAD}
                      leads={leads}
                      setLeads={setLeads}
                      deliveries={deliveries}
                      setDeliveries={setDeliveries}
                      marginPerOrderMAD={marginPerOrderMAD}
                      setMarginPerOrderMAD={setMarginPerOrderMAD}
                      selectedDateIsFuture={selectedDateIsFuture}
                      exchangeRate={exchangeRate || 10}
                      isLoadingAutoData={isLoadingAutoData}
                      lastSyncAt={lastSyncAt}
                      onRefreshAutoData={onRefreshAutoData}
                    />
                  </div>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          </div>

          {/* Onglets principaux */}
          <Tabs defaultValue="performance" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 bg-white shadow-sm">
              <TabsTrigger value="performance" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
                📊 Performance Marketing
              </TabsTrigger>
              <TabsTrigger value="attribution" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
                🎯 Attribution des Dépenses
              </TabsTrigger>
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
              FormComponent={() => null} // Le formulaire est maintenant dans la section pliable
              formProps={{}}
            />
          </Tabs>
        </main>

        {/* Barre d'informations en bas */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-10">
          <div className="max-w-7xl mx-auto px-6 py-3">
            <div className="flex items-center justify-between">
              {/* Section taux de change pliable */}
              <Collapsible open={isExchangeInfoOpen} onOpenChange={setIsExchangeInfoOpen}>
                <div className="flex items-center gap-4">
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
                      <DollarSign className="h-4 w-4" />
                      <span className="text-sm">Taux & Infos</span>
                      {isExchangeInfoOpen ? (
                        <ChevronDown className="h-3 w-3" />
                      ) : (
                        <ChevronUp className="h-3 w-3" />
                      )}
                    </Button>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent className="flex items-center gap-4">
                    <div className="text-sm text-gray-600">
                      <ExchangeRateSyncStatus />
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>

              {/* Raccourcis actions */}
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsFormOpen(!isFormOpen)}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <TrendingUp className="h-4 w-4 mr-1" />
                  {isFormOpen ? 'Masquer' : 'Saisie'}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Widget de notes */}
        <NotesWidget pageType="marketing" />
      </div>
    </DateRangeProvider>
  );
}
