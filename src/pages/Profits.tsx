import { Header } from "@/components/layout/Header";
import ProfitTable from "@/components/profit/ProfitTable";
import ProfitSummary from "@/components/profit/ProfitSummary";
import ProfitHistory from "@/components/profit/ProfitHistory";
import ProductDatabase from "@/components/products/ProductDatabase";
import DelayedDeliveriesTab from "@/components/profit/DelayedDeliveriesTab";
import { MonthlyBonusCard } from "@/components/bonus/MonthlyBonusCard";
import { NotesWidget } from "@/components/notes/NotesWidget";
import { AIChatWidget } from "@/components/ai/AIChatWidget";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BarChart } from "lucide-react";
import ProductAnalysisDialog from "@/components/product-analysis/ProductAnalysisDialog";
import { useState } from "react";
import { useMonthInitializer } from "@/hooks/useMonthInitializer";
import ProfitHistoryWithDateSelector from "@/components/profit/ProfitHistoryWithDateSelector";
import { CollapsibleProductDatabase } from "@/components/profit/CollapsibleProductDatabase";

export default function Profits() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  // Initialize month from URL
  useMonthInitializer();

  return (
    <div className="bg-gradient-to-br from-green-50 via-white to-blue-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 min-h-screen transition-colors">
      <Header />
      <main className="max-w-7xl mx-auto flex flex-col gap-6 pt-6 px-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-green-800 dark:text-green-400 mb-2">
            💳 Module Profits - Calcul des Commissions CPD
          </h1>
          <p className="text-gray-600 dark:text-slate-400">
            Gérez vos commissions par catégorie et calculez votre profit net mensuel
          </p>
        </div>

        <div className="flex justify-end">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                <BarChart className="mr-2 h-4 w-4" />
                Analyse de rentabilité par produit
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl h-[90vh] flex flex-col" aria-describedby="product-analysis-description">
              <DialogHeader>
                <DialogTitle>Analyse de Rentabilité par Produit</DialogTitle>
              </DialogHeader>
              <div id="product-analysis-description" className="sr-only">
                Interface d'analyse de rentabilité permettant de sélectionner un produit et une période pour visualiser les performances détaillées.
              </div>
              <div className="flex-grow overflow-y-auto p-4">
                <ProductAnalysisDialog />
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Bonus mensuel */}
        <MonthlyBonusCard selectedDate={selectedDate} />
        
        <ProfitSummary selectedDate={selectedDate} />
        
        {/* Section masquable pour la configuration des commissions */}
        <CollapsibleProductDatabase />
        
        {/* Système d'onglets pour les livraisons */}
        <Tabs defaultValue="normal" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="normal">📃 Commissions CPD</TabsTrigger>
            <TabsTrigger value="delayed">📦 Livraisons Décalées</TabsTrigger>
          </TabsList>
          
          <TabsContent value="normal" className="space-y-6">
            <ProfitTable selectedDate={selectedDate} onDateChange={setSelectedDate} />
          </TabsContent>
          
          <TabsContent value="delayed" className="space-y-6">
            <DelayedDeliveriesTab selectedDate={selectedDate} onDateChange={setSelectedDate} />
          </TabsContent>
        </Tabs>
        
        {/* Historique avec sélecteur de date */}
        <ProfitHistoryWithDateSelector />
      </main>

      {/* Widget de notes - Affiché en bas à droite */}
      <NotesWidget pageType="profits" />
      
      {/* Widget de chat IA avec contexte spécifique à la page profits */}
      <AIChatWidget context={{ page: 'profits', filters: { selectedDate } }} />
    </div>
  );
}
