import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar, Download, Filter, Archive, AlertCircle, Play } from "lucide-react";
import { format, subMonths } from "date-fns";
import { fr } from "date-fns/locale";
import ArchiveMarketing from "@/components/archives/ArchiveMarketing";
import ArchiveFinances from "@/components/archives/ArchiveFinances";
import ArchiveProfits from "@/components/archives/ArchiveProfits";
import ArchiveSummary from "@/components/archives/ArchiveSummary";
import { useArchiveData } from "@/hooks/useArchiveData";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

export default function Archives() {
  const [selectedMonth, setSelectedMonth] = useState(format(subMonths(new Date(), 1), "yyyy-MM"));
  const [isArchiving, setIsArchiving] = useState(false);
  
  // Récupérer les données d'archives
  const { marketingData, financialData, profitData, adSpendingData, salesData, isLoading } = useArchiveData(selectedMonth);
  
  // Générer la liste des 12 derniers mois
  const getAvailableMonths = () => {
    const months = [];
    for (let i = 0; i < 12; i++) {
      const date = subMonths(new Date(), i);
      months.push({
        value: format(date, "yyyy-MM"),
        label: format(date, "MMMM yyyy", { locale: fr }),
        isCurrentMonth: i === 0
      });
    }
    return months;
  };

  const availableMonths = getAvailableMonths();

  const handleExportAll = () => {
    // TODO: Implémenter l'export complet
    console.log("Export de toutes les données pour", selectedMonth);
    toast({
      title: "Export en cours",
      description: `Préparation de l'export pour ${selectedMonth}...`,
    });
  };

  const handleManualArchive = async () => {
    setIsArchiving(true);
    try {
      const { data, error } = await supabase.functions.invoke('close-month');
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Archivage réussi ✅",
        description: `Les données ont été archivées avec succès.`,
      });
      
      // Recharger les données
      window.location.reload();
      
    } catch (error) {
      console.error("Erreur lors de l'archivage:", error);
      toast({
        title: "Erreur d'archivage",
        description: "Impossible d'effectuer l'archivage automatique.",
        variant: "destructive",
      });
    } finally {
      setIsArchiving(false);
    }
  };

  const selectedMonthData = availableMonths.find(m => m.value === selectedMonth);

  return (
    <div className="bg-gradient-to-br from-purple-50 via-white to-blue-100 min-h-screen">
      <Header />
      <main className="max-w-7xl mx-auto flex flex-col gap-6 pt-6 px-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-primary mb-2 flex items-center justify-center gap-2">
            <Archive className="w-8 h-8" />
            📚 Archives Mensuelles
          </h1>
          <p className="text-muted-foreground">
            Consultez et analysez vos données historiques par mois
          </p>
        </div>

        {/* Informations sur l'archivage automatique */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-700">
              <AlertCircle className="w-5 h-5" />
              Système d'archivage automatique
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm text-blue-600">
                🔄 <strong>Clôture automatique :</strong> Chaque 1er du mois à 00h05 UTC, 
                les données du mois précédent sont automatiquement archivées.
              </p>
              <p className="text-sm text-blue-600">
                📊 <strong>Réinitialisation :</strong> Les compteurs repartent à zéro pour le nouveau mois.
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleManualArchive}
                  disabled={isArchiving}
                  className="border-blue-300 text-blue-700 hover:bg-blue-100"
                >
                  {isArchiving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                      Archivage...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Lancer archivage manuel
                    </>
                  )}
                </Button>
                <span className="text-xs text-gray-500">
                  (Pour tester ou forcer l'archivage)
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sélecteur de mois et actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-700">
              <Calendar className="w-5 h-5" />
              Sélection de la période
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex items-center gap-4">
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableMonths.map((month) => (
                      <SelectItem key={month.value} value={month.value}>
                        <div className="flex items-center gap-2">
                          {month.label}
                          {month.isCurrentMonth && (
                            <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                              Actuel
                            </Badge>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {selectedMonthData && !selectedMonthData.isCurrentMonth && (
                  <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                    <Archive className="w-3 h-3 mr-1" />
                    Archive
                  </Badge>
                )}
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleExportAll}>
                  <Download className="w-4 h-4 mr-2" />
                  Exporter tout
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Résumé mensuel */}
        <ArchiveSummary selectedMonth={selectedMonth} />

        {/* Tabs pour chaque module */}
        <Tabs defaultValue="marketing" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="marketing">📊 Marketing</TabsTrigger>
            <TabsTrigger value="finances">💰 Finances</TabsTrigger>
            <TabsTrigger value="profits">📈 Profits</TabsTrigger>
            <TabsTrigger value="sales">🛒 Ventes</TabsTrigger>
            <TabsTrigger value="adspend">🎯 Ad Spend</TabsTrigger>
          </TabsList>
          
          <TabsContent value="marketing">
            <ArchiveMarketing selectedMonth={selectedMonth} />
          </TabsContent>
          
          <TabsContent value="finances">
            <ArchiveFinances selectedMonth={selectedMonth} />
          </TabsContent>
          
          <TabsContent value="profits">
            <ArchiveProfits selectedMonth={selectedMonth} />
          </TabsContent>

          <TabsContent value="sales">
            <Card>
              <CardHeader>
                <CardTitle>📦 Données de Ventes - {selectedMonthData?.label}</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">Chargement des données de ventes...</div>
                ) : salesData.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    Aucune donnée de vente pour cette période
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {salesData.length}
                        </div>
                        <div className="text-sm text-gray-600">Total commandes</div>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {salesData.reduce((sum, sale) => sum + (sale.price || 0), 0).toFixed(2)} DH
                        </div>
                        <div className="text-sm text-gray-600">Chiffre d'affaires</div>
                      </div>
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">
                          {salesData.filter(sale => sale.delivery_status === 'Livré').length}
                        </div>
                        <div className="text-sm text-gray-600">Livraisons réussies</div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="adspend">
            <Card>
              <CardHeader>
                <CardTitle>🎯 Données Ad Spend - {selectedMonthData?.label}</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">Chargement des données publicitaires...</div>
                ) : adSpendingData.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    Aucune donnée publicitaire pour cette période
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="bg-red-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-red-600">
                          {adSpendingData.reduce((sum, ad) => sum + (ad.amount_spent || 0), 0).toFixed(2)}$
                        </div>
                        <div className="text-sm text-gray-600">Total dépensé</div>
                      </div>
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {adSpendingData.reduce((sum, ad) => sum + (ad.leads || 0), 0)}
                        </div>
                        <div className="text-sm text-gray-600">Total leads</div>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {adSpendingData.reduce((sum, ad) => sum + (ad.impressions || 0), 0).toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-600">Impressions</div>
                      </div>
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">
                          {adSpendingData.reduce((sum, ad) => sum + (ad.link_clicks || 0), 0)}
                        </div>
                        <div className="text-sm text-gray-600">Clics</div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
