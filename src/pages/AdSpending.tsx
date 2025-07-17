import { Header } from "@/components/layout/Header";
import { useAuth } from "@/hooks/useAuth";
import { TrendingUp } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdSpendingImport } from "@/components/ad-spending/AdSpendingImport";
import { AdSpendingTable } from "@/components/ad-spending/AdSpendingTable";
import { AdSpendingGroupedView } from "@/components/ad-spending/AdSpendingGroupedView";
import { AdSpendingComparison } from "@/components/ad-spending/AdSpendingComparison";
import { AdSpendingCharts } from "@/components/ad-spending/AdSpendingCharts";
import { AdSpendingSummary } from "@/components/ad-spending/AdSpendingSummary";
import { useAdSpendingData } from "@/hooks/useAdSpendingData";

export default function AdSpending() {
  const { user } = useAuth();
  const { data, fetchData } = useAdSpendingData();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-card rounded-lg border border-border">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                📊 Dépenses Publicitaires
              </h1>
              <p className="text-muted-foreground mt-1">
                Importez et analysez vos données Meta Ads
              </p>
            </div>
          </div>
        </div>

        {/* Onglets principaux */}
        <Tabs defaultValue="import" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="import">📥 Import</TabsTrigger>
            <TabsTrigger value="grouped">📅 Par jour</TabsTrigger>
            <TabsTrigger value="table">📋 Tableau</TabsTrigger>
            <TabsTrigger value="comparison">📊 Comparaison</TabsTrigger>
            <TabsTrigger value="charts">📈 Graphiques</TabsTrigger>
            <TabsTrigger value="summary">📋 Résumé</TabsTrigger>
          </TabsList>

          {/* Onglet Import */}
          <TabsContent value="import" className="space-y-6">
            <AdSpendingImport />
          </TabsContent>

          {/* Onglet Vue par jour */}
          <TabsContent value="grouped" className="space-y-6">
            <AdSpendingGroupedView 
              data={data} 
              onDataChange={fetchData}
            />
          </TabsContent>

          {/* Onglet Tableau */}
          <TabsContent value="table" className="space-y-6">
            <AdSpendingTable />
          </TabsContent>

          {/* Onglet Comparaison */}
          <TabsContent value="comparison" className="space-y-6">
            <AdSpendingComparison data={data} />
          </TabsContent>

          {/* Onglet Graphiques */}
          <TabsContent value="charts" className="space-y-6">
            <AdSpendingCharts />
          </TabsContent>

          {/* Onglet Résumé */}
          <TabsContent value="summary" className="space-y-6">
            <AdSpendingSummary />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
