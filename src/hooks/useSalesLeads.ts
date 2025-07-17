
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';

export interface SalesLead {
  id: string;
  user_id: string;
  name: string;
  email?: string;
  phone?: string;
  status: string;
  source?: string;
  created_at: string;
  updated_at: string;
}

// Fetch sales leads
const fetchSalesLeads = async (userId: string) => {
  const { data, error } = await supabase
    .from('sales_leads' as any)
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }
  // The type issue seems to be with the auto-generated types, we cast to any and then to SalesLead[]
  return data as any as SalesLead[];
};

// Add a new sales lead
const addSalesLead = async (lead: Omit<SalesLead, 'id' | 'created_at' | 'updated_at' | 'status'> & { status?: string }) => {
    const { data, error } = await supabase
        .from('sales_leads' as any)
        .insert([lead])
        .select()
        .single();
    
    if (error) {
        // Handle unique constraint violation gracefully
        if (error.code === '23505') { // unique_violation on user_id, email
            console.warn(`Lead with email ${lead.email} already exists.`);
            // Silently ignore duplicates on import
            return null;
        }
        throw new Error(error.message);
    }
    return data;
};

export function useSalesLeads() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: leads, isLoading, error } = useQuery({
    queryKey: ['salesLeads', user?.id],
    queryFn: () => fetchSalesLeads(user!.id),
    enabled: !!user,
  });

  const { mutateAsync: createLead } = useMutation({
    mutationFn: addSalesLead,
    onSuccess: (newLead) => {
      if(newLead) {
        queryClient.invalidateQueries({ queryKey: ['salesLeads', user?.id] });
      }
    },
    onError: (error) => {
        toast({
            title: "Erreur lors de l'ajout du lead",
            description: error.message,
            variant: "destructive",
        });
    },
  });

  return { leads, isLoading, error, createLead };
}
