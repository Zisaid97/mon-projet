
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Edit, Trash2 } from "lucide-react";
import { useArchiveData } from "@/hooks/useArchiveData";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface ArchiveFinancesProps {
  selectedMonth: string;
}

export default function ArchiveFinances({ selectedMonth }: ArchiveFinancesProps) {
  const { financialData, isLoading } = useArchiveData(selectedMonth);

  const handleExport = () => {
    const csvContent = [
      ["Date", "Taux de change", "Montant reçu (USD)", "Montant reçu (MAD)"],
      ...financialData.map(item => [
        format(new Date(item.date), "dd/MM/yyyy"),
        item.exchange_rate.toString(),
        item.amount_received_usd.toFixed(2),
        item.amount_received_mad.toFixed(2)
      ])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `finances-${selectedMonth}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Chargement des données financières...</div>
        </CardContent>
      </Card>
    );
  }

  const totalUSD = financialData.reduce((sum, item) => sum + item.amount_received_usd, 0);
  const totalMAD = financialData.reduce((sum, item) => sum + item.amount_received_mad, 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-green-700">
            💰 Données Financières - {format(new Date(`${selectedMonth}-01`), "MMMM yyyy", { locale: fr })}
          </CardTitle>
          <Button onClick={handleExport} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exporter CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {financialData.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            Aucune donnée financière pour ce mois
          </div>
        ) : (
          <>
            {/* Résumé */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <div className="text-sm text-green-700 mb-1">Total reçu (USD)</div>
                <div className="text-2xl font-bold text-green-600">{totalUSD.toFixed(2)}$</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <div className="text-sm text-green-700 mb-1">Total reçu (MAD)</div>
                <div className="text-2xl font-bold text-green-600">{totalMAD.toFixed(2)} DH</div>
              </div>
            </div>

            {/* Tableau détaillé */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-2">Date</th>
                    <th className="text-right py-2 px-2">Taux de change</th>
                    <th className="text-right py-2 px-2">Montant (USD)</th>
                    <th className="text-right py-2 px-2">Montant (MAD)</th>
                    <th className="text-center py-2 px-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {financialData.map((item) => (
                    <tr key={item.id} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-2">
                        {format(new Date(item.date), "dd/MM/yyyy")}
                      </td>
                      <td className="text-right py-2 px-2 font-mono">
                        {item.exchange_rate.toFixed(2)}
                      </td>
                      <td className="text-right py-2 px-2 font-mono font-semibold text-green-600">
                        {item.amount_received_usd.toFixed(2)}$
                      </td>
                      <td className="text-right py-2 px-2 font-mono font-semibold text-green-600">
                        {item.amount_received_mad.toFixed(2)} DH
                      </td>
                      <td className="text-center py-2 px-2">
                        <div className="flex gap-1 justify-center">
                          <Button size="sm" variant="outline">
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
