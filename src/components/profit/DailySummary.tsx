
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useExchangeRate } from "@/hooks/useExchangeRate";

interface DailySummaryProps {
  totalQuantity: number;
  totalCommission: number;
  totalCommissionUsd: number;
}

export default function DailySummary({ totalQuantity, totalCommission }: DailySummaryProps) {
  const { data: exchangeRate = 10.0 } = useExchangeRate();
  const totalCommissionUsd = totalCommission / exchangeRate;

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle className="text-lg text-blue-800">📊 Résumé du jour</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center border-b pb-3">
          <div className="text-2xl font-bold text-blue-700">{totalQuantity}</div>
          <div className="text-sm text-gray-600">Total livraisons</div>
        </div>
        <div className="text-center border-b pb-3">
          <div className="text-2xl font-bold text-green-600">{totalCommission.toFixed(2)} DH</div>
          <div className="text-sm text-gray-600">Total commissions</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-blue-600">{totalCommissionUsd.toFixed(2)}$</div>
          <div className="text-sm text-gray-600">Équivalent USD</div>
        </div>
      </CardContent>
    </Card>
  );
}
