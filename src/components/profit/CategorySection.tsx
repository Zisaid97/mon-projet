
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ProfitRow } from "@/types/profit";
import { Product } from "@/types/product";
import ProductRow from "./ProductRow";
import AddProductForm from "./AddProductForm";

interface CategorySectionProps {
  category: number;
  products: ProfitRow[];
  availableProducts: Product[];
  onDelete: (id: string) => void;
  onUpdate: (id: string, quantity: number, productName?: string) => void;
  onAdd: (category: number, productName: string, quantity: number) => void;
  isDeleting: boolean;
  isUpdating: boolean;
  isAdding: boolean;
}

// Wrapper pour logs conditionnels
function debugLog(message: string, data?: any) {
  if (process.env.NODE_ENV !== 'production') {
    console.debug(`[CategorySection] ${message}`, data);
  }
}

export default function CategorySection({
  category,
  products,
  availableProducts,
  onDelete,
  onUpdate,
  onAdd,
  isDeleting,
  isUpdating,
  isAdding,
}: CategorySectionProps) {
  const totalQuantity = products.reduce((sum, product) => sum + product.quantity, 0);
  const totalCommission = products.reduce((sum, product) => sum + product.commission_total, 0);

  debugLog(`CPD ${category}:`, {
    productsCount: products.length,
    totalQuantity,
    totalCommission,
    availableProducts: availableProducts.length
  });

  const handleAddProduct = (category: number, productName: string, quantity: number) => {
    debugLog("handleAddProduct appelé:", { category, productName, quantity });
    onAdd(category, productName, quantity);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="text-lg font-semibold text-blue-600 dark:text-blue-400">
            CPD {category} DH
          </span>
          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-slate-400">
            <span>Total: {totalQuantity} livraisons</span>
            <span className="font-semibold text-green-600 dark:text-green-400">
              {totalCommission.toFixed(2)} DH
            </span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Formulaire d'ajout de produit */}
        <AddProductForm
          category={category}
          onAdd={handleAddProduct}
          isLoading={isAdding}
        />

        {/* Tableau des produits pour cette catégorie */}
        {products.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produit</TableHead>
                <TableHead>Quantité</TableHead>
                <TableHead>Commission</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <ProductRow
                  key={product.id}
                  product={product}
                  onDelete={onDelete}
                  onUpdate={onUpdate}
                  isDeleting={isDeleting}
                  isUpdating={isUpdating}
                />
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
