
import { useState } from "react";
import { Product } from "@/types/product";
import { useUpdateProduct } from "@/hooks/useProducts";
import { useSupabaseUpload } from "@/hooks/useSupabaseUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Upload, Save, Package, Trash2, Camera, ImageIcon } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { ExternalLinksManager } from "./ExternalLinksManager";

interface ProductDetailsTabProps {
  product: Product;
}

export const ProductDetailsTab = ({ product }: ProductDetailsTabProps) => {
  const [formData, setFormData] = useState({
    name: product.name,
    cpd_category: product.cpd_category,
    product_link: product.product_link || "",
    external_links: product.external_links || [],
  });
  const [hasChanges, setHasChanges] = useState(false);

  const updateProductMutation = useUpdateProduct();
  const { uploadProductImage, uploading, uploadProgress } = useSupabaseUpload();
  const { toast } = useToast();

  // Dropzone pour l'upload d'image
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp']
    },
    maxSize: 1024 * 1024, // 1MB
    multiple: false,
    onDrop: async (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        const imageUrl = await uploadProductImage(file, product.id);
        
        if (imageUrl) {
          // Mettre à jour le produit avec la nouvelle image
          try {
            await updateProductMutation.mutateAsync({
              id: product.id,
              image_url: imageUrl
            });
            
            toast({
              title: "✅ Image mise à jour",
              description: "L'image du produit a été modifiée",
            });
          } catch (error) {
            console.error('Erreur mise à jour image:', error);
          }
        }
      }
    },
    onDropRejected: (fileRejections) => {
      const rejection = fileRejections[0];
      let message = "Fichier rejeté";
      
      if (rejection.errors[0]?.code === 'file-too-large') {
        message = "L'image doit faire moins de 1 Mo";
      } else if (rejection.errors[0]?.code === 'file-invalid-type') {
        message = "Format non supporté. Utilisez PNG, JPG ou WebP";
      }
      
      toast({
        title: "Erreur",
        description: message,
        variant: "destructive",
      });
    }
  });

  const handleRemoveImage = async () => {
    try {
      await updateProductMutation.mutateAsync({
        id: product.id,
        image_url: null
      });
      
      toast({
        title: "✅ Image supprimée",
        description: "L'image du produit a été supprimée",
      });
    } catch (error) {
      console.error('Erreur suppression image:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'image",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (field: string, value: string | number | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      // Validation URL principale si fournie
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

      await updateProductMutation.mutateAsync({
        id: product.id,
        name: formData.name.trim(),
        cpd_category: formData.cpd_category,
        product_link: formData.product_link?.trim() || null,
        external_links: formData.external_links,
      });

      setHasChanges(false);
      
      toast({
        title: "✅ Produit mis à jour",
        description: "Les modifications ont été sauvegardées",
      });
    } catch (error) {
      console.error('Erreur mise à jour produit:', error);
      toast({
        title: "Erreur de sauvegarde",
        description: "Impossible de sauvegarder les modifications",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload d'image */}
      <div className="space-y-3">
        <Label>Image du produit</Label>
        
        {/* Aperçu de l'image actuelle avec actions */}
        <div className="flex gap-4">
          {/* Aperçu avec overlay d'actions */}
          <div className="relative w-32 h-32 bg-gray-100 rounded-lg overflow-hidden border-2 border-dashed border-gray-300 group">
            {product.image_url ? (
              <>
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                {/* Overlay avec actions au hover */}
                <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => document.getElementById('file-input')?.click()}
                    className="h-8 w-8 p-0"
                    disabled={uploading}
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={handleRemoveImage}
                    className="h-8 w-8 p-0"
                    disabled={uploading || updateProductMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </>
            ) : (
              <div 
                {...getRootProps()}
                className="w-full h-full flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:text-gray-600 transition-colors"
              >
                <input {...getInputProps()} />
                <ImageIcon className="h-6 w-6 mb-1" />
                <p className="text-xs text-center">Ajouter une image</p>
              </div>
            )}
          </div>

          {/* Zone de drop principale */}
          <div className="flex-1 space-y-3">
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all ${
                isDragActive 
                  ? 'border-primary bg-primary/5 scale-105' 
                  : 'border-gray-300 hover:border-primary/50 hover:bg-gray-50'
              } ${uploading ? 'pointer-events-none opacity-50' : ''}`}
            >
              <input {...getInputProps()} id="file-input" />
              <div className="flex flex-col items-center space-y-2">
                <div className={`p-3 rounded-full ${isDragActive ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'}`}>
                  <Upload className="h-6 w-6" />
                </div>
                {uploading ? (
                  <div className="space-y-2 w-full">
                    <p className="text-sm text-gray-600">Upload en cours...</p>
                    <Progress value={uploadProgress} className="w-full h-2" />
                    <p className="text-xs text-gray-500">{uploadProgress}%</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-700">
                      {isDragActive 
                        ? "Déposez l'image ici" 
                        : "Cliquez ou glissez une image"
                      }
                    </p>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, WebP - Max 1 Mo
                    </p>
                    {product.image_url && (
                      <p className="text-xs text-blue-600 font-medium">
                        Ou glissez pour remplacer l'image actuelle
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Actions rapides */}
            {product.image_url && (
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById('file-input')?.click()}
                  disabled={uploading}
                  className="flex items-center gap-2"
                >
                  <Camera className="h-4 w-4" />
                  Changer l'image
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRemoveImage}
                  disabled={uploading || updateProductMutation.isPending}
                  className="flex items-center gap-2 text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                  Supprimer
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Nom du produit */}
      <div className="space-y-2">
        <Label htmlFor="product-name">
          Nom du produit <span className="text-red-500">*</span>
        </Label>
        <Input
          id="product-name"
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          placeholder="Nom du produit"
          disabled={updateProductMutation.isPending}
        />
      </div>

      {/* Catégorie CPD */}
      <div className="space-y-2">
        <Label htmlFor="cpd-category">Catégorie CPD (commission en DH)</Label>
        <Input
          id="cpd-category"
          type="number"
          min="1"
          max="1000"
          value={formData.cpd_category}
          onChange={(e) => handleInputChange('cpd_category', parseInt(e.target.value) || 15)}
          disabled={updateProductMutation.isPending}
        />
        <p className="text-xs text-gray-500">
          Commission par livraison réussie
        </p>
      </div>

      {/* Lien principal */}
      <div className="space-y-2">
        <Label htmlFor="product-link">Lien principal</Label>
        <Input
          id="product-link"
          type="url"
          value={formData.product_link}
          onChange={(e) => handleInputChange('product_link', e.target.value)}
          placeholder="https://example.com/produit"
          disabled={updateProductMutation.isPending}
        />
        <p className="text-xs text-gray-500">
          Lien principal vers la page du produit
        </p>
      </div>

      {/* Gestionnaire de liens externes */}
      <ExternalLinksManager
        links={formData.external_links}
        onLinksChange={(links) => handleInputChange('external_links', links)}
        disabled={updateProductMutation.isPending}
      />

      {/* Actions */}
      {hasChanges && (
        <div className="flex justify-end pt-4 border-t">
          <Button
            onClick={handleSave}
            disabled={updateProductMutation.isPending || !formData.name.trim()}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {updateProductMutation.isPending ? "Sauvegarde..." : "Sauvegarder"}
          </Button>
        </div>
      )}
    </div>
  );
};
