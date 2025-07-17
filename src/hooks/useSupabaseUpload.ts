
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export const useSupabaseUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { user } = useAuth();
  const { toast } = useToast();

  const uploadProductImage = async (file: File, productId: string) => {
    if (!user?.id) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour uploader une image",
        variant: "destructive",
      });
      return null;
    }

    // Validation du fichier
    const maxSize = 1024 * 1024; // 1MB
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

    if (file.size > maxSize) {
      toast({
        title: "Fichier trop volumineux",
        description: "L'image doit faire moins de 1 Mo",
        variant: "destructive",
      });
      return null;
    }

    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Format non supporté",
        description: "Formats acceptés : PNG, JPG, JPEG, WebP",
        variant: "destructive",
      });
      return null;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // Nom du fichier avec le dossier utilisateur
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${productId}.${fileExt}`;

      // Supprimer l'ancienne image si elle existe
      try {
        await supabase.storage.from('product-images').remove([fileName]);
      } catch (error) {
        // Ignore si le fichier n'existe pas
      }

      // Upload du nouveau fichier
      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) {
        throw error;
      }

      // Obtenir l'URL publique
      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName);

      setUploadProgress(100);
      
      toast({
        title: "✅ Image uploadée",
        description: "L'image du produit a été mise à jour",
      });

      return publicUrl;
    } catch (error) {
      console.error('Erreur upload:', error);
      toast({
        title: "Erreur d'upload",
        description: "Impossible d'uploader l'image",
        variant: "destructive",
      });
      return null;
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return {
    uploadProductImage,
    uploading,
    uploadProgress
  };
};
