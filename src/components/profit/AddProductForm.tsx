
import { useState } from "react";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { useProducts } from "@/hooks/useProducts";

interface AddProductFormProps {
  category: number;
  onAdd: (category: number, productName: string, quantity: number) => void;
  isLoading: boolean;
}

// Wrapper pour logs conditionnels
function debugLog(message: string, data?: any) {
  if (process.env.NODE_ENV !== 'production') {
    console.debug(`[AddProductForm] ${message}`, data);
  }
}

export default function AddProductForm({ category, onAdd, isLoading }: AddProductFormProps) {
  const [open, setOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [customProduct, setCustomProduct] = useState("");
  const [quantity, setQuantity] = useState(1);

  const { data: allProducts = [] } = useProducts();
  
  // Filtrer les produits par catégorie CPD
  const productsForCategory = allProducts.filter(p => p.cpd_category === category);
  
  // Créer une liste unique de noms de produits
  const productNames = [...new Set(productsForCategory.map(p => p.name))];

  debugLog(`Formulaire CPD ${category}:`, {
    productsForCategory: productsForCategory.length,
    productNames: productNames.length,
    selectedProduct,
    customProduct,
    quantity
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const productName = selectedProduct || customProduct;
    if (productName && quantity > 0) {
      debugLog("Soumission du formulaire:", { category, productName, quantity });
      onAdd(category, productName, quantity);
      setSelectedProduct("");
      setCustomProduct("");
      setQuantity(1);
      setOpen(false);
    } else {
      debugLog("Soumission échouée - données manquantes:", { productName, quantity });
    }
  };

  const displayValue = selectedProduct || customProduct;

  return (
    <div className="border rounded-lg p-4 bg-gray-50 dark:bg-slate-700">
      <h4 className="text-sm font-medium mb-3 text-gray-700 dark:text-slate-300">
        Ajouter un produit CPD {category} DH
      </h4>
      <form onSubmit={handleSubmit} className="flex items-end gap-2">
        <div className="flex-grow">
          <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Produit</label>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full justify-between mt-1 font-normal"
                disabled={isLoading}
              >
                {displayValue || "Sélectionner ou saisir un produit"}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <Command>
                <CommandInput
                  placeholder="Rechercher ou saisir un nouveau produit..."
                  value={customProduct}
                  onValueChange={setCustomProduct}
                />
                <CommandList>
                  <CommandEmpty>
                    {customProduct && (
                      <div className="p-2">
                        <Button
                          onClick={() => {
                            debugLog("Utilisation du produit custom:", customProduct);
                            setSelectedProduct("");
                            setOpen(false);
                          }}
                          className="w-full"
                          variant="outline"
                        >
                          Utiliser "{customProduct}"
                        </Button>
                      </div>
                    )}
                  </CommandEmpty>
                  <CommandGroup>
                    {productNames.map((productName) => (
                      <CommandItem
                        key={productName}
                        value={productName}
                        onSelect={(currentValue) => {
                          debugLog("Sélection du produit:", currentValue);
                          setSelectedProduct(currentValue);
                          setCustomProduct("");
                          setOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedProduct === productName ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {productName}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
        
        <div className="w-24">
          <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Quantité</label>
          <Input
            type="number"
            value={quantity}
            onChange={(e) => {
              const newQuantity = parseInt(e.target.value) || 1;
              debugLog("Changement de quantité:", newQuantity);
              setQuantity(newQuantity);
            }}
            min="1"
            className="mt-1"
            disabled={isLoading}
          />
        </div>
        
        <Button 
          type="submit" 
          disabled={isLoading || (!selectedProduct && !customProduct) || quantity <= 0}
          className="flex items-center gap-2"
        >
          {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          {isLoading ? "Ajout..." : "Ajouter"}
        </Button>
      </form>
    </div>
  );
}
