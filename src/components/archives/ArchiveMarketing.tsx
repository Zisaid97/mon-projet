
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Edit, Trash2 } from "lucide-react";
import { useArchiveData } from "@/hooks/useArchiveData";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useExchangeRate } from "@/hooks/useExchangeRate";
import { calculateResults } from "@/utils/marketingCalculations";
import { EditMarketingDataDialog } from "./EditMarketingDataDialog";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ArchiveMarketingProps {
  selectedMonth: string;
}

export default function ArchiveMarketing({ selectedMonth }: ArchiveMarketingProps) {
  const { marketingData, isLoading } = useArchiveData(selectedMonth);
  const { data: exchangeRate = 10.0 } = useExchangeRate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [editDialog, setEditDialog] = useState<{
    isOpen: boolean;
    data: any;
  }>({
    isOpen: false,
    data: null,
  });

  const handleExport = () => {
    const csvContent = [
      ["Date", "Dépenses (USD)", "Dépenses (MAD)", "Leads", "Livraisons", "Marge par commande (USD)", "Marge par commande (MAD)", "CPL", "CPD", "Taux de livraison", "Profit Net (USD)", "Profit Net (MAD)"],
      ...marketingData.map(item => {
        const results = calculateResults(item.spend_usd * exchangeRate, item.leads, item.deliveries, item.margin_per_order * exchangeRate, exchangeRate);
        return [
          format(new Date(item.date), "dd/MM/yyyy"),
          item.spend_usd.toFixed(2),
          (item.spend_usd * exchangeRate).toFixed(2),
          item.leads,
          item.deliveries,
          item.margin_per_order.toFixed(2),
          (item.margin_per_order * exchangeRate).toFixed(2),
          results.cpl.toFixed(2),
          results.cpd.toFixed(2),
          results.deliveryRate.toFixed(1) + "%",
          results.netProfit.toFixed(2),
          results.netProfitMAD.toFixed(2)
        ];
      })
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `marketing-${selectedMonth}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleEdit = (item: any) => {
    setEditDialog({
      isOpen: true,
      data: item,
    });
  };

  const handleDelete = async (id: string, date: string) => {
    try {
      const { error } = await supabase
        .from("marketing_performance")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Supprimé ✅",
        description: `Les données du ${format(new Date(date), "dd/MM/yyyy")} ont été supprimées`,
      });

      queryClient.invalidateQueries({ queryKey: ["archive_marketing"] });
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer les données",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Chargement des données marketing...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-blue-700">
              📊 Données Marketing - {format(new Date(`${selectedMonth}-01`), "MMMM yyyy", { locale: fr })}
            </CardTitle>
            <Button onClick={handleExport} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Exporter CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {marketingData.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              Aucune donnée marketing pour ce mois
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-2">Date</th>
                    <th className="text-right py-2 px-2">Dépenses</th>
                    <th className="text-right py-2 px-2">Leads</th>
                    <th className="text-right py-2 px-2">Livraisons</th>
                    <th className="text-right py-2 px-2">Marge/commande</th>
                    <th className="text-right py-2 px-2">CPL</th>
                    <th className="text-right py-2 px-2">CPD</th>
                    <th className="text-right py-2 px-2">Taux</th>
                    <th className="text-right py-2 px-2">Profit Net</th>
                    <th className="text-center py-2 px-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {marketingData.map((item) => {
                    const results = calculateResults(
                      item.spend_usd * exchangeRate, 
                      item.leads, 
                      item.deliveries, 
                      item.margin_per_order * exchangeRate, 
                      exchangeRate
                    );
                    
                    return (
                      <tr key={item.id} className="border-b hover:bg-gray-50">
                        <td className="py-2 px-2">
                          {format(new Date(item.date), "dd/MM/yyyy")}
                        </td>
                        <td className="text-right py-2 px-2 font-mono">
                          <div>{(item.spend_usd * exchangeRate).toFixed(2)} DH</div>
                          <div className="text-xs text-gray-500">{item.spend_usd.toFixed(2)}$</div>
                        </td>
                        <td className="text-right py-2 px-2">{item.leads}</td>
                        <td className="text-right py-2 px-2">{item.deliveries}</td>
                        <td className="text-right py-2 px-2 font-mono">
                          <div>{(item.margin_per_order * exchangeRate).toFixed(2)} DH</div>
                          <div className="text-xs text-gray-500">{item.margin_per_order.toFixed(2)}$</div>
                        </td>
                        <td className="text-right py-2 px-2">
                          <span className={`font-semibold ${results.cplStatus === 'good' ? 'text-green-600' : 'text-red-600'}`}>
                            {results.cpl.toFixed(2)}$
                          </span>
                        </td>
                        <td className="text-right py-2 px-2">
                          <span className={`font-semibold ${results.cpdStatus === 'good' ? 'text-green-600' : 'text-red-600'}`}>
                            {results.cpd.toFixed(2)}$
                          </span>
                        </td>
                        <td className="text-right py-2 px-2">
                          <span className={`font-semibold ${results.deliveryRateStatus === 'good' ? 'text-green-600' : 'text-red-600'}`}>
                            {results.deliveryRate.toFixed(1)}%
                          </span>
                        </td>
                        <td className="text-right py-2 px-2 font-mono">
                          <div className={`font-semibold ${results.netProfitMAD >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {results.netProfitMAD.toFixed(2)} DH
                          </div>
                          <div className="text-xs text-gray-500">{results.netProfit.toFixed(2)}$</div>
                        </td>
                        <td className="text-center py-2 px-2">
                          <div className="flex gap-1 justify-center">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleEdit(item)}
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="sm" variant="outline">
                                  <Trash2 className="w-3 h-3 text-red-600" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Supprimer les données</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Êtes-vous sûr de vouloir supprimer les données marketing du {format(new Date(item.date), "dd/MM/yyyy")} ?
                                    Cette action est irréversible.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => handleDelete(item.id, item.date)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Supprimer
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {editDialog.isOpen && editDialog.data && (
        <EditMarketingDataDialog
          isOpen={editDialog.isOpen}
          onClose={() => setEditDialog({ isOpen: false, data: null })}
          data={editDialog.data}
          exchangeRate={exchangeRate}
        />
      )}
    </>
  );
}
