
import React, { useState } from "react";
import { Header } from "@/components/layout/Header";
import { useProducts } from "@/hooks/useProducts";
import { ProductCard } from "@/components/products/ProductCard";
import { ProductModal } from "@/components/products/ProductModal";
import { ProductFormDrawer } from "@/components/products/ProductFormDrawer";
import { AddNewCard } from "@/components/products/AddNewCard";
import { NotesWidget } from "@/components/notes/NotesWidget";
import { Product } from "@/types/product";
import { Package, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Products() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  const { data: products = [], isLoading } = useProducts();

  // Filtrer les produits selon la recherche
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Gérer le raccourci clavier ⌘ + Shift + P
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key === 'P') {
        event.preventDefault();
        setIsDrawerOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="max-w-7xl mx-auto px-6 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-64 mb-6"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-48 bg-muted rounded-lg"></div>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-card rounded-lg border border-border">
              <Package className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                🛒 Gestion des Produits
              </h1>
              <p className="text-muted-foreground mt-1">
                Gérez vos produits, images, liens et mots-clés
              </p>
            </div>
          </div>

          {/* Barre de recherche et actions */}
          <div className="flex items-center gap-4 mt-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Rechercher un produit..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={() => setIsDrawerOpen(true)}>
              Nouveau produit
              <span className="ml-2 text-xs opacity-70">⌘+Shift+P</span>
            </Button>
          </div>
        </div>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-card p-4 rounded-lg border border-border">
            <div className="text-2xl font-bold text-primary">{products.length}</div>
            <div className="text-sm text-muted-foreground">Produits total</div>
          </div>
          <div className="bg-card p-4 rounded-lg border border-border">
            <div className="text-2xl font-bold text-green-600">
              {products.filter(p => p.image_url).length}
            </div>
            <div className="text-sm text-muted-foreground">Avec image</div>
          </div>
          <div className="bg-card p-4 rounded-lg border border-border">
            <div className="text-2xl font-bold text-purple-600">
              {products.filter(p => p.product_link).length}
            </div>
            <div className="text-sm text-muted-foreground">Avec lien</div>
          </div>
          <div className="bg-card p-4 rounded-lg border border-border">
            <div className="text-2xl font-bold text-orange-600">
              {filteredProducts.length}
            </div>
            <div className="text-sm text-muted-foreground">Résultats</div>
          </div>
        </div>

        {/* Grille des produits */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          <AddNewCard onClick={() => setIsDrawerOpen(true)} />
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onClick={() => setSelectedProduct(product)}
            />
          ))}
        </div>

        {/* Message si aucun produit */}
        {filteredProducts.length === 0 && products.length > 0 && (
          <div className="text-center py-12">
            <div className="text-muted-foreground mb-2">🔍</div>
            <p className="text-muted-foreground">
              Aucun produit trouvé pour "{searchTerm}"
            </p>
          </div>
        )}

        {/* Message si aucun produit du tout */}
        {products.length === 0 && (
          <div className="text-center py-12">
            <div className="text-muted-foreground mb-4">📦</div>
            <h3 className="text-lg font-medium text-foreground mb-2">
              Aucun produit créé
            </h3>
            <p className="text-muted-foreground mb-4">
              Commencez par créer votre premier produit
            </p>
            <Button onClick={() => setIsDrawerOpen(true)}>
              Créer un produit
            </Button>
          </div>
        )}
      </main>

      {/* Modales */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}

      <ProductFormDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />

      {/* Widget de notes - temporairement commenté en attendant la correction du type */}
      {/* <NotesWidget pageType="products" /> */}
    </div>
  );
}
