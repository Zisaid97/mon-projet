
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit3, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useProductSpendAttributions, useDeleteProductSpendAttribution } from "@/hooks/useProductSpendAttribution";
import { useProducts } from "@/hooks/useProducts";
import { ProductSpendAttribution, ATTRIBUTION_PLATFORMS } from "@/types/product-spend-attribution";
import { toast } from "@/hooks/use-toast";
import EditProductSpendAttributionDialog from "./EditProductSpendAttributionDialog";

export default function ProductSpendAttributionTable() {
  const [filterProduct, setFilterProduct] = useState("");
  const [filterPlatform, setFilterPlatform] = useState("");
  const [editingAttribution, setEditingAttribution] = useState<ProductSpendAttribution | null>(null);

  const { data: attributions = [], isLoading } = useProductSpendAttributions();
  const { data: products = [] } = useProducts();
  const deleteMutation = useDeleteProductSpendAttribution();

  const handleDelete = async (id: string, productName: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer l'attribution pour "${productName}" ?`)) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(id);
      toast({
        title: "Supprimé ✅",
        description: "Attribution supprimée avec succès",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'attribution",
        variant: "destructive",
      });
    }
  };

  // Memoized filtering to prevent recalculation on every render
  const filteredAttributions = useMemo(() => {
    return attributions.filter(attr => {
      const matchesProduct = !filterProduct || attr.product_name.toLowerCase().includes(filterProduct.toLowerCase());
      const matchesPlatform = !filterPlatform || filterPlatform === "all" || attr.platform === filterPlatform;
      return matchesProduct && matchesPlatform;
    });
  }, [attributions, filterProduct, filterPlatform]);

  // Memoized totals calculation
  const { totalAmount, uniqueProducts } = useMemo(() => {
    const totalAmount = filteredAttributions.reduce((sum, attr) => sum + attr.amount_spent_mad, 0);
    const uniqueProducts = new Set(filteredAttributions.map(attr => attr.product_name));
    return { totalAmount, uniqueProducts };
  }, [filteredAttributions]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Chargement des attributions...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">📊 Récapitulatif des dépenses par produit</CardTitle>
          
          {/* Résumé global */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{totalAmount.toFixed(2)} DH</div>
              <div className="text-sm text-blue-700">Total des dépenses attribuées</div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{uniqueProducts.size}</div>
              <div className="text-sm text-green-700">Produits liés</div>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{filteredAttributions.length}</div>
              <div className="text-sm text-purple-700">Attributions actives</div>
            </div>
          </div>

          {/* Filtres */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div>
              <Input
                placeholder="Filtrer par produit..."
                value={filterProduct}
                onChange={(e) => setFilterProduct(e.target.value)}
              />
            </div>
            <div>
              <Select value={filterPlatform} onValueChange={setFilterPlatform}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrer par plateforme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les plateformes</SelectItem>
                  {ATTRIBUTION_PLATFORMS.map((platform) => (
                    <SelectItem key={platform} value={platform}>
                      {platform}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Button
                variant="outline"
                onClick={() => {
                  setFilterProduct("");
                  setFilterPlatform("");
                }}
              >
                Réinitialiser
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredAttributions.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              {attributions.length === 0 
                ? "Aucune attribution de dépense enregistrée" 
                : "Aucune attribution ne correspond aux filtres sélectionnés"
              }
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produit</TableHead>
                    <TableHead>Montant (DH)</TableHead>
                    <TableHead>Période</TableHead>
                    <TableHead>Plateforme</TableHead>
                    <TableHead>Note</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAttributions.map((attribution) => (
                    <TableRow key={attribution.id}>
                      <TableCell className="font-medium">
                        {attribution.product_name}
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold text-green-600">
                          {attribution.amount_spent_mad.toFixed(2)} DH
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{format(new Date(attribution.start_date), "dd MMM yyyy", { locale: fr })}</div>
                          <div className="text-gray-500">
                            → {format(new Date(attribution.end_date), "dd MMM yyyy", { locale: fr })}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                          {attribution.platform}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-600 max-w-32 truncate">
                          {attribution.notes || "-"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingAttribution(attribution)}
                          >
                            <Edit3 className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(attribution.id, attribution.product_name)}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog d'édition */}
      <EditProductSpendAttributionDialog
        attribution={editingAttribution}
        onClose={() => setEditingAttribution(null)}
      />
    </>
  );
}
