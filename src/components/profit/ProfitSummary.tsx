
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useProfitTotals } from "@/hooks/useProfitTracking";
import { useMonthlyMarketingTotals } from "@/hooks/useMarketingTotals";
import { useMonthlyBonus } from "@/hooks/useMonthlyBonus";
import { useExchangeRate } from "@/hooks/useExchangeRate";

interface ProfitSummaryProps {
  selectedDate?: Date;
}

// Wrapper pour logs conditionnels
function debugLog(message: string, data?: any) {
  if (process.env.NODE_ENV !== 'production') {
    console.debug(`[ProfitSummary] ${message}`, data);
  }
}

export default function ProfitSummary({ selectedDate }: ProfitSummaryProps) {
  const { 
    totalCommissionsDh, 
    totalQuantity, 
    normalQuantity, 
    delayedQuantity, 
    normalCommissions,
    delayedCommissions,
    exchangeRate,
    isLoading: profitLoading
  } = useProfitTotals(selectedDate);
  const { data: marketingTotals } = useMonthlyMarketingTotals();
  const { bonus } = useMonthlyBonus(selectedDate);
  
  // Conversion des dépenses marketing de USD vers DH
  const totalExpensesDh = (marketingTotals?.totalSpend || 0) * exchangeRate;
  const totalExpensesUsd = marketingTotals?.totalSpend || 0;
  
  // Profit net = Chiffre d'affaires - Dépenses marketing + Bonus
  const netProfitDh = totalCommissionsDh - totalExpensesDh + bonus;
  const netProfitUsd = netProfitDh / exchangeRate;

  debugLog("Données du résumé:", {
    totalCommissionsDh,
    totalQuantity,
    exchangeRate,
    netProfitDh,
    bonus,
    isLoading: profitLoading
  });

  if (profitLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Chargement du résumé...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Affichage du taux de change */}
      <div className="text-center text-sm text-gray-600 dark:text-slate-400 bg-blue-50 dark:bg-slate-700 p-2 rounded-lg transition-colors">
        <span className="font-medium">📊 Taux appliqué : 1 $ = {exchangeRate.toFixed(2)} DH</span>
      </div>

      {/* Grille à 5 colonnes pour inclure le bonus */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 items-start">
        {/* 1. Chiffre d'affaires */}
        <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-600 transition-colors">
          <CardHeader>
            <CardTitle className="text-green-600 dark:text-green-400">💰 Chiffre d'affaires</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {totalCommissionsDh.toFixed(2)} DH
            </div>
            <div className="text-sm text-gray-500 dark:text-slate-400">
              {(totalCommissionsDh / exchangeRate).toFixed(2)}$ USD
            </div>
            <div className="text-xs text-gray-400 mt-2 space-y-1">
              <div className="flex justify-between">
                <span>✅ Normal:</span>
                <span className="font-medium">{normalCommissions.toFixed(0)} DH</span>
              </div>
              <div className="flex justify-between">
                <span>📦 Décalé:</span>
                <span className="font-medium text-purple-600">{delayedCommissions.toFixed(0)} DH</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 2. Total Livraisons */}
        <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-600 transition-colors">
          <CardHeader>
            <CardTitle className="text-blue-600 dark:text-blue-400">📦 Total Livraisons</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {totalQuantity}
            </div>
            <div className="text-xs text-gray-500 dark:text-slate-400 mt-2 space-y-1">
              <div className="flex justify-between">
                <span>✅ Normal:</span>
                <span className="font-medium">{normalQuantity}</span>
              </div>
              <div className="flex justify-between">
                <span>📦 Décalé:</span>
                <span className="font-medium text-purple-600">{delayedQuantity}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 3. Total Dépenses */}
        <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-600 transition-colors">
          <CardHeader>
            <CardTitle className="text-red-600 dark:text-red-400">🧾 Total Dépenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {totalExpensesDh.toFixed(2)} DH
            </div>
            <div className="text-sm text-gray-500 dark:text-slate-400">
              {totalExpensesUsd.toFixed(2)}$ USD
            </div>
          </CardContent>
        </Card>

        {/* 4. Bonus Mensuel */}
        <Card className="bg-white dark:bg-slate-800 border-purple-200 dark:border-purple-600 transition-colors">
          <CardHeader>
            <CardTitle className="text-purple-600 dark:text-purple-400">🎁 Bonus Mensuel</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {bonus.toFixed(0)} DH
            </div>
            <div className="text-sm text-gray-500 dark:text-slate-400">
              {(bonus / exchangeRate).toFixed(2)}$ USD
            </div>
            {bonus > 0 && (
              <div className="text-xs text-purple-500 mt-1">
                Ajouté au profit net
              </div>
            )}
          </CardContent>
        </Card>

        {/* 5. Profit Net */}
        <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-600 transition-colors">
          <CardHeader>
            <CardTitle className={netProfitDh >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}>
              ⚖️ Profit Net
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netProfitDh >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
              {netProfitDh.toFixed(2)} DH
            </div>
            <div className="text-sm text-gray-500 dark:text-slate-400">
              {netProfitUsd.toFixed(2)}$ USD
            </div>
            {bonus > 0 && (
              <div className="text-xs text-purple-500 mt-1">
                (incluant {bonus.toFixed(0)} DH de bonus)
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Information sur les livraisons décalées - Amélioration de l'affichage */}
      {delayedQuantity > 0 && (
        <div className="text-center text-sm text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg border border-purple-200 dark:border-purple-600">
          <div className="flex items-center justify-center gap-2 mb-1">
            <span className="text-lg">📦</span>
            <span className="font-semibold">Livraisons Décalées Intégrées</span>
          </div>
          <div>
            Ce mois-ci : <strong>{delayedQuantity} livraisons décalées</strong> pour <strong>{delayedCommissions.toFixed(0)} DH</strong> de commissions
          </div>
        </div>
      )}
    </div>
  );
}
