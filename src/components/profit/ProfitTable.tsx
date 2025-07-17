import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { CPD_CATEGORIES } from "@/types/profit";
import { useProfitRows, useAddProfitRow, useDeleteProfitRow, useUpdateProfitRow } from "@/hooks/useProfitTracking";
import { useProducts } from "@/hooks/useProducts";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import CategorySection from "./CategorySection";
import { CPDSelector } from "./CPDSelector";
import { useState } from "react";

interface ProfitTableProps {
  selectedDate?: Date;
  onDateChange?: (date: Date) => void;
}

// Wrapper pour logs conditionnels
function debugLog(message: string, data?: any) {
  if (process.env.NODE_ENV !== 'production') {
    console.debug(`[ProfitTable] ${message}`, data);
  }
}

export default function ProfitTable({ selectedDate = new Date(), onDateChange }: ProfitTableProps) {
  const { user } = useAuth();
  const selectedDateString = format(selectedDate, "yyyy-MM-dd");
  
  const { data: profitRows = [], isLoading, isFetching, refetch } = useProfitRows(selectedDate);
  const { data: products = [] } = useProducts();
  const addMutation = useAddProfitRow();
  const deleteMutation = useDeleteProfitRow();
  const updateMutation = useUpdateProfitRow();

  // Nouvel état pour la sélection CPD
  const [selectedCPD, setSelectedCPD] = useState<number | null>(null);

  // Filtrer les données pour la date exacte sélectionnée
  const todayProfitRows = profitRows.filter(row => row.date === selectedDateString);
  
  debugLog("Données filtrées pour la date:", {
    selectedDateString,
    totalRows: profitRows.length,
    filteredRows: todayProfitRows.length,
    allDates: profitRows.map(r => r.date)
  });

  const handleAddProduct = async (cpdCategory: number, productName: string, quantity: number) => {
    if (!user) {
      console.error("Utilisateur non connecté");
      return;
    }

    debugLog("handleAddProduct:", { 
      cpdCategory, 
      productName, 
      quantity, 
      selectedDate: selectedDateString,
      user: user.id 
    });

    const commission_total = quantity * cpdCategory;

    try {
      const result = await addMutation.mutateAsync({
        user_id: user.id,
        date: selectedDateString,
        cpd_category: cpdCategory,
        product_name: productName,
        quantity,
        commission_total,
      });
      
      debugLog("Résultat ajout:", result);
      
      if (result.wasUpdated) {
        toast({
          title: "Quantité mise à jour",
          description: `Produit "${productName}" : quantité augmentée de ${quantity} unités`,
        });
      } else {
        toast({
          title: "Succès",
          description: `Produit "${productName}" ajouté (${quantity} unités)`,
        });
      }
      
      // Forcer un refetch immédiat pour s'assurer que les données sont à jour
      setTimeout(() => {
        refetch();
      }, 300);
      
    } catch (error) {
      console.error("Erreur lors de l'ajout:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter le produit",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast({
        title: "Supprimé ✅",
        description: "Produit supprimé avec succès",
      });
      
      // Forcer un refetch immédiat
      setTimeout(() => {
        refetch();
      }, 300);
      
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
      
      // Forcer un refetch immédiat
      setTimeout(() => {
        refetch();
      }, 300);
      
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le produit",
        variant: "destructive",
      });
    }
  };

  const getProductsForCategory = (category: number) => {
    // Utiliser les données déjà filtrées pour la date sélectionnée
    const filteredProducts = todayProfitRows.filter(r => 
      r.cpd_category === category && 
      r.source_type === 'normale'
    );
    
    debugLog(`Produits pour CPD ${category} le ${selectedDateString}:`, {
      category,
      date: selectedDateString,
      filteredCount: filteredProducts.length,
      products: filteredProducts.map(p => ({ name: p.product_name, quantity: p.quantity }))
    });
    
    return filteredProducts;
  };

  return (
    <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-600 transition-colors">
      <CardHeader>
        <CardTitle className="text-xl text-blue-800 dark:text-blue-400 flex items-center gap-2">
          📃 Commissions CPD
          {isFetching && <Loader2 className="h-4 w-4 animate-spin" />}
        </CardTitle>
        
        {/* Sélecteur de date */}
        <div className="flex items-center gap-4 mt-4">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            📅 Date sélectionnée :
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
                    debugLog("Changement de date:", {
                      from: selectedDateString,
                      to: format(date, "yyyy-MM-dd")
                    });
                    onDateChange(date);
                  }
                }}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Sélecteur CPD */}
        <div className="mt-4">
          <CPDSelector selectedCPD={selectedCPD} onCPDChange={setSelectedCPD} />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Chargement des données...</span>
          </div>
        ) : selectedCPD ? (
          /* Afficher uniquement la catégorie sélectionnée */
          <CategorySection
            key={selectedCPD}
            category={selectedCPD}
            products={getProductsForCategory(selectedCPD)}
            availableProducts={products}
            onDelete={handleDelete}
            onUpdate={handleUpdate}
            onAdd={handleAddProduct}
            isDeleting={deleteMutation.isPending}
            isUpdating={updateMutation.isPending}
            isAdding={addMutation.isPending}
          />
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Badge variant="outline" className="text-blue-600">
              💡 Sélectionnez une tranche CPD pour commencer à ajouter des produits
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
