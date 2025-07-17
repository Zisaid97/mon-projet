
import { useState } from "react";
import { Edit3, Check, X, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TableCell, TableRow } from "@/components/ui/table";
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
import { ProfitRow } from "@/types/profit";
import { EditableQuantityCell } from "./EditableQuantityCell";

interface ProductRowProps {
  product: ProfitRow;
  onDelete: (id: string) => void;
  onUpdate: (id: string, quantity: number, productName?: string) => void;
  isDeleting: boolean;
  isUpdating: boolean;
}

export default function ProductRow({ product, onDelete, onUpdate, isDeleting, isUpdating }: ProductRowProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [editProductName, setEditProductName] = useState("");

  const startEditName = () => {
    setIsEditingName(true);
    setEditProductName(product.product_name);
  };

  const cancelEditName = () => {
    setIsEditingName(false);
    setEditProductName("");
  };

  const saveEditName = () => {
    if (!editProductName.trim()) {
      return;
    }
    onUpdate(product.id, product.quantity, editProductName.trim());
    setIsEditingName(false);
    setEditProductName("");
  };

  const handleQuantityUpdate = (newQuantity: number) => {
    onUpdate(product.id, newQuantity);
  };

  return (
    <TableRow>
      <TableCell className="font-medium">
        {isEditingName ? (
          <div className="flex items-center gap-2">
            <Input
              type="text"
              value={editProductName}
              onChange={(e) => setEditProductName(e.target.value)}
              className="min-w-32"
              placeholder="Nom du produit"
            />
            <Button
              size="sm"
              variant="outline"
              onClick={saveEditName}
              disabled={isUpdating}
            >
              <Check className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={cancelEditName}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span>{product.product_name}</span>
            <Button
              size="sm"
              variant="ghost"
              onClick={startEditName}
              className="text-gray-600 hover:text-gray-900"
            >
              <Edit3 className="w-4 h-4" />
            </Button>
          </div>
        )}
      </TableCell>
      <TableCell className="font-mono">
        <EditableQuantityCell
          value={product.quantity}
          onSave={handleQuantityUpdate}
          isUpdating={isUpdating}
        />
      </TableCell>
      <TableCell className="font-mono text-green-600">
        {product.commission_total.toFixed(2)} DH
      </TableCell>
      <TableCell>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              size="sm"
              variant="destructive"
              disabled={isDeleting}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Supprimer le produit</AlertDialogTitle>
              <AlertDialogDescription>
                Êtes-vous sûr de vouloir supprimer "{product.product_name}" ? 
                Cette action est irréversible.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction 
                onClick={() => onDelete(product.id)}
                className="bg-red-600 hover:bg-red-700"
              >
                Supprimer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </TableCell>
    </TableRow>
  );
}
