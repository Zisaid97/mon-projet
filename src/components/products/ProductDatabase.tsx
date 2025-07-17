
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, Plus } from "lucide-react";
import { useProducts, useAddProduct, useUpdateProduct, useDeleteProduct } from "@/hooks/useProducts";
import { toast } from "@/hooks/use-toast";
import { CPD_CATEGORIES } from "@/types/profit";
import { EditableCpdCell } from "./EditableCpdCell";

export default function ProductDatabase() {
  const [newProductName, setNewProductName] = useState("");
  const [newProductCpd, setNewProductCpd] = useState<number | "">("");

  const { data: products = [], isLoading } = useProducts();
  const addMutation = useAddProduct();
  const updateMutation = useUpdateProduct();
  const deleteMutation = useDeleteProduct();

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newProductName.trim() || newProductCpd === "" || newProductCpd <= 0) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs correctement",
        variant: "destructive",
      });
      return;
    }

    try {
      await addMutation.mutateAsync({
        name: newProductName.trim(),
        cpd_category: Number(newProductCpd),
      });
      
      toast({
        title: "Succès",
        description: `Produit "${newProductName}" ajouté avec succès`,
      });
      
      setNewProductName("");
      setNewProductCpd("");
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter le produit",
        variant: "destructive",
      });
    }
  };

  const handleUpdateCpd = async (productId: string, newCpd: number) => {
    try {
      await updateMutation.mutateAsync({
        id: productId,
        cpd_category: newCpd,
      });
      
      toast({
        title: "Modifié ✅",
        description: "Commission mise à jour avec succès",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de modifier la commission",
        variant: "destructive",
      });
    }
  };

  const handleDeleteProduct = async (productId: string, productName: string) => {
    try {
      await deleteMutation.mutateAsync(productId);
      toast({
        title: "Supprimé ✅",
        description: `Produit "${productName}" supprimé avec succès`,
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le produit",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Chargement des produits...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-600 transition-colors">
      <CardHeader>
        <CardTitle className="text-xl text-orange-800 dark:text-orange-400">
          🧮 Base de Produits
        </CardTitle>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Gérez votre liste de produits pour accélérer la saisie des commissions
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Formulaire d'ajout */}
        <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
          <div className="md:col-span-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
              Nom du produit
            </label>
            <Input
              placeholder="Ex: alprostadil"
              value={newProductName}
              onChange={(e) => setNewProductName(e.target.value)}
              required
            />
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
              Commission (CPD)
            </label>
            <Select value={newProductCpd.toString()} onValueChange={(value) => setNewProductCpd(Number(value))} required>
              <SelectTrigger>
                <SelectValue placeholder="Choisir CPD" />
              </SelectTrigger>
              <SelectContent>
                {CPD_CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category.toString()}>
                    {category.toFixed(2)} DH
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <Button 
            type="submit" 
            disabled={addMutation.isPending}
            className="bg-orange-600 hover:bg-orange-700 text-white"
          >
            <Plus className="w-4 h-4 mr-1" />
            {addMutation.isPending ? "Ajout..." : "Ajouter"}
          </Button>
        </form>

        {/* Tableau des produits */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom du produit</TableHead>
                <TableHead>Commission (CPD)</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8 text-gray-500 dark:text-gray-400">
                    Aucun produit enregistré. Ajoutez votre premier produit ci-dessus.
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>
                      <EditableCpdCell
                        value={product.cpd_category}
                        onSave={(newCpd) => handleUpdateCpd(product.id, newCpd)}
                        isUpdating={updateMutation.isPending}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteProduct(product.id, product.name)}
                        disabled={deleteMutation.isPending}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {products.length > 0 && (
          <div className="text-sm text-gray-600 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
            💡 <strong>{products.length} produits</strong> enregistrés. Cliquez sur l'icône ✏️ pour modifier les commissions directement.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
