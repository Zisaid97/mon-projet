import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useKeywordRestore, ArchivedKeyword } from '@/hooks/useKeywordRestore';
import { useProducts } from '@/hooks/useProducts';
import { History, RotateCcw, Package, Calendar, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface KeywordRestoreModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId?: string;
}

export const KeywordRestoreModal = ({ open, onOpenChange, productId }: KeywordRestoreModalProps) => {
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [filterByProduct, setFilterByProduct] = useState<string>('all');
  const { 
    archivedKeywords, 
    loading, 
    loadRecentArchivedKeywords, 
    loadArchivedKeywords,
    restoreKeyword,
    restoreAllKeywordsForProduct 
  } = useKeywordRestore();
  const { data: products } = useProducts();

  useEffect(() => {
    if (open) {
      if (productId) {
        loadArchivedKeywords(productId);
      } else {
        loadRecentArchivedKeywords();
      }
    }
  }, [open, productId]);

  const filteredKeywords = archivedKeywords.filter(keyword => {
    if (filterByProduct === 'all') return true;
    return keyword.product_id === filterByProduct;
  });

  const getReasonBadge = (reason: string) => {
    switch (reason) {
      case 'product_deletion':
        return <Badge variant="destructive">Produit supprimé</Badge>;
      case 'manual_deletion':
        return <Badge variant="secondary">Suppression manuelle</Badge>;
      default:
        return <Badge variant="outline">{reason}</Badge>;
    }
  };

  const handleRestore = async (keyword: ArchivedKeyword) => {
    const targetId = selectedProductId || keyword.product_id;
    if (!targetId) return;

    const success = await restoreKeyword(keyword.id, targetId);
    if (success && productId) {
      // Recharger les archives si on est dans le contexte d'un produit spécifique
      loadArchivedKeywords(productId);
    }
  };

  const handleRestoreAll = async () => {
    if (!selectedProductId || !productId) return;
    
    const success = await restoreAllKeywordsForProduct(productId, selectedProductId);
    if (success) {
      loadArchivedKeywords(productId);
    }
  };

  // Grouper par produit pour un affichage plus clair
  const keywordsByProduct = filteredKeywords.reduce((acc, keyword) => {
    const productName = keyword.product_name;
    if (!acc[productName]) {
      acc[productName] = [];
    }
    acc[productName].push(keyword);
    return acc;
  }, {} as Record<string, ArchivedKeyword[]>);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Restaurer les mots-clés
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Sélection du produit de destination */}
          {products && products.length > 0 && (
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">
                  Produit de destination :
                </label>
                <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un produit..." />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {!productId && (
                <div className="flex-1">
                  <label className="text-sm font-medium mb-2 block">
                    Filtrer par produit source :
                  </label>
                  <Select value={filterByProduct} onValueChange={setFilterByProduct}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les produits</SelectItem>
                      {Object.keys(keywordsByProduct).map((productName) => (
                        <SelectItem key={productName} value={keywordsByProduct[productName][0].product_id}>
                          {productName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          )}

          {/* Bouton pour restaurer tout */}
          {productId && selectedProductId && (
            <div className="flex justify-end">
              <Button onClick={handleRestoreAll} variant="outline" className="gap-2">
                <RotateCcw className="h-4 w-4" />
                Restaurer tous les mots-clés
              </Button>
            </div>
          )}

          {/* Liste des mots-clés archivés */}
          <ScrollArea className="h-[400px] border rounded-lg p-4">
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                Chargement des archives...
              </div>
            ) : filteredKeywords.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                Aucun mot-clé archivé trouvé
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(keywordsByProduct).map(([productName, keywords]) => (
                  <div key={productName} className="space-y-2">
                    <div className="flex items-center gap-2 pb-2 border-b">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium text-sm">{productName}</span>
                      <Badge variant="outline">{keywords.length}</Badge>
                    </div>
                    
                    {keywords.map((keyword) => (
                      <div
                        key={keyword.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                      >
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{keyword.keyword}</span>
                            {getReasonBadge(keyword.deletion_reason)}
                          </div>
                          
                          {keyword.note && (
                            <p className="text-sm text-muted-foreground">
                              Note: {keyword.note}
                            </p>
                          )}
                          
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            Supprimé le {format(new Date(keyword.deleted_at), 'dd MMM yyyy à HH:mm', { locale: fr })}
                          </div>
                        </div>

                        <Button
                          size="sm"
                          onClick={() => handleRestore(keyword)}
                          disabled={!selectedProductId}
                          className="gap-2"
                        >
                          <RotateCcw className="h-3 w-3" />
                          Restaurer
                        </Button>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};