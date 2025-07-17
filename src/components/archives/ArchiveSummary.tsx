
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useArchiveData } from "@/hooks/useArchiveData";
import { useExchangeRate } from "@/hooks/useExchangeRate";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface ArchiveSummaryProps {
  selectedMonth: string;
}

export default function ArchiveSummary({ selectedMonth }: ArchiveSummaryProps) {
  const { 
    marketingData, 
    financialData, 
    profitData, 
    isLoading 
  } = useArchiveData(selectedMonth);
  
  const { data: exchangeRate = 10.0 } = useExchangeRate();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Chargement des données...</div>
        </CardContent>
      </Card>
    );
  }

  // Calculs pour le mois sélectionné
  const totalMarketingSpend = marketingData?.reduce((sum, item) => sum + item.spend_usd, 0) || 0;
  const totalFinancialReceived = financialData?.reduce((sum, item) => sum + item.amount_received_usd, 0) || 0;
  const totalProfitCommissions = profitData?.reduce((sum, item) => sum + item.commission_total, 0) || 0;
  const totalDeliveries = profitData?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  // Conversions
  const marketingSpendMAD = totalMarketingSpend * exchangeRate;
  const financialReceivedMAD = totalFinancialReceived * exchangeRate;
  const netProfitMAD = totalProfitCommissions - marketingSpendMAD;
  const netProfitUSD = netProfitMAD / exchangeRate;

  const monthLabel = format(new Date(`${selectedMonth}-01`), "MMMM yyyy", { locale: fr });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-purple-700">
          📊 Résumé de {monthLabel}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Chiffre d'affaires */}
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-green-700 mb-1">💰 Chiffre d'affaires</h3>
            <div className="text-2xl font-bold text-green-600">
              {totalProfitCommissions.toFixed(2)} DH
            </div>
            <div className="text-sm text-gray-500">
              {(totalProfitCommissions / exchangeRate).toFixed(2)}$ USD
            </div>
          </div>

          {/* Total Livraisons */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-blue-700 mb-1">📦 Total Livraisons</h3>
            <div className="text-2xl font-bold text-blue-600">
              {totalDeliveries}
            </div>
            <div className="text-sm text-gray-500">
              Livraisons du mois
            </div>
          </div>

          {/* Dépenses Marketing */}
          <div className="bg-red-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-red-700 mb-1">🧾 Dépenses Marketing</h3>
            <div className="text-2xl font-bold text-red-600">
              {marketingSpendMAD.toFixed(2)} DH
            </div>
            <div className="text-sm text-gray-500">
              {totalMarketingSpend.toFixed(2)}$ USD
            </div>
          </div>

          {/* Profit Net */}
          <div className={`p-4 rounded-lg ${netProfitMAD >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
            <h3 className={`text-sm font-medium mb-1 ${netProfitMAD >= 0 ? 'text-green-700' : 'text-red-700'}`}>
              ⚖️ Profit Net
            </h3>
            <div className={`text-2xl font-bold ${netProfitMAD >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {netProfitMAD.toFixed(2)} DH
            </div>
            <div className="text-sm text-gray-500">
              {netProfitUSD.toFixed(2)}$ USD
            </div>
          </div>
        </div>

        {/* Indicateurs supplémentaires */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <div className="font-medium text-gray-700">Montants reçus (Finances)</div>
            <div className="text-lg font-semibold text-blue-600">
              {financialReceivedMAD.toFixed(2)} DH
            </div>
          </div>
          <div className="text-center">
            <div className="font-medium text-gray-700">Taux de change moyen</div>
            <div className="text-lg font-semibold text-purple-600">
              {exchangeRate.toFixed(2)} DH/USD
            </div>
          </div>
          <div className="text-center">
            <div className="font-medium text-gray-700">Marge par livraison</div>
            <div className="text-lg font-semibold text-orange-600">
              {totalDeliveries > 0 ? (totalProfitCommissions / totalDeliveries).toFixed(2) : '0.00'} DH
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
