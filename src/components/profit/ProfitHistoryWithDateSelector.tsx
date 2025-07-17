
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, Loader2, CalendarRange } from "lucide-react";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useProfitRows, useDeleteProfitRow, useUpdateProfitRow } from "@/hooks/useProfitTracking";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";
import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell } from "@/components/ui/table";
import { EditableQuantityCell } from "./EditableQuantityCell";
import { EditableCpdCell } from "./EditableCpdCell";
import { useUpdateProductCpd } from "@/hooks/useUpdateProductCpd";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DateRange } from "react-day-picker";

export default function ProfitHistoryWithDateSelector() {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [viewMode, setViewMode] = useState<"single" | "range">("single");
  
  const { data: profitRows = [], isLoading } = useProfitRows();
  const deleteMutation = useDeleteProfitRow();
  const updateMutation = useUpdateProfitRow();
  const updateCpdMutation = useUpdateProductCpd();

  // Filtrer les données selon le mode de sélection
  const getFilteredData = () => {
    if (viewMode === "single" && selectedDate) {
      return profitRows.filter(row => row.date === format(selectedDate, "yyyy-MM-dd"));
    } else if (viewMode === "range" && dateRange?.from && dateRange?.to) {
      const startDate = format(dateRange.from, "yyyy-MM-dd");
      const endDate = format(dateRange.to, "yyyy-MM-dd");
      return profitRows.filter(row => row.date >= startDate && row.date <= endDate);
    }
    return [];
  };

  const filteredData = getFilteredData();

  // Calculer les totaux par produit pour le graphique
  const getProductTotals = () => {
    const productTotals = new Map<string, number>();
    
    filteredData.forEach(row => {
      const current = productTotals.get(row.product_name) || 0;
      productTotals.set(row.product_name, current + row.quantity);
    });

    return Array.from(productTotals.entries())
      .map(([name, quantity]) => ({ name, quantity }))
      .sort((a, b) => b.quantity - a.quantity);
  };

  const productTotals = getProductTotals();
  const maxQuantity = Math.max(...productTotals.map(p => p.quantity), 1);

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast({
        title: "Supprimé ✅",
        description: "Produit supprimé avec succès",
      });
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
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le produit",
        variant: "destructive",
      });
    }
  };

  const handleMonthSelect = () => {
    const now = new Date();
    const start = startOfMonth(now);
    const end = endOfMonth(now);
    setDateRange({ from: start, to: end });
    setViewMode("range");
  };

  const totalQuantity = filteredData.reduce((sum, row) => sum + row.quantity, 0);
  const totalCommissions = filteredData.reduce((sum, row) => sum + row.commission_total, 0);

  return (
    <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-600">
      <CardHeader>
        <CardTitle className="text-xl text-blue-800 dark:text-blue-400 flex items-center gap-2">
          📊 Historique des Livraisons
        </CardTitle>
        
        {/* Sélecteur de mode et de date */}
        <div className="space-y-4">
          <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as "single" | "range")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="single">📅 Date unique</TabsTrigger>
              <TabsTrigger value="range">📊 Période</TabsTrigger>
            </TabsList>
            
            <TabsContent value="single" className="space-y-4">
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  📅 Sélectionnez une date :
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-[240px] justify-start text-left font-normal",
                        !selectedDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, "PPP", { locale: fr }) : "Sélectionner une date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </TabsContent>

            <TabsContent value="range" className="space-y-4">
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  📊 Sélectionnez une période :
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-[280px] justify-start text-left font-normal",
                        !dateRange && "text-muted-foreground"
                      )}
                    >
                      <CalendarRange className="mr-2 h-4 w-4" />
                      {dateRange?.from && dateRange?.to 
                        ? `${format(dateRange.from, "dd MMM", { locale: fr })} - ${format(dateRange.to, "dd MMM yyyy", { locale: fr })}`
                        : "Sélectionner une période"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="range"
                      selected={dateRange}
                      onSelect={setDateRange}
                      initialFocus
                      className="pointer-events-auto"
                      numberOfMonths={2}
                    />
                  </PopoverContent>
                </Popover>
                <Button variant="outline" onClick={handleMonthSelect}>
                  Mois actuel
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {!selectedDate && !dateRange && (
          <Badge variant="outline" className="text-blue-600 mt-2 w-fit">
            💡 Sélectionnez une date ou période pour voir le détail des livraisons
          </Badge>
        )}
      </CardHeader>
      
      <CardContent>
        {(selectedDate || dateRange) && (
          <>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2">Chargement des données...</span>
              </div>
            ) : filteredData.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Badge variant="outline" className="text-orange-600">
                  📭 Aucune livraison enregistrée pour cette période
                </Badge>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Résumé des totaux */}
                <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-slate-700 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                    📦 Livraisons par produit - {viewMode === "single" && selectedDate 
                      ? format(selectedDate, "EEEE dd MMMM yyyy", { locale: fr })
                      : dateRange?.from && dateRange?.to 
                        ? `${format(dateRange.from, "dd MMM", { locale: fr })} - ${format(dateRange.to, "dd MMM yyyy", { locale: fr })}`
                        : "Période sélectionnée"
                    }
                  </h3>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="font-medium text-blue-600 dark:text-blue-400">
                      {totalQuantity} livraisons
                    </span>
                    <span className="font-semibold text-green-600 dark:text-green-400">
                      {totalCommissions.toFixed(2)} DH
                    </span>
                  </div>
                </div>

                {/* Graphique horizontal des livraisons par produit */}
                {productTotals.length > 0 && (
                  <div className="space-y-3">
                    {productTotals.map((product, index) => {
                      const percentage = (product.quantity / maxQuantity) * 100;
                      return (
                        <div key={index} className="space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              {product.name}
                            </span>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {product.quantity} ({((product.quantity / totalQuantity) * 100).toFixed(1)}%)
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                    <div className="text-right mt-2">
                      <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                        Total : {totalQuantity} livraisons
                      </span>
                    </div>
                  </div>
                )}

                {/* Tableau détaillé par date */}
                <div className="space-y-4">
                  {viewMode === "range" ? (
                    // Grouper par date pour la vue période
                    Object.entries(
                      filteredData.reduce((acc, row) => {
                        const date = row.date;
                        if (!acc[date]) acc[date] = [];
                        acc[date].push(row);
                        return acc;
                      }, {} as Record<string, typeof filteredData>)
                    ).map(([date, rows]) => (
                      <div key={date} className="space-y-2">
                        <div className="flex items-center justify-between bg-gray-50 dark:bg-slate-700 p-3 rounded">
                          <h4 className="font-medium text-gray-800 dark:text-gray-200">
                            {format(new Date(date), "EEEE dd MMMM yyyy", { locale: fr })}
                          </h4>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="text-blue-600 dark:text-blue-400">
                              {rows.reduce((sum, row) => sum + row.quantity, 0)} livraisons
                            </span>
                            <span className="text-green-600 dark:text-green-400">
                              {rows.reduce((sum, row) => sum + row.commission_total, 0).toFixed(2)} DH
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
                            {rows.map((row) => (
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
                                      "🗑️"
                                    )}
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ))
                  ) : (
                    // Vue simple pour une seule date
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
                        {filteredData.map((row) => (
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
                                  "🗑️"
                                )}
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
