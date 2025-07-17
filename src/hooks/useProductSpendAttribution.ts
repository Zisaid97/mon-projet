
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { ProductSpendAttribution, ProductSpendAttributionInput } from "@/types/product-spend-attribution";

export function useProductSpendAttributions() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["product-spend-attributions", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("product_spend_attribution")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data as ProductSpendAttribution[]) || [];
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}

export function useAddProductSpendAttribution() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: ProductSpendAttributionInput) => {
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("product_spend_attribution")
        .insert({
          user_id: user.id,
          ...input,
        })
        .select()
        .single();

      if (error) throw error;
      return data as ProductSpendAttribution;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-spend-attributions"] });
    },
  });
}

export function useUpdateProductSpendAttribution() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ProductSpendAttribution> & { id: string }) => {
      const { data, error } = await supabase
        .from("product_spend_attribution")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as ProductSpendAttribution;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-spend-attributions"] });
    },
  });
}

export function useDeleteProductSpendAttribution() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("product_spend_attribution")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-spend-attributions"] });
    },
  });
}

export function useProductSpendAttributionSummary() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["product-spend-attribution-summary", user?.id],
    queryFn: async () => {
      if (!user) return { totalSpent: 0, productsCount: 0 };

      const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM

      const { data, error } = await supabase
        .from("product_spend_attribution")
        .select("amount_spent_mad, product_name")
        .eq("user_id", user.id)
        .gte("start_date", `${currentMonth}-01`)
        .lte("end_date", `${currentMonth}-31`);

      if (error) throw error;

      const rawData = (data as any[]) || [];
      const totalSpent = rawData.reduce((sum: number, item: any) => sum + (item.amount_spent_mad || 0), 0);
      const uniqueProducts = new Set(rawData.map((item: any) => item.product_name));

      return {
        totalSpent,
        productsCount: uniqueProducts.size,
      };
    },
    enabled: !!user,
  });
}
