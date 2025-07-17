
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatNumber } from "@/utils/marketingFormatters";

interface SpendingSummaryProps {
  totalSpendMAD: number;
  exchangeRate: number;
}

export function SpendingSummary({ totalSpendMAD, exchangeRate }: SpendingSummaryProps) {
  const totalSpendUSD = totalSpendMAD / exchangeRate;

  return (
    <Card className="bg-blue-50 border-blue-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-blue-800 flex items-center gap-2">
          💸 Total des Dépenses
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          <div className="text-2xl font-bold text-blue-600">
            {formatNumber(totalSpendUSD)} $
          </div>
          <div className="text-sm text-blue-700">
            {formatNumber(totalSpendMAD)} DH
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
