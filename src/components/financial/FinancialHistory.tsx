
import { useFinancialRows } from "@/hooks/useFinancialTracking";
import { format } from "date-fns";

export default function FinancialHistory() {
  const { data, isLoading } = useFinancialRows();

  const totalUsd = data?.reduce((sum, r) => sum + (r.amount_received_usd || 0), 0) ?? 0;
  const totalMad = data?.reduce((sum, r) => sum + (r.amount_received_mad || 0), 0) ?? 0;

  return (
    <div className="bg-white rounded-xl shadow p-6 mb-8">
      <h2 className="font-semibold text-xl text-blue-800 mb-2">📊 Historique du mois</h2>
      <table className="w-full text-sm">
        <thead>
          <tr>
            <th className="text-left py-1">Date</th>
            <th className="text-right py-1">Montant ($)</th>
            <th className="text-right py-1">Montant (MAD)</th>
          </tr>
        </thead>
        <tbody>
          {isLoading && (
            <tr>
              <td colSpan={3}>Chargement…</td>
            </tr>
          )}
          {data && data.length > 0 ? (
            data.map(row => (
              <tr key={row.id}>
                <td>{format(new Date(row.date), "dd/MM/yyyy")}</td>
                <td className="text-right font-mono">{row.amount_received_usd.toFixed(2)}</td>
                <td className="text-right font-mono text-gray-500">{row.amount_received_mad.toFixed(2)}</td>
              </tr>
            ))
          ) : (
            !isLoading && (
              <tr>
                <td colSpan={3} className="text-center text-gray-400 italic">Aucune entrée ce mois-ci</td>
              </tr>
            )
          )}
        </tbody>
        <tfoot>
          <tr>
            <td className="font-semibold pt-3">Total</td>
            <td className="text-right font-mono font-semibold pt-3">{totalUsd.toFixed(2)}</td>
            <td className="text-right font-mono font-semibold text-gray-600 pt-3">{totalMad.toFixed(2)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
