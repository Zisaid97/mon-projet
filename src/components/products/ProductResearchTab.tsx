import { useState } from "react";
import { Product } from "@/types/product";
import { useUpdateProduct, useProduct } from "@/hooks/useProducts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, ExternalLink, Edit, Check, X, Search } from "lucide-react";

interface ProductResearchTabProps {
  product: Product;
}

export const ProductResearchTab = ({ product: initialProduct }: ProductResearchTabProps) => {
  // Utiliser useProduct pour obtenir les données à jour du produit
  const { data: product, isLoading } = useProduct(initialProduct.id);
  
  // Utiliser les données initiales si les données à jour ne sont pas encore chargées
  const currentProduct = product || initialProduct;
  const [newLink, setNewLink] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState("");
  const [newKeyword, setNewKeyword] = useState("");
  const [editingKeywordIndex, setEditingKeywordIndex] = useState<number | null>(null);
  const [editingKeywordValue, setEditingKeywordValue] = useState("");
  
  const updateProductMutation = useUpdateProduct();
  const { toast } = useToast();

  const externalLinks = currentProduct.external_links || [];
  const facebookKeywords = currentProduct.facebook_keywords || [];

  const addLink = async () => {
    if (!newLink.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez saisir un lien",
        variant: "destructive",
      });
      return;
    }

    // Validation simple de l'URL
    if (!newLink.startsWith('http://') && !newLink.startsWith('https://')) {
      toast({
        title: "URL invalide",
        description: "L'URL doit commencer par http:// ou https://",
        variant: "destructive",
      });
      return;
    }

    try {
      const updatedLinks = [...externalLinks, newLink.trim()];
      
      await updateProductMutation.mutateAsync({
        id: currentProduct.id,
        external_links: updatedLinks,
      });

      setNewLink("");
      
      toast({
        title: "✅ Lien ajouté",
        description: "Le lien concurrent a été ajouté avec succès",
      });
    } catch (error) {
      console.error('Erreur ajout lien:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter le lien",
        variant: "destructive",
      });
    }
  };

  const removeLink = async (index: number) => {
    try {
      const updatedLinks = externalLinks.filter((_, i) => i !== index);
      
      await updateProductMutation.mutateAsync({
        id: currentProduct.id,
        external_links: updatedLinks,
      });
      
      toast({
        title: "✅ Lien supprimé",
        description: "Le lien concurrent a été supprimé",
      });
    } catch (error) {
      console.error('Erreur suppression lien:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le lien",
        variant: "destructive",
      });
    }
  };

  const startEdit = (index: number) => {
    setEditingIndex(index);
    setEditingValue(externalLinks[index]);
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setEditingValue("");
  };

  const saveEdit = async () => {
    if (!editingValue.trim() || editingIndex === null) return;

    // Validation simple de l'URL
    if (!editingValue.startsWith('http://') && !editingValue.startsWith('https://')) {
      toast({
        title: "URL invalide",
        description: "L'URL doit commencer par http:// ou https://",
        variant: "destructive",
      });
      return;
    }

    try {
      const updatedLinks = [...externalLinks];
      updatedLinks[editingIndex] = editingValue.trim();
      
      await updateProductMutation.mutateAsync({
        id: currentProduct.id,
        external_links: updatedLinks,
      });

      setEditingIndex(null);
      setEditingValue("");
      
      toast({
        title: "✅ Lien modifié",
        description: "Le lien concurrent a été modifié avec succès",
      });
    } catch (error) {
      console.error('Erreur modification lien:', error);
      toast({
        title: "Erreur",
        description: "Impossible de modifier le lien",
        variant: "destructive",
      });
    }
  };

  const openLink = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Fonctions pour les mots-clés Facebook Ad Library
  const addKeyword = async () => {
    if (!newKeyword.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez saisir un mot-clé",
        variant: "destructive",
      });
      return;
    }

    // Vérifier si le mot-clé existe déjà (insensible à la casse)
    const keywordLower = newKeyword.trim().toLowerCase();
    const existingKeyword = facebookKeywords.find(k => k.toLowerCase() === keywordLower);
    
    if (existingKeyword) {
      toast({
        title: "Mot-clé déjà existant",
        description: `"${newKeyword.trim()}" existe déjà dans la liste`,
        variant: "destructive",
      });
      return;
    }

    try {
      const updatedKeywords = [...facebookKeywords, newKeyword.trim()];
      
      await updateProductMutation.mutateAsync({
        id: currentProduct.id,
        facebook_keywords: updatedKeywords,
      });

      setNewKeyword("");
      
      toast({
        title: "✅ Mot-clé ajouté",
        description: "Le mot-clé Facebook Ad Library a été ajouté avec succès",
      });
    } catch (error) {
      console.error('Erreur ajout mot-clé:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter le mot-clé",
        variant: "destructive",
      });
    }
  };

  const removeKeyword = async (index: number) => {
    try {
      const updatedKeywords = facebookKeywords.filter((_, i) => i !== index);
      
      await updateProductMutation.mutateAsync({
        id: currentProduct.id,
        facebook_keywords: updatedKeywords,
      });
      
      toast({
        title: "✅ Mot-clé supprimé",
        description: "Le mot-clé a été supprimé",
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

  const startEditKeyword = (index: number) => {
    setEditingKeywordIndex(index);
    setEditingKeywordValue(facebookKeywords[index]);
  };

  const cancelEditKeyword = () => {
    setEditingKeywordIndex(null);
    setEditingKeywordValue("");
  };

  const saveEditKeyword = async () => {
    if (!editingKeywordValue.trim() || editingKeywordIndex === null) return;

    try {
      const updatedKeywords = [...facebookKeywords];
      updatedKeywords[editingKeywordIndex] = editingKeywordValue.trim();
      
      await updateProductMutation.mutateAsync({
        id: currentProduct.id,
        facebook_keywords: updatedKeywords,
      });

      setEditingKeywordIndex(null);
      setEditingKeywordValue("");
      
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

  const openFacebookAdLibrary = (keyword: string) => {
    const url = `https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&q=${encodeURIComponent(keyword)}&search_type=keyword_unordered`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-6">
      {/* Ajouter un nouveau lien */}
      <div className="space-y-3">
        <Label htmlFor="new-link">Ajouter un lien concurrent</Label>
        <div className="flex gap-2">
          <Input
            id="new-link"
            placeholder="https://exemple.com/produit-concurrent"
            value={newLink}
            onChange={(e) => setNewLink(e.target.value)}
            disabled={updateProductMutation.isPending}
          />
          <Button
            onClick={addLink}
            disabled={updateProductMutation.isPending || !newLink.trim()}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Ajouter
          </Button>
        </div>
      </div>

      {/* Liste des liens existants */}
      <div className="space-y-3">
        <Label>Liens concurrents ({externalLinks.length})</Label>
        
        {externalLinks.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <ExternalLink className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Aucun lien concurrent enregistré</p>
            <p className="text-sm">Ajoutez des liens pour analyser la concurrence</p>
          </div>
        ) : (
          <div className="space-y-2">
            {externalLinks.map((link, index) => (
              <div key={index} className="flex items-center gap-2 p-3 border rounded-lg bg-gray-50">
                {editingIndex === index ? (
                  <>
                    <Input
                      value={editingValue}
                      onChange={(e) => setEditingValue(e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      size="sm"
                      onClick={saveEdit}
                      disabled={updateProductMutation.isPending}
                    >
                      <Check className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={cancelEdit}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" title={link}>
                        {link.length > 50 ? `${link.substring(0, 50)}...` : link}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openLink(link)}
                      className="flex items-center gap-1"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Ouvrir
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => startEdit(index)}
                      disabled={updateProductMutation.isPending}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => removeLink(index)}
                      disabled={updateProductMutation.isPending}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Facebook Ad Library Keywords */}
      <div className="border-t pt-4 space-y-3">
        <Label htmlFor="new-keyword">Mots-clés Facebook Ad Library</Label>
        <div className="flex gap-2">
          <Input
            id="new-keyword"
            placeholder="mot-clé pour Facebook Ad Library"
            value={newKeyword}
            onChange={(e) => setNewKeyword(e.target.value)}
            disabled={updateProductMutation.isPending}
          />
          <Button
            onClick={addKeyword}
            disabled={updateProductMutation.isPending || !newKeyword.trim()}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Ajouter
          </Button>
        </div>
        
        {facebookKeywords.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            <Search className="h-6 w-6 mx-auto mb-2 opacity-50" />
            <p>Aucun mot-clé Facebook Ad Library</p>
            <p className="text-sm">Ajoutez des mots-clés pour rechercher dans Facebook Ad Library</p>
          </div>
        ) : (
          <div className="space-y-2">
            {facebookKeywords.map((keyword, index) => (
              <div key={index} className="flex items-center gap-2 p-3 border rounded-lg bg-blue-50">
                {editingKeywordIndex === index ? (
                  <>
                    <Input
                      value={editingKeywordValue}
                      onChange={(e) => setEditingKeywordValue(e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      size="sm"
                      onClick={saveEditKeyword}
                      disabled={updateProductMutation.isPending}
                    >
                      <Check className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={cancelEditKeyword}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" title={keyword}>
                        {keyword}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openFacebookAdLibrary(keyword)}
                      className="flex items-center gap-1 bg-blue-600 text-white hover:bg-blue-700"
                    >
                      <Search className="h-3 w-3" />
                      Facebook Ad Library
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => startEditKeyword(index)}
                      disabled={updateProductMutation.isPending}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => removeKeyword(index)}
                      disabled={updateProductMutation.isPending}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recherches rapides */}
      <div className="border-t pt-4">
        <Label className="mb-3 block">Recherches rapides</Label>
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            onClick={() => openLink(`https://www.google.com/search?q=${encodeURIComponent(currentProduct.name)}`)}
          >
            Google
          </Button>
          <Button
            variant="outline"
            onClick={() => openLink(`https://www.amazon.com/s?k=${encodeURIComponent(currentProduct.name)}`)}
          >
            Amazon
          </Button>
          <Button
            variant="outline"
            onClick={() => openLink(`https://www.jumia.ma/catalog/?q=${encodeURIComponent(currentProduct.name)}`)}
          >
            Jumia
          </Button>
          <Button
            variant="outline"
            onClick={() => openLink(`https://www.aliexpress.com/wholesale?SearchText=${encodeURIComponent(currentProduct.name)}`)}
          >
            AliExpress
          </Button>
        </div>
      </div>
    </div>
  );
};