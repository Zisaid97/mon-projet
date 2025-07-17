
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { groupMetaSpendingByAttribution } from '@/utils/countryMap';
import { useMarketingSpendAttribution } from '@/hooks/useMarketingSpendAttribution';

export interface AdSpendingData {
  id?: string;
  user_id?: string;
  date: string;
  account_name: string;
  campaign_name: string;
  reach: number;
  impressions: number;
  frequency: number;
  currency: string;
  cpm: number;
  hold_rate: number;
  lp_rate: number;
  link_clicks: number;
  hook_rate: number;
  cpc: number;
  amount_spent: number;
  leads: number;
  cost_per_lead: number;
  landing_page_views: number;
  cost_per_landing_page_view: number;
  ad_set_delivery: string;
  report_start: string;
  report_end: string;
}

export const useAdSpendingData = () => {
  const [data, setData] = useState<AdSpendingData[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const { processAutoAttribution } = useMarketingSpendAttribution();

  const fetchData = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      // Use the edge function to fetch data to avoid type issues
      const { data: result, error } = await supabase.functions.invoke('get-ad-spending', {
        body: { user_id: user.id }
      });

      if (error) throw error;
      setData(result?.data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      toast({
        title: "Erreur de chargement",
        description: "Impossible de charger les données publicitaires",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const importData = async (rawData: any[]) => {
    if (!user?.id) return;

    try {
      const processedData = rawData.map(row => ({
        user_id: user.id,
        date: row['Début des rapports'] || new Date().toISOString().split('T')[0],
        account_name: row['Nom du compte'] || '',
        campaign_name: row['Nom de la campagne'] || '',
        reach: parseFloat(row['Couverture']) || 0,
        impressions: parseFloat(row['Impressions']) || 0,
        frequency: parseFloat(row['Répétition']) || 0,
        currency: row['Devise'] || 'USD',
        cpm: parseFloat(row['CPM (Coût pour 1 000 impressions)']) || 0,
        hold_rate: parseFloat(row['Hold Rate (réel)']) || 0,
        lp_rate: parseFloat(row['LP-Rate']) || 0,
        link_clicks: parseFloat(row['Clics sur un lien']) || 0,
        hook_rate: parseFloat(row['Hock rate']) || 0,
        cpc: parseFloat(row['CPC (coût par clic sur un lien)']) || 0,
        amount_spent: parseFloat(row['Montant dépensé (USD)']) || 0,
        leads: parseFloat(row['Prospects']) || 0,
        cost_per_lead: parseFloat(row['Coût par prospect']) || 0,
        landing_page_views: parseFloat(row['Vues de page de destination']) || 0,
        cost_per_landing_page_view: parseFloat(row['Coût par vue de page de destination']) || 0,
        ad_set_delivery: row['Diffusion de l\'ensemble de publicités'] || '',
        report_start: row['Début des rapports'] || '',
        report_end: row['Fin des rapports'] || ''
      }));

      // Use a raw query to insert data since the table is not in the generated types yet
      const { error } = await supabase
        .from('ad_spending_data' as any)
        .insert(processedData);

      if (error) throw error;

      // 🎯 Attribution automatique des dépenses par produit/pays
      try {
        const groupedSpending = groupMetaSpendingByAttribution(rawData);
        if (groupedSpending.length > 0) {
          await processAutoAttribution(groupedSpending);
        }
      } catch (attributionError) {
        console.error('Erreur attribution automatique:', attributionError);
        // Ne pas bloquer l'import si l'attribution échoue
        toast({
          title: "Attribution partiellement réussie",
          description: "Données importées mais attribution automatique incomplète",
          variant: "destructive",
        });
      }

      await fetchData(); // Recharger les données
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'importation:', error);
      throw error;
    }
  };

  const exportData = (dataToExport: AdSpendingData[]) => {
    const headers = [
      'Date', 'Compte', 'Campagne', 'Impressions', 'Clics', 'CPC', 
      'Dépensé (USD)', 'Prospects', 'CTR (%)', 'CPM', 'LP Rate (%)'
    ];

    const csvContent = [
      headers.join(','),
      ...dataToExport.map(row => [
        new Date(row.date).toLocaleDateString('fr-FR'),
        `"${row.account_name}"`,
        `"${row.campaign_name}"`,
        row.impressions,
        row.link_clicks,
        row.cpc.toFixed(2),
        row.amount_spent.toFixed(2),
        row.leads,
        row.impressions > 0 ? ((row.link_clicks / row.impressions) * 100).toFixed(2) : '0',
        row.cpm.toFixed(2),
        row.lp_rate.toFixed(2)
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `depenses-publicitaires-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    fetchData();
  }, [user?.id]);

  return {
    data,
    loading,
    fetchData,
    importData,
    exportData
  };
};
