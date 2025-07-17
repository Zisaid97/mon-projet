
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Edit, Trash2 } from "lucide-react";
import { useArchiveData } from "@/hooks/useArchiveData";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CPD_CATEGORIES } from "@/types/profit";

interface ArchiveProfitsProps {
  selectedMonth: string;
}

export default function ArchiveProfits({ selectedMonth }: ArchiveProfitsProps) {
  const { profitData, isLoading } = useArchiveData(selectedMonth);

  const handleExport = () => {
    const csvContent = [
      ["Date", "Catégorie CPD", "Produit", "Quantité", "Commission totale"],
      ...profitData.map(item => [
        format(new Date(item.date), "dd/MM/yyyy"),
        `CPD ${item.cpd_category}`,
        item.product_name,
        item.quantity.toString(),
        item.commission_total.toFixed(2)
      ])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `profits-${selectedMonth}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Chargement des données de profits...</div>
        </CardContent>
      </Card>
    );
  }

  const totalCommissions = profitData.reduce((sum, item) => sum + item.commission_total, 0);
  const totalQuantity = profitData.reduce((sum, item) => sum + item.quantity, 0);

  // Grouper par catégorie CPD
  const groupedData = CPD_CATEGORIES.map(category => ({
    category,
    products: profitData.filter(item => item.cpd_category === category)
  })).filter(group => group.products.length > 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-purple-700">
            📈 Données Profits - {format(new Date(`${selectedMonth}-01`), "MMMM yyyy", { locale: fr })}
          </CardTitle>
          <Button onClick={handleExport} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exporter CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {profitData.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            Aucune donnée de profits pour ce mois
          </div>
        ) : (
          <>
            {/* Résumé */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-purple-50 p-4 rounded-lg text-center">
                <div className="text-sm text-purple-700 mb-1">Total Commissions</div>
                <div className="text-2xl font-bold text-purple-600">{totalCommissions.toFixed(2)} DH</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg text-center">
                <div className="text-sm text-purple-700 mb-1">Total Livraisons</div>
                <div className="text-2xl font-bold text-purple-600">{totalQuantity}</div>
              </div>
            </div>

            {/* Données par catégorie */}
            <div className="space-y-6">
              {groupedData.map(({ category, products }) => {
                const categoryTotal = products.reduce((sum, item) => sum + item.commission_total, 0);
                const categoryQuantity = products.reduce((sum, item) => sum + item.quantity, 0);
                
                return (
                  <div key={category} className="border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold text-purple-700">
                        CPD {category}
                      </h3>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">
                          {categoryQuantity} livraisons • {categoryTotal.toFixed(2)} DH
                        </div>
                      </div>
                    </div>
                    
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2 px-2">Date</th>
                            <th className="text-left py-2 px-2">Produit</th>
                            <th className="text-right py-2 px-2">Quantité</th>
                            <th className="text-right py-2 px-2">Commission</th>
                            <th className="text-center py-2 px-2">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {products.map((item) => (
                            <tr key={item.id} className="border-b hover:bg-gray-50">
                              <td className="py-2 px-2">
                                {format(new Date(item.date), "dd/MM/yyyy")}
                              </td>
                              <td className="py-2 px-2 font-medium">
                                {item.product_name}
                              </td>
                              <td className="text-right py-2 px-2">
                                {item.quantity}
                              </td>
                              <td className="text-right py-2 px-2 font-mono font-semibold text-purple-600">
                                {item.commission_total.toFixed(2)} DH
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
                  </div>
                );
              })}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
