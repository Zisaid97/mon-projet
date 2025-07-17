
import { useFinancialRows } from "@/hooks/useFinancialTracking";
import { useMonthlyMarketingTotals } from "@/hooks/useMarketingTotals";
import clsx from "clsx";

export default function FinancialSummary() {
  // Montants reçus (finance)
  const { data: financeData } = useFinancialRows();
  const receivedUsd = financeData?.reduce((sum, r) => sum + (r.amount_received_usd || 0), 0) ?? 0;
  const receivedMad = financeData?.reduce((sum, r) => sum + (r.amount_received_mad || 0), 0) ?? 0;
  // Montant total dépensé (marketing)
  const { data: marketingTotal } = useMonthlyMarketingTotals();
  const spentUsd = marketingTotal?.totalSpend ?? 0;
  const diffUsd = receivedUsd - spentUsd;

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="font-semibold text-xl text-blue-800 mb-4">⚖️ Résumé finances</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Metric label="Total reçu ($)" value={receivedUsd} />
        <Metric label="Total dépensé ($)" value={spentUsd} type="depense"/>
        <Metric
          label="Différence ($)"
          value={diffUsd}
          highlight={diffUsd < 0 ? "negative" : diffUsd > 0 ? "positive" : undefined}
        />
      </div>
      <div className="text-right mt-2 text-gray-400 italic text-xs">
        Conversion MAD : <span className="font-mono">{receivedMad.toFixed(2)}</span>
      </div>
    </div>
  );
}

function Metric({ label, value, type, highlight }: { label: string, value: number, type?: string, highlight?: "positive" | "negative" }) {
  let color = "text-gray-700";
  if (highlight === "positive") color = "text-green-600";
  if (highlight === "negative") color = "text-red-600";
  if (type === "depense") color = "text-red-500";
  return (
    <div className="flex flex-col items-center">
      <div className="text-sm text-gray-500 mb-1">{label}</div>
      <span className={clsx("font-mono text-lg font-semibold", color)}>
        {value.toFixed(2)}
      </span>
    </div>
  );
}
