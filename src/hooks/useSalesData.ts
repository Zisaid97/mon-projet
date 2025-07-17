
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { SalesData } from '@/types/sales';
import { useToast } from '@/hooks/use-toast';

export const useSalesData = () => {
  const [data, setData] = useState<SalesData[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data: salesData, error } = await supabase
        .from('sales_data')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;
      setData(salesData || []);
    } catch (error) {
      console.error('Erreur lors du chargement des données de vente:', error);
      toast({
        title: "Erreur de chargement",
        description: "Impossible de charger les données de vente",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const importData = async (salesData: any[]) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Utilisateur non connecté');

      const formattedData = salesData.map(row => ({
        external_order_id: row['ID Externe de la Commande'] || '',
        date: row['Date'] || new Date().toISOString().split('T')[0],
        sales_channel: row['Canal de Vente'] || '',
        tracking_number: row['Numéro de Suivi'] || '',
        customer: row['Client'] || '',
        products: row['Produit(s)'] || '',
        price: parseFloat(row['Prix']) || 0,
        payment_method: row['Méthode de Paiement'] || '',
        deposit: parseFloat(row['Acompte']) || 0,
        customer_shipping: row['Expédition Client'] || '',
        phone: row['Téléphone'] || '',
        address: row['Adresse'] || '',
        city: row['Ville'] || '',
        notes: row['Notes'] || '',
        confirmation_status: row['Statut de Confirmation'] || '',
        confirmation_note: row['Note de Confirmation'] || '',
        delivery_agent: row['Livreur'] || '',
        delivery_status: row['Statut de Livraison'] || '',
        delivery_note: row['Note de Livraison'] || '',
        user_id: user.user.id
      }));

      const { error } = await supabase
        .from('sales_data')
        .insert(formattedData);

      if (error) throw error;

      toast({
        title: "Import réussi",
        description: `${formattedData.length} ventes importées avec succès`,
      });

      await fetchData();
    } catch (error) {
      console.error('Erreur lors de l\'import:', error);
      toast({
        title: "Erreur d'import",
        description: "Impossible d'importer les données",
        variant: "destructive",
      });
      throw error;
    }
  };

  const exportData = (filteredData: SalesData[]) => {
    const csvHeaders = [
      'ID', 'ID Externe de la Commande', 'Date', 'Canal de Vente', 'Numéro de Suivi',
      'Client', 'Produit(s)', 'Prix', 'Méthode de Paiement', 'Acompte',
      'Expédition Client', 'Téléphone', 'Adresse', 'Ville', 'Notes',
      'Statut de Confirmation', 'Note de Confirmation', 'Livreur',
      'Statut de Livraison', 'Note de Livraison'
    ];

    const csvContent = [
      csvHeaders.join(','),
      ...filteredData.map(row => [
        row.id,
        row.external_order_id,
        row.date,
        row.sales_channel,
        row.tracking_number,
        row.customer,
        row.products,
        row.price,
        row.payment_method,
        row.deposit,
        row.customer_shipping,
        row.phone,
        row.address,
        row.city,
        row.notes,
        row.confirmation_status,
        row.confirmation_note,
        row.delivery_agent,
        row.delivery_status,
        row.delivery_note
      ].map(field => `"${field}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `ventes_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    data,
    loading,
    fetchData,
    importData,
    exportData
  };
};
