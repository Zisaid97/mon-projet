
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { CalendarIcon, DollarSign, Edit3, Users, Package, Info, Zap, RefreshCw } from "lucide-react";
import { AutoDataIndicator } from "./AutoDataIndicator";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface MarketingFormWithAutoDataProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  spendMAD: number | "";
  setSpendMAD: (value: number | "") => void;
  leads: number | "";
  setLeads: (value: number | "") => void;
  deliveries: number | "";
  setDeliveries: (value: number | "") => void;
  marginPerOrderMAD: number | "";
  setMarginPerOrderMAD: (value: number | "") => void;
  selectedDateIsFuture: boolean;
  exchangeRate: number;
  isLoadingAutoData: boolean;
  lastSyncAt?: Date;
  onRefreshAutoData: () => void;
}

export function MarketingFormWithAutoData({
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
  onRefreshAutoData,
}: MarketingFormWithAutoDataProps) {
  // Calcul automatique de la conversion USD
  const spendUSD = typeof spendMAD === "number" ? spendMAD / exchangeRate : "";

  // Debug log pour vérifier les valeurs reçues
  React.useEffect(() => {
    console.log('[Debug] 🎯 PROPS FORM reçues:', {
      date: date ? format(date, 'yyyy-MM-dd') : null,
      spendMAD,
      leads,
      deliveries,
      isLoadingAutoData,
      lastSyncAt,
      exchangeRate
    });
  }, [date, spendMAD, leads, deliveries, isLoadingAutoData, lastSyncAt, exchangeRate]);

  // Fonction pour gérer le changement du montant en USD
  const handleSpendUSDChange = (value: string) => {
    console.log('[Debug] 💰 Changement dépenses USD:', value);
    if (value === "") {
      setSpendMAD("");
    } else {
      const usdAmount = parseFloat(value);
      if (!isNaN(usdAmount)) {
        const madAmount = usdAmount * exchangeRate;
        console.log('[Debug] 🔄 Conversion manuelle:', { usdAmount, exchangeRate, madAmount });
        setSpendMAD(madAmount);
      }
    }
  };

  // Fonction pour gérer la marge - garder les nombres entiers
  const handleMarginChange = (value: string) => {
    if (value === "") {
      setMarginPerOrderMAD("");
    } else {
      const intValue = parseInt(value);
      if (!isNaN(intValue) && intValue >= 0) {
        setMarginPerOrderMAD(intValue);
      }
    }
  };

  // Conversion de la marge en USD pour affichage
  const marginUSD = typeof marginPerOrderMAD === "number" ? (marginPerOrderMAD / exchangeRate) : 0;

  return (
    <TooltipProvider>
      <Card className="bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            📊 Saisie Automatique des Données Marketing
          </CardTitle>
          
          {/* Notification d'état améliorée */}
          <div className={`p-3 rounded-lg border ${
            isLoadingAutoData 
              ? 'bg-yellow-50 border-yellow-200' 
              : 'bg-blue-50 border-blue-200'
          }`}>
            <div className="flex items-center gap-2 text-sm">
              {isLoadingAutoData ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin text-yellow-600" />
                  <span className="text-yellow-800 font-medium">🔄 Récupération en cours...</span>
                </>
              ) : (
                <>
                  <Info className="h-4 w-4 text-blue-600" />
                  <span className="text-blue-800 font-medium">Mode automatique activé :</span>
                </>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={onRefreshAutoData}
                disabled={isLoadingAutoData}
                className="h-6 w-6 p-0 ml-auto"
              >
                <RefreshCw className={`h-3 w-3 ${isLoadingAutoData ? 'animate-spin' : ''}`} />
              </Button>
            </div>
            <div className="text-xs text-blue-600 mt-1">
              Les dépenses, leads et livraisons sont récupérés automatiquement depuis Meta Ads et Ventes
            </div>
            {lastSyncAt && (
              <div className="text-xs text-gray-500 mt-1">
                Dernière sync: {format(lastSyncAt, 'HH:mm:ss')}
              </div>
            )}
          </div>

          {/* Zone de debug visible */}
          <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded border font-mono">
            <div className="font-bold text-gray-700 mb-1">🔍 Debug Info:</div>
            <div>SpendMAD: {JSON.stringify(spendMAD)} | Leads: {JSON.stringify(leads)} | Deliveries: {JSON.stringify(deliveries)}</div>
            <div>Loading: {isLoadingAutoData.toString()} | ExchangeRate: {exchangeRate}</div>
            <div>Date: {date ? format(date, 'yyyy-MM-dd') : 'null'}</div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Sélection de date */}
          <div className="space-y-2">
            <Label>Date de la campagne</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP", { locale: fr }) : "Choisir une date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                  locale={fr}
                />
              </PopoverContent>
            </Popover>
            {selectedDateIsFuture && (
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                ⚠️ Date future sélectionnée
              </Badge>
            )}
          </div>

          {/* Contenu principal en deux colonnes */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Colonne 1 : Dépenses automatiques */}
            <div className="space-y-4">
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <h3 className="font-medium text-purple-800 mb-4 flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  💵 Dépenses (Auto-importées)
                </h3>
                
                {/* Montant en $ (modifiable) */}
                <div className="space-y-2 mb-4">
                  <Label className="text-sm font-medium">Montant dépensé en $ (Meta Ads)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Ex: 100"
                    value={spendUSD}
                    onChange={(e) => handleSpendUSDChange(e.target.value)}
                    className="text-right"
                    disabled={isLoadingAutoData}
                  />
                  <AutoDataIndicator 
                    isLoading={isLoadingAutoData}
                    lastSyncAt={lastSyncAt}
                    onRefresh={onRefreshAutoData}
                    dataType="spending"
                  />
                </div>

                {/* Montant en MAD (conversion automatique) */}
                <div className="space-y-2 mb-4">
                  <Label className="text-sm font-medium text-gray-600">Montant en MAD (conversion auto)</Label>
                  <Input
                    type="number"
                    value={spendMAD}
                    readOnly
                    className="text-right bg-gray-50 border-gray-200 text-gray-600"
                    placeholder="Conversion automatique"
                  />
                </div>

                {/* Taux synchronisé */}
                <div className="text-sm text-purple-600 bg-purple-50 p-2 rounded border border-purple-200">
                  <strong>Taux : {exchangeRate ? exchangeRate.toFixed(4) : 'N/A'} MAD/$</strong>
                  <div className="text-xs text-purple-500 mt-1">
                    Synchronisé depuis la page Finances
                  </div>
                </div>
              </div>

              {/* Marge par commande (éditable) */}
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                <div className="flex items-center gap-2 mb-3">
                  <Edit3 className="h-4 w-4 text-orange-600" />
                  <h3 className="font-medium text-orange-800">💰 Marge par Commande</h3>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-orange-500" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">
                        💡 Marge fixée à 150 DH par défaut. Vous pouvez la modifier manuellement si nécessaire.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Marge unitaire en MAD</Label>
                    <Input
                      type="number"
                      step="1"
                      min="0"
                      placeholder="Ex: 150"
                      value={marginPerOrderMAD}
                      onChange={(e) => handleMarginChange(e.target.value)}
                      className="text-right border-orange-200 focus:border-orange-400 focus:ring-orange-400"
                    />
                  </div>
                  
                  {/* Affichage de la conversion en USD */}
                  {typeof marginPerOrderMAD === "number" && marginPerOrderMAD > 0 && (
                    <div className="bg-white p-2 rounded border border-orange-200">
                      <div className="text-xs text-gray-600 mb-1">Équivalent en USD :</div>
                      <div className="text-sm font-medium text-orange-700">
                        {marginUSD.toFixed(2)} $
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Colonne 2 : Performance automatique */}
            <div className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h3 className="font-medium text-green-800 mb-4 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  📊 Performance (Auto-importée)
                </h3>

                {/* Leads */}
                <div className="space-y-2 mb-4">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-500" />
                    Leads (Total Ventes)
                  </Label>
                  <Input
                    type="number"
                    placeholder="Ex: 50"
                    value={leads}
                    onChange={(e) => setLeads(e.target.value ? parseInt(e.target.value) : "")}
                    className="text-right"
                    disabled={isLoadingAutoData}
                  />
                  <AutoDataIndicator 
                    isLoading={isLoadingAutoData}
                    lastSyncAt={lastSyncAt}
                    onRefresh={onRefreshAutoData}
                    dataType="leads"
                  />
                </div>

                {/* Livraisons */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Package className="h-4 w-4 text-green-500" />
                    Livraisons (Ventes livrées)
                  </Label>
                  <Input
                    type="number"
                    placeholder="Ex: 12"
                    value={deliveries}
                    onChange={(e) => setDeliveries(e.target.value ? parseInt(e.target.value) : "")}
                    className="text-right"
                    disabled={isLoadingAutoData}
                  />
                  <AutoDataIndicator 
                    isLoading={isLoadingAutoData}
                    lastSyncAt={lastSyncAt}
                    onRefresh={onRefreshAutoData}
                    dataType="deliveries"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Aperçu des métriques calculées */}
          {typeof spendMAD === "number" && typeof leads === "number" && leads > 0 && (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-800 text-sm mb-3">📈 Aperçu des métriques :</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="bg-white p-2 rounded border">
                  <div className="text-gray-600">CPL (Cost Per Lead) :</div>
                  <div className="font-medium">
                    {(spendMAD / leads).toFixed(2)} MAD
                    <span className="text-gray-500 ml-2">
                      ({(spendMAD / exchangeRate / leads).toFixed(2)} $)
                    </span>
                  </div>
                </div>
                
                {typeof deliveries === "number" && deliveries > 0 && (
                  <div className="bg-white p-2 rounded border">
                    <div className="text-gray-600">CPD (Cost Per Delivery) :</div>
                    <div className="font-medium">
                      {(spendMAD / deliveries).toFixed(2)} MAD
                      <span className="text-gray-500 ml-2">
                        ({(spendMAD / exchangeRate / deliveries).toFixed(2)} $)
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="bg-green-50 p-3 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-green-600">🤖</span>
              <span className="text-green-800 font-medium">
                Automatisation activée : données synchronisées depuis Meta Ads et Ventes
              </span>
            </div>
            <div className="text-xs text-green-600 mt-1">
              Taux de change : {exchangeRate ? exchangeRate.toFixed(4) : 'N/A'} MAD/$ (synchronisé depuis Finances)
            </div>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
