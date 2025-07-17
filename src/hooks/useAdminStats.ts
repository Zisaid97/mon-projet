
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export function useAdminStats() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['admin-stats', user?.id],
    queryFn: async () => {
      if (!user) {
        console.log('useAdminStats: No user found');
        throw new Error('Utilisateur non connecté');
      }

      console.log('useAdminStats: Fetching admin stats for user:', user.id);

      // Vérifier si l'utilisateur est admin
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();

      if (roleError) {
        console.log('useAdminStats: Error checking role:', roleError);
        throw new Error('Erreur lors de la vérification du rôle');
      }

      if (!roleData) {
        console.log('useAdminStats: User is not admin');
        throw new Error('Accès non autorisé - rôle insuffisant');
      }

      console.log('useAdminStats: User is admin, fetching real stats...');

      // Récupérer toutes les données existantes
      const [subscribersResult, marketingResult, profitResult, financialResult] = await Promise.all([
        supabase.from('subscribers').select('*'),
        supabase.from('marketing_performance').select('*'),
        supabase.from('profit_tracking').select('*'),
        supabase.from('financial_tracking').select('*')
      ]);

      if (subscribersResult.error) {
        console.log('useAdminStats: Error fetching subscribers:', subscribersResult.error);
      }
      
      if (marketingResult.error) {
        console.log('useAdminStats: Error fetching marketing data:', marketingResult.error);
      }

      if (profitResult.error) {
        console.log('useAdminStats: Error fetching profit data:', profitResult.error);
      }

      if (financialResult.error) {
        console.log('useAdminStats: Error fetching financial data:', financialResult.error);
      }

      const subscribers = subscribersResult.data || [];
      const marketingData = marketingResult.data || [];
      const profitData = profitResult.data || [];
      const financialData = financialResult.data || [];

      console.log('useAdminStats: Raw data:', {
        subscribers: subscribers.length,
        marketing: marketingData.length,
        profit: profitData.length,
        financial: financialData.length
      });

      // Calculer les statistiques réelles
      const totalUsers = subscribers.length;
      const activeUsers = subscribers.filter(sub => sub.subscribed).length;
      
      // Calculer les totaux financiers
      const totalRevenue = profitData.reduce((sum, item) => sum + (item.commission_total || 0), 0);
      const totalExpenses = marketingData.reduce((sum, item) => sum + (item.spend_usd || 0), 0);
      const totalDeliveries = profitData.reduce((sum, item) => sum + (item.quantity || 0), 0);
      const totalLeads = marketingData.reduce((sum, item) => sum + (item.leads || 0), 0);

      // Préparer la liste des utilisateurs récents (les 10 derniers)
      const recentUsers = subscribers
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 10)
        .map(sub => ({
          email: sub.email,
          status: sub.subscribed ? 'active' : 'inactive',
          created_at: sub.created_at,
          subscription_tier: sub.subscription_tier || 'Gratuit'
        }));

      const result = {
        totalUsers,
        activeUsers,
        recentUsers,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalExpenses: Math.round(totalExpenses * 100) / 100,
        totalDeliveries,
        totalLeads,
        profitData: profitData.slice(0, 20), // Les 20 derniers profits
        marketingData: marketingData.slice(0, 20) // Les 20 dernières campagnes
      };

      console.log('useAdminStats: Final result:', result);
      return result;
    },
    enabled: !!user,
    retry: 2,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}
