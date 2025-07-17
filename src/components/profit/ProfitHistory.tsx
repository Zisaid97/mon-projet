import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, Edit, Loader2 } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useProfitRows, useDeleteProfitRow, useUpdateProfitRow, useProfitTotals } from "@/hooks/useProfitTracking";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";
import { EditableQuantityCell } from "./EditableQuantityCell";
import { EditableCpdCell } from "./EditableCpdCell";
import { useUpdateProductCpd } from "@/hooks/useUpdateProductCpd";
import { ProductDeliverySummary } from "./ProductDeliverySummary";

// Wrapper pour logs conditionnels
function debugLog(message: string, data?: any) {
  if (process.env.NODE_ENV !== 'production') {
    console.debug(`[ProfitHistory] ${message}`, data);
  }
}

export default function ProfitHistory() {
  const { user } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  
  const { data: profitRows = [], isLoading, refetch } = useProfitRows(selectedMonth);
  const { 
    totalCommissionsDh, 
    totalQuantity, 
    normalQuantity, 
    delayedQuantity,
    isLoading: totalsLoading 
  } = useProfitTotals(selectedMonth);
  
  const deleteMutation = useDeleteProfitRow();
  const updateMutation = useUpdateProfitRow();
  const updateCpdMutation = useUpdateProductCpd();

  debugLog("ProfitHistory état:", {
    selectedMonth: format(selectedMonth, "yyyy-MM-dd"),
    profitRowsCount: profitRows.length,
    totalCommissionsDh,
    totalQuantity,
    isLoading
  });

  // Grouper les données par date
  const groupedByDate = profitRows.reduce((acc, row) => {
    const date = row.date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(row);
    return acc;
  }, {} as Record<string, typeof profitRows>);

  // Trier les dates par ordre décroissant
  const sortedDates = Object.keys(groupedByDate).sort((a, b) => b.localeCompare(a));

  debugLog("Données groupées par date:", {
    groupedByDate: Object.keys(groupedByDate),
    sortedDates
  });

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast({
        title: "Supprimé ✅",
        description: "Produit supprimé avec succès",
      });
      // Forcer un refetch
      refetch();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le produit",
        variant: "destructive",
      });
    }
  };

  const handleUpdate = async (id: string, quantity: number, productName?: string) => {
    try {
      await updateMutation.mutateAsync({ id, quantity, productName });
      toast({
        title: "Modifications enregistrées avec succès ✅",
        description: productName ? "Produit mis à jour" : "Quantité mise à jour",
      });
      // Forcer un refetch
      refetch();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le produit",
        variant: "destructive",
      });
    }
  };

  const getDateStats = (dateRows: typeof profitRows) => {
    const totalQuantity = dateRows.reduce((sum, row) => sum + row.quantity, 0);
    const totalCommission = dateRows.reduce((sum, row) => sum + row.commission_total, 0);
    return { totalQuantity, totalCommission };
  };

  if (isLoading || totalsLoading) {
    return (
      <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-600">
        <CardHeader>
          <CardTitle className="text-xl text-blue-800 dark:text-blue-400">
            📊 Historique des Profits
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Chargement de l'historique...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-600">
      <CardHeader>
        <CardTitle className="text-xl text-blue-800 dark:text-blue-400 flex items-center gap-2">
          📊 Historique des Profits
        </CardTitle>
        
        {/* Sélecteur de mois */}
        <div className="flex items-center gap-4 mt-4">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            📅 Mois sélectionné :
          </label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-[240px] justify-start text-left font-normal",
                  !selectedMonth && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedMonth ? format(selectedMonth, "MMMM yyyy", { locale: fr }) : "Sélectionner un mois"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedMonth}
                onSelect={(date) => {
                  if (date) {
                    debugLog("Changement de mois:", {
                      from: format(selectedMonth, "yyyy-MM"),
                      to: format(date, "yyyy-MM")
                    });
                    setSelectedMonth(date);
                  }
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Résumé du mois */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4 p-4 bg-blue-50 dark:bg-slate-700 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{totalQuantity}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total livraisons</div>
            <div className="text-xs text-gray-500 dark:text-gray-500">
              Normal: {normalQuantity} | Décalé: {delayedQuantity}
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {totalCommissionsDh.toFixed(2)} DH
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total commissions</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {(totalCommissionsDh / 10.5).toFixed(2)}$
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Équivalent USD</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{delayedQuantity}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Livraisons décalées</div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Product Deliveries Summary */}
        <ProductDeliverySummary />
        
        {sortedDates.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            Aucune donnée pour ce mois
          </div>
        ) : (
          <div className="space-y-6">
            {sortedDates.map((date) => {
              const dateRows = groupedByDate[date];
              const { totalQuantity: dayQuantity, totalCommission: dayCommission } = getDateStats(dateRows);
              
              return (
                <div key={date} className="border rounded-lg p-4 bg-gray-50 dark:bg-slate-700">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                      {format(new Date(date), "EEEE dd MMMM yyyy", { locale: fr })}
                    </h3>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="font-medium text-blue-600 dark:text-blue-400">
                        {dayQuantity} livraisons
                      </span>
                      <span className="font-semibold text-green-600 dark:text-green-400">
                        {dayCommission.toFixed(2)} DH
                      </span>
                    </div>
                  </div>
                  
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Produit</TableHead>
                        <TableHead>CPD</TableHead>
                        <TableHead>Quantité</TableHead>
                        <TableHead>Montant</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dateRows.map((row) => (
                        <TableRow key={row.id}>
                          <TableCell className="font-medium">{row.product_name}</TableCell>
                          <TableCell>
                            <EditableCpdCell
                              value={row.cpd_category}
                              onSave={(newCpd) => updateCpdMutation.mutate({
                                profitRowId: row.id,
                                newCpd,
                                productName: row.product_name,
                                quantity: row.quantity
                              })}
                              isUpdating={updateCpdMutation.isPending}
                            />
                          </TableCell>
                          <TableCell>
                            <EditableQuantityCell
                              value={row.quantity}
                              onSave={(newQuantity) => handleUpdate(row.id, newQuantity)}
                              isUpdating={updateMutation.isPending}
                            />
                          </TableCell>
                          <TableCell className="font-semibold text-green-600 dark:text-green-400">
                            {row.commission_total.toFixed(2)} DH
                          </TableCell>
                          <TableCell>
                            <Badge variant={row.source_type === 'décalée' ? 'secondary' : 'default'}>
                              {row.source_type === 'décalée' ? 'Décalée' : 'Normal'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(row.id)}
                              disabled={deleteMutation.isPending}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              {deleteMutation.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
