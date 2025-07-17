
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { CPD_CATEGORIES } from "@/types/profit";
import { useProfitRows, useAddProfitRow, useDeleteProfitRow, useUpdateProfitRow } from "@/hooks/useProfitTracking";
import { useProducts } from "@/hooks/useProducts";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import CategorySection from "./CategorySection";
import DelayedDeliveriesSummary from "./DelayedDeliveriesSummary";

interface DelayedDeliveriesTabProps {
  selectedDate?: Date;
  onDateChange?: (date: Date) => void;
}

export default function DelayedDeliveriesTab({ selectedDate = new Date(), onDateChange }: DelayedDeliveriesTabProps) {
  const { user } = useAuth();
  const selectedDateString = format(selectedDate, "yyyy-MM-dd");
  
  const { data: profitRows = [], isLoading } = useProfitRows(selectedDate);
  const { data: products = [] } = useProducts(); // Récupérer la liste des produits
  const addMutation = useAddProfitRow();
  const deleteMutation = useDeleteProfitRow();
  const updateMutation = useUpdateProfitRow();

  console.log("Products dans DelayedDeliveriesTab:", products); // Debug

  // Filtrer uniquement les livraisons décalées
  const delayedRows = profitRows.filter(row => row.source_type === 'décalée');

  const handleAddProduct = async (cpdCategory: number, productName: string, quantity: number) => {
    if (!user) return;

    const commission_total = quantity * cpdCategory;

    try {
      const result = await addMutation.mutateAsync({
        user_id: user.id,
        date: selectedDateString,
        cpd_category: cpdCategory,
        product_name: productName,
        quantity,
        commission_total,
        source_type: 'décalée', // Marquer comme livraison décalée
      });
      
      if (result.wasUpdated) {
        toast({
          title: "Quantité mise à jour",
          description: `Livraison décalée "${productName}" : quantité augmentée de ${quantity} unités`,
        });
      } else {
        toast({
          title: "Succès",
          description: `Livraison décalée "${productName}" ajoutée (${quantity} unités)`,
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter la livraison décalée",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast({
        title: "Supprimé ✅",
        description: "Livraison décalée supprimée avec succès",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la livraison décalée",
        variant: "destructive",
      });
    }
  };

  const handleUpdate = async (id: string, quantity: number, productName?: string) => {
    try {
      await updateMutation.mutateAsync({ id, quantity, productName });
      toast({
        title: "Modifications enregistrées avec succès ✅",
        description: productName ? "Livraison décalée mise à jour" : "Quantité mise à jour",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour la livraison décalée",
        variant: "destructive",
      });
    }
  };

  const getProductsForCategory = (category: number) => {
    return delayedRows.filter(r => r.cpd_category === category && r.date === selectedDateString);
  };

  // Calculer les totaux pour les livraisons décalées du jour sélectionné
  const todayDelayedRows = delayedRows.filter(r => r.date === selectedDateString);
  const totalDelayedQuantity = todayDelayedRows.reduce((sum, row) => sum + row.quantity, 0);
  const totalDelayedCommission = todayDelayedRows.reduce((sum, row) => sum + row.commission_total, 0);

  return (
    <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-600 transition-colors">
      <CardHeader>
        <CardTitle className="text-xl text-purple-800 dark:text-purple-400">📦 Livraisons Décalées</CardTitle>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Saisir les livraisons du mois en cours provenant de leads des mois précédents
        </p>
        
        {/* Sélecteur de date */}
        <div className="flex items-center gap-4 mt-4">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            📅 Date de livraison :
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
                onSelect={(date) => {
                  if (date && onDateChange) {
                    onDateChange(date);
                  }
                }}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Résumé des livraisons décalées */}
        <DelayedDeliveriesSummary 
          totalQuantity={totalDelayedQuantity}
          totalCommission={totalDelayedCommission}
        />

        {/* Tableau des catégories CPD pour livraisons décalées */}
        {CPD_CATEGORIES.map((category) => {
          const products_for_category = getProductsForCategory(category);
          
          return (
            <CategorySection
              key={category}
              category={category}
              products={products_for_category}
              availableProducts={products} // Passer la liste des produits disponibles
              onDelete={handleDelete}
              onUpdate={handleUpdate}
              onAdd={handleAddProduct}
              isDeleting={deleteMutation.isPending}
              isUpdating={updateMutation.isPending}
              isAdding={addMutation.isPending}
            />
          );
        })}
      </CardContent>
    </Card>
  );
}
