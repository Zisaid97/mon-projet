
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { Product, ProductInput } from "@/types/product";

const fetchProducts = async (userId: string) => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('user_id', userId)
    .order('name', { ascending: true });

  if (error) throw new Error(error.message);
  
  // Transformer les données pour inclure external_links et facebook_keywords
  const transformedData = (data as any[])?.map(product => ({
    ...product,
    external_links: product.external_links || [],
    facebook_keywords: product.facebook_keywords || []
  })) || [];
  
  return transformedData as Product[];
};

export function useProducts() {
  const { user } = useAuth();
  return useQuery<Product[]>({
    queryKey: ['products', user?.id],
    queryFn: () => fetchProducts(user!.id),
    enabled: !!user,
  });
}

const fetchProduct = async (productId: string, userId: string) => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', productId)
    .eq('user_id', userId)
    .single();

  if (error) throw new Error(error.message);
  
  // Transformer les données pour inclure external_links et facebook_keywords
  const transformedData = {
    ...data,
    external_links: data.external_links || [],
    facebook_keywords: data.facebook_keywords || []
  };
  
  return transformedData as Product;
};

export function useProduct(productId: string) {
  const { user } = useAuth();
  return useQuery<Product>({
    queryKey: ['product', productId, user?.id],
    queryFn: () => fetchProduct(productId, user!.id),
    enabled: !!user && !!productId,
  });
}

const addProduct = async (product: ProductInput & { user_id: string }) => {
  const productData = {
    ...product,
    external_links: product.external_links || [],
    facebook_keywords: product.facebook_keywords || []
  };
  const { data, error } = await supabase.from('products').insert(productData).select().single();
  if (error) throw new Error(error.message);
  return data;
};

export function useAddProduct() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: (product: ProductInput) => addProduct({ ...product, user_id: user!.id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products', user?.id] });
    },
  });
}

const updateProduct = async ({ id, ...productData }: Partial<ProductInput> & { id: string }) => {
  // D'abord récupérer les données actuelles du produit
  const { data: currentProduct, error: fetchError } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();
  
  if (fetchError) throw new Error(fetchError.message);

  // Fusionner les données actuelles avec les nouvelles données
  const updateData = {
    ...currentProduct,
    ...productData,
    external_links: productData.external_links !== undefined ? productData.external_links : (currentProduct.external_links || []),
    facebook_keywords: productData.facebook_keywords !== undefined ? productData.facebook_keywords : (currentProduct.facebook_keywords || [])
  };

  const { data, error } = await supabase
    .from('products')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
};

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: updateProduct,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['products', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['product', data.id, user?.id] });
    },
  });
}

const deleteProduct = async (id: string) => {
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) throw new Error(error.message);
};

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products', user?.id] });
    },
  });
}
