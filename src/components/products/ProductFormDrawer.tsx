
import { useState } from "react";
import { useAddProduct } from "@/hooks/useProducts";
import { ProductInput } from "@/types/product";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface ProductFormDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProductFormDrawer = ({ isOpen, onClose }: ProductFormDrawerProps) => {
  const [formData, setFormData] = useState<ProductInput>({
    name: "",
    cpd_category: 15,
    product_link: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const addProductMutation = useAddProduct();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "Nom requis",
        description: "Veuillez saisir un nom pour le produit",
        variant: "destructive",
      });
      return;
    }

    // Validation URL si fournie
    if (formData.product_link && formData.product_link.trim()) {
      const urlRegex = /^https?:\/\/.+/i;
      if (!urlRegex.test(formData.product_link.trim())) {
        toast({
          title: "URL invalide",
          description: "L'URL doit commencer par http:// ou https://",
          variant: "destructive",
        });
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const productToAdd: ProductInput = {
        name: formData.name.trim(),
        cpd_category: formData.cpd_category,
        product_link: formData.product_link?.trim() || undefined,
      };

      await addProductMutation.mutateAsync(productToAdd);
      
      toast({
        title: "✅ Produit créé",
        description: `"${formData.name}" a été ajouté avec succès`,
      });

      // Reset form
      setFormData({
        name: "",
        cpd_category: 15,
        product_link: "",
      });
      
      onClose();
    } catch (error) {
      console.error('Erreur création produit:', error);
      toast({
        title: "Erreur de création",
        description: "Impossible de créer le produit",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (isSubmitting) return;
    
    // Reset form
    setFormData({
      name: "",
      cpd_category: 15,
      product_link: "",
    });
    
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleClose}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>🆕 Nouveau produit</SheetTitle>
          <SheetDescription>
            Créez un nouveau produit. Vous pourrez ajouter l'image et les mots-clés après création.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          {/* Nom du produit */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Nom du produit <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Ex: Crème hydratante visage"
              autoFocus
              disabled={isSubmitting}
            />
          </div>

          {/* Catégorie CPD */}
          <div className="space-y-2">
            <Label htmlFor="cpd_category">Catégorie CPD (commission en DH)</Label>
            <Input
              id="cpd_category"
              type="number"
              min="1"
              max="1000"
              value={formData.cpd_category}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                cpd_category: parseInt(e.target.value) || 15 
              }))}
              disabled={isSubmitting}
            />
            <p className="text-xs text-gray-500">
              Commission par livraison réussie
            </p>
          </div>

          {/* Lien externe */}
          <div className="space-y-2">
            <Label htmlFor="product_link">Lien externe (optionnel)</Label>
            <Input
              id="product_link"
              type="url"
              value={formData.product_link}
              onChange={(e) => setFormData(prev => ({ ...prev, product_link: e.target.value }))}
              placeholder="https://example.com/produit"
              disabled={isSubmitting}
            />
            <p className="text-xs text-gray-500">
              Lien vers la page du produit, boutique, etc.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1"
            >
              Annuler
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || !formData.name.trim()}
              className="flex-1"
            >
              {isSubmitting ? "Création..." : "Créer"}
            </Button>
          </div>
        </form>

        {/* Raccourci clavier info */}
        <div className="mt-6 p-3 bg-blue-50 rounded-lg">
          <p className="text-xs text-blue-700">
            💡 <strong>Astuce :</strong> Utilisez <kbd className="px-1 py-0.5 bg-blue-200 rounded text-xs">⌘+Shift+P</kbd> pour ouvrir rapidement ce formulaire
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
};
