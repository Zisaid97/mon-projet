
import { Product } from "@/types/product";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Package } from "lucide-react";

interface ProductCardProps {
  product: Product;
  onClick: () => void;
}

export const ProductCard = ({ product, onClick }: ProductCardProps) => {
  const handleLinkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.product_link) {
      window.open(product.product_link, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <Card 
      className="group cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
      onClick={onClick}
    >
      <CardContent className="p-0">
        {/* Image ou placeholder */}
        <div className="aspect-square bg-gray-100 rounded-t-lg overflow-hidden relative">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <Package className="h-12 w-12" />
            </div>
          )}
          
          {/* Badge CPD en overlay */}
          <div className="absolute top-2 left-2">
            <Badge variant="secondary" className="bg-black/70 text-white">
              CPD {product.cpd_category}
            </Badge>
          </div>

          {/* Bouton lien externe */}
          {product.product_link && (
            <div className="absolute top-2 right-2">
              <Button
                size="sm"
                variant="secondary"
                className="h-8 w-8 p-0 bg-black/70 hover:bg-black/90 text-white border-none"
                onClick={handleLinkClick}
                title="Voir le lien externe"
              >
                <ExternalLink className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>

        {/* Nom du produit */}
        <div className="p-3">
          <h3 className="font-medium text-gray-900 truncate" title={product.name}>
            {product.name}
          </h3>
          <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
            <span>Cliquer pour éditer</span>
            {product.product_link && (
              <ExternalLink className="h-3 w-3" />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
