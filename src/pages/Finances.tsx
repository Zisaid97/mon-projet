
import { Header } from "@/components/layout/Header";
import FinancialForm from "@/components/financial/FinancialForm";
import FinancialHistory from "@/components/financial/FinancialHistory";
import FinancialSummary from "@/components/financial/FinancialSummary";
import { MonthlyAverageRateCard } from "@/components/financial/MonthlyAverageRateCard";
import { useAuth } from "@/hooks/useAuth";
import { Banknote, ChevronDown, ChevronUp, Calculator, TrendingUp } from "lucide-react";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

export default function Finances() {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  
  // États pour les sections pliables
  const [isFormOpen, setIsFormOpen] = useState(true);
  const [isSummaryOpen, setIsSummaryOpen] = useState(true);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* En-tête de page professionnel */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg">
                <Banknote className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Suivi Financier
                </h1>
                <p className="text-gray-600 mt-1">
                  Gérez vos flux financiers et taux de change
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="px-3 py-1">
                Suivi actif
              </Badge>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Carte du taux de change moyen mensuel */}
          <MonthlyAverageRateCard />
          
          {/* Section de saisie pliable */}
          <Collapsible open={isFormOpen} onOpenChange={setIsFormOpen}>
            <Card className="shadow-sm">
              <CollapsibleTrigger asChild>
                <div className="p-4 hover:bg-gray-50 cursor-pointer transition-colors border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Calculator className="h-5 w-5 text-green-600" />
                      <h3 className="text-lg font-semibold text-gray-900">
                        💰 Saisie des Données Financières
                      </h3>
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
                <div className="p-6">
                  <FinancialForm selectedDate={selectedDate} setSelectedDate={setSelectedDate} />
                </div>
              </CollapsibleContent>
            </Card>
          </Collapsible>
          
          {/* Section résumé pliable */}
          <Collapsible open={isSummaryOpen} onOpenChange={setIsSummaryOpen}>
            <Card className="shadow-sm">
              <CollapsibleTrigger asChild>
                <div className="p-4 hover:bg-gray-50 cursor-pointer transition-colors border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="h-5 w-5 text-blue-600" />
                      <h3 className="text-lg font-semibold text-gray-900">
                        📊 Résumé Mensuel
                      </h3>
                    </div>
                    {isSummaryOpen ? (
                      <ChevronUp className="h-5 w-5 text-gray-500" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-500" />
                    )}
                  </div>
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="p-6">
                  <FinancialSummary />
                </div>
              </CollapsibleContent>
            </Card>
          </Collapsible>
          
          {/* Section historique pliable */}
          <Collapsible open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
            <Card className="shadow-sm">
              <CollapsibleTrigger asChild>
                <div className="p-4 hover:bg-gray-50 cursor-pointer transition-colors border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Banknote className="h-5 w-5 text-purple-600" />
                      <h3 className="text-lg font-semibold text-gray-900">
                        📜 Historique des Transactions
                      </h3>
                    </div>
                    {isHistoryOpen ? (
                      <ChevronUp className="h-5 w-5 text-gray-500" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-500" />
                    )}
                  </div>
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="p-6">
                  <FinancialHistory />
                </div>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        </div>

        {/* Barre d'actions en bas */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-10">
          <div className="max-w-7xl mx-auto px-6 py-3">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Suivi financier actif
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsFormOpen(!isFormOpen)}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <Calculator className="h-4 w-4 mr-1" />
                  {isFormOpen ? 'Masquer' : 'Saisie'}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsSummaryOpen(!isSummaryOpen)}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <TrendingUp className="h-4 w-4 mr-1" />
                  {isSummaryOpen ? 'Masquer' : 'Résumé'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
