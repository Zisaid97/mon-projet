
import { useState } from "react";
import { Product } from "@/types/product";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProductDetailsTab } from "./ProductDetailsTab";
import { ProductKeywordsTab } from "./ProductKeywordsTab";
import { ProductResearchTab } from "./ProductResearchTab";
import { Settings, Tags, Search } from "lucide-react";

interface ProductModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

export const ProductModal = ({ product, isOpen, onClose }: ProductModalProps) => {
  const [activeTab, setActiveTab] = useState("details");

  const handleClose = () => {
    setActiveTab("details"); // Reset to first tab
    onClose();
  };

  // Focus trap et fermeture avec Esc
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent 
        className="max-w-2xl max-h-[90vh] overflow-y-auto"
        onKeyDown={handleKeyDown}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            📦 {product.name}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Détails
            </TabsTrigger>
            <TabsTrigger value="keywords" className="flex items-center gap-2">
              <Tags className="h-4 w-4" />
              Mots-clés
            </TabsTrigger>
            <TabsTrigger value="research" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Recherche produit
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="mt-6">
            <ProductDetailsTab product={product} />
          </TabsContent>

          <TabsContent value="keywords" className="mt-6">
            <ProductKeywordsTab product={product} />
          </TabsContent>

          <TabsContent value="research" className="mt-6">
            <ProductResearchTab product={product} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
