
import React, { useState, useMemo } from "react";
import { Header } from "@/components/layout/Header";
import { useProducts, useUpdateProduct } from "@/hooks/useProducts";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, ExternalLink, Copy, Globe, Package, Edit, Trash2, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
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

export default function DomainNames() {
  const [searchTerm, setSearchTerm] = useState("");
  const [editingKeyword, setEditingKeyword] = useState<{productId: string, index: number} | null>(null);
  const [editingValue, setEditingValue] = useState("");
  const [checkedKeywords, setCheckedKeywords] = useState<Set<string>>(new Set());
  const [keywordToDelete, setKeywordToDelete] = useState<{productId: string, index: number, keyword: string} | null>(null);
  const { data: products = [], isLoading } = useProducts();
  const updateProductMutation = useUpdateProduct();
  const { toast } = useToast();

  // Filtrer et trier les produits selon la recherche et le nombre de mots-clés
  const filteredAndSortedProducts = useMemo(() => {
    const filtered = products.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    // Trier par nombre total de mots-clés + liens (décroissant)
    return filtered.sort((a, b) => {
      const totalA = (a.facebook_keywords?.length || 0) + (a.external_links?.length || 0);
      const totalB = (b.facebook_keywords?.length || 0) + (b.external_links?.length || 0);
      return totalB - totalA;
    });
  }, [products, searchTerm]);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "✅ Copié",
        description: "Le contenu a été copié dans le presse-papiers",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de copier le contenu",
        variant: "destructive",
      });
    }
  };

  const openLink = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const openFacebookAdLibrary = (keyword: string) => {
    const url = `https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&q=${encodeURIComponent(keyword)}&search_type=keyword_unordered`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const toggleKeywordCheck = (keyword: string) => {
    const newChecked = new Set(checkedKeywords);
    if (newChecked.has(keyword)) {
      newChecked.delete(keyword);
    } else {
      newChecked.add(keyword);
    }
    setCheckedKeywords(newChecked);
  };

  // Fonctions pour gérer l'édition et la suppression des mots-clés
  const startEditKeyword = (productId: string, index: number, currentKeyword: string) => {
    setEditingKeyword({ productId, index });
    setEditingValue(currentKeyword);
  };

  const cancelEditKeyword = () => {
    setEditingKeyword(null);
    setEditingValue("");
  };

  const saveEditKeyword = async (productId: string) => {
    if (!editingKeyword || !editingValue.trim()) return;

    const product = products.find(p => p.id === productId);
    if (!product || !product.facebook_keywords) return;

    try {
      const updatedKeywords = [...product.facebook_keywords];
      updatedKeywords[editingKeyword.index] = editingValue.trim();

      await updateProductMutation.mutateAsync({
        id: productId,
        facebook_keywords: updatedKeywords,
      });

      setEditingKeyword(null);
      setEditingValue("");

      toast({
        title: "✅ Mot-clé modifié",
        description: "Le mot-clé a été modifié avec succès",
      });
    } catch (error) {
      console.error('Erreur modification mot-clé:', error);
      toast({
        title: "Erreur",
        description: "Impossible de modifier le mot-clé",
        variant: "destructive",
      });
    }
  };

  const confirmDeleteKeyword = (productId: string, index: number, keyword: string) => {
    setKeywordToDelete({ productId, index, keyword });
  };

  const executeDeleteKeyword = async () => {
    if (!keywordToDelete) return;

    const { productId, index } = keywordToDelete;
    const product = products.find(p => p.id === productId);
    if (!product || !product.facebook_keywords) return;

    try {
      const updatedKeywords = product.facebook_keywords.filter((_, i) => i !== index);

      await updateProductMutation.mutateAsync({
        id: productId,
        facebook_keywords: updatedKeywords,
      });

      setKeywordToDelete(null);
      toast({
        title: "✅ Mot-clé supprimé",
        description: "Le mot-clé a été supprimé avec succès",
      });
    } catch (error) {
      console.error('Erreur suppression mot-clé:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le mot-clé",
        variant: "destructive",
      });
    }
  };

  const restoreKeyword = async (productId: string, keyword: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    try {
      const updatedKeywords = [...(product.facebook_keywords || []), keyword];

      await updateProductMutation.mutateAsync({
        id: productId,
        facebook_keywords: updatedKeywords,
      });

      toast({
        title: "✅ Mot-clé restauré",
        description: "Le mot-clé a été restauré avec succès",
      });
    } catch (error) {
      console.error('Erreur restauration mot-clé:', error);
      toast({
        title: "Erreur",
        description: "Impossible de restaurer le mot-clé",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="max-w-7xl mx-auto px-6 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-64 mb-6"></div>
            <div className="grid gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-muted rounded-lg"></div>
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
              <Globe className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                🌐 Noms de Domaine
              </h1>
              <p className="text-muted-foreground mt-1">
                Gestion centralisée des liens et mots-clés par produit
              </p>
            </div>
          </div>

          {/* Barre de recherche */}
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
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Produits Total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {products.length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Liens Externes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {products.reduce((acc, p) => acc + (p.external_links?.length || 0), 0)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Mots-clés Facebook
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {products.reduce((acc, p) => acc + (p.facebook_keywords?.length || 0), 0)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Résultats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {filteredAndSortedProducts.length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Liste des produits avec accordéons */}
        <div className="space-y-4">
          {filteredAndSortedProducts.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                Aucun produit trouvé
              </h3>
              <p className="text-muted-foreground">
                {searchTerm ? `Aucun produit trouvé pour "${searchTerm}"` : "Aucun produit disponible"}
              </p>
            </div>
          ) : (
            <Accordion type="multiple" className="space-y-4">
              {filteredAndSortedProducts.map((product) => {
                const totalCount = (product.facebook_keywords?.length || 0) + (product.external_links?.length || 0);
                const keywordsCount = product.facebook_keywords?.length || 0;
                const linksCount = product.external_links?.length || 0;
                
                return (
                  <AccordionItem 
                    key={product.id} 
                    value={product.id} 
                    className="border border-border rounded-lg overflow-hidden bg-card"
                  >
                    <AccordionTrigger className="px-6 py-4 hover:bg-muted/50 [&[data-state=open]]:bg-muted/50">
                      <div className="flex items-center justify-between w-full mr-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <Package className="h-5 w-5 text-primary" />
                          </div>
                          <div className="text-left">
                            <h3 className="text-lg font-semibold text-foreground">{product.name}</h3>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                              <span>CPD: {product.cpd_category}</span>
                              <span className="flex items-center gap-1">
                                <ExternalLink className="h-3 w-3" />
                                {linksCount} liens
                              </span>
                              <span className="flex items-center gap-1">
                                <Search className="h-3 w-3" />
                                {keywordsCount} mots-clés
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <Badge 
                            variant={totalCount > 0 ? "default" : "secondary"} 
                            className="font-medium"
                          >
                            {totalCount} total
                          </Badge>
                          {product.product_link && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                openLink(product.product_link!);
                              }}
                              className="flex items-center gap-2"
                            >
                              <ExternalLink className="h-3 w-3" />
                              Ouvrir
                            </Button>
                          )}
                        </div>
                      </div>
                    </AccordionTrigger>
                    
                    <AccordionContent className="px-6 pb-6">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
                        {/* Liens Externes */}
                        <div>
                          <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
                            <ExternalLink className="h-4 w-4" />
                            Liens Externes ({linksCount})
                          </h4>
                          
                          {product.external_links && product.external_links.length > 0 ? (
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                              {product.external_links.map((link, index) => (
                                <div
                                  key={`${product.id}-link-${index}`}
                                  className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                                >
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-foreground truncate">
                                      {(() => {
                                        try {
                                          return new URL(link).hostname;
                                        } catch {
                                          return link;
                                        }
                                      })()}
                                    </p>
                                    <p className="text-xs text-muted-foreground truncate">
                                      {link}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => copyToClipboard(link)}
                                      className="h-8 w-8 p-0"
                                      title="Copier"
                                    >
                                      <Copy className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => openLink(link)}
                                      className="h-8 w-8 p-0"
                                      title="Ouvrir"
                                    >
                                      <ExternalLink className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-6 text-muted-foreground">
                              <Globe className="h-8 w-8 mx-auto mb-2 opacity-50" />
                              <p className="text-sm">Aucun lien externe</p>
                            </div>
                          )}
                        </div>

                        {/* Mots-clés Facebook */}
                        <div>
                          <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
                            <Search className="h-4 w-4" />
                            Mots-clés Facebook ({keywordsCount})
                          </h4>
                          
                          {product.facebook_keywords && product.facebook_keywords.length > 0 ? (
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                              {product.facebook_keywords.map((keyword, index) => (
                                <div
                                  key={`${product.id}-keyword-${index}`}
                                   className="flex items-center gap-2 p-3 bg-primary/5 rounded-lg hover:bg-primary/10 transition-colors"
                                 >
                                   <Checkbox
                                     id={`keyword-${product.id}-${index}`}
                                     checked={checkedKeywords.has(keyword)}
                                     onCheckedChange={() => toggleKeywordCheck(keyword)}
                                   />
                                   {editingKeyword?.productId === product.id && editingKeyword?.index === index ? (
                                    <>
                                      <Input
                                        value={editingValue}
                                        onChange={(e) => setEditingValue(e.target.value)}
                                        className="flex-1"
                                        autoFocus
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter') {
                                            saveEditKeyword(product.id);
                                          } else if (e.key === 'Escape') {
                                            cancelEditKeyword();
                                          }
                                        }}
                                      />
                                      <Button
                                        size="sm"
                                        onClick={() => saveEditKeyword(product.id)}
                                        disabled={updateProductMutation.isPending}
                                        title="Sauvegarder"
                                      >
                                        <Check className="h-3 w-3" />
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={cancelEditKeyword}
                                        disabled={updateProductMutation.isPending}
                                        title="Annuler"
                                      >
                                        <X className="h-3 w-3" />
                                      </Button>
                                    </>
                                  ) : (
                                    <>
                                      <Badge variant="secondary" className="font-medium flex-1">
                                        {keyword}
                                      </Badge>
                                      <div className="flex items-center gap-1">
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          onClick={() => copyToClipboard(keyword)}
                                          className="h-8 w-8 p-0"
                                          title="Copier"
                                        >
                                          <Copy className="h-3 w-3" />
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          onClick={() => startEditKeyword(product.id, index, keyword)}
                                          className="h-8 w-8 p-0"
                                          title="Modifier"
                                          disabled={updateProductMutation.isPending}
                                        >
                                          <Edit className="h-3 w-3" />
                                        </Button>
                                         <Button
                                           size="sm"
                                           variant="ghost"
                                           onClick={() => confirmDeleteKeyword(product.id, index, keyword)}
                                           className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                                           title="Supprimer"
                                           disabled={updateProductMutation.isPending}
                                         >
                                           <Trash2 className="h-3 w-3" />
                                         </Button>
                                        <Button
                                          size="sm"
                                          onClick={() => openFacebookAdLibrary(keyword)}
                                          className="h-8 px-3"
                                          title="Rechercher dans Ad Library"
                                        >
                                          <Search className="h-3 w-3 mr-1" />
                                          Ad Library
                                        </Button>
                                      </div>
                                    </>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-6 text-muted-foreground">
                              <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                              <p className="text-sm">Aucun mot-clé Facebook</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          )}
        </div>

        {/* Dialog de confirmation de suppression */}
        <AlertDialog open={!!keywordToDelete} onOpenChange={() => setKeywordToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
              <AlertDialogDescription>
                Êtes-vous sûr de vouloir supprimer le mot-clé <strong>"{keywordToDelete?.keyword}"</strong> ?
                Cette action ne peut pas être annulée.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction
                onClick={executeDeleteKeyword}
                className="bg-red-600 hover:bg-red-700"
              >
                Supprimer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Dialog de restauration */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="fixed bottom-4 right-4 bg-green-600 hover:bg-green-700 text-white border-green-600"
            >
              Restaurer un mot-clé
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Restaurer un mot-clé</AlertDialogTitle>
              <AlertDialogDescription>
                Entrez le nom du produit et le mot-clé à restaurer.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="space-y-4 py-4">
              <Input
                placeholder="Sélectionner un produit..."
                list="products"
              />
              <datalist id="products">
                {products.map((product) => (
                  <option key={product.id} value={product.name} />
                ))}
              </datalist>
              <Input
                placeholder="Mot-clé à restaurer..."
              />
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction className="bg-green-600 hover:bg-green-700">
                Restaurer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </div>
  );
}
