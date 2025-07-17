
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  TrendingUp, 
  TrendingDown,
  Package
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useDateRange } from '@/contexts/DateRangeContext';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ProductCountryPerformanceTableHeader } from './ProductCountryPerformanceTableHeader';
import { ProductCountryAccordionRow } from './ProductCountryAccordionRow';
import { useRealTimeAttributions } from '@/hooks/useRealTimeAttributions';
import { RealTimeStatusIndicator } from './RealTimeStatusIndicator';

interface ProductCountryData {
  product: string;
  country: string;
  leads: number;
  spend_usd: number;
  spend_dh: number;
  deliveries: number;
  cpl: number;
  cpd: number;
  delivery_rate: number;
  delivery_id?: string;
}

interface ProductSummary {
  product: string;
  total_leads: number;
  total_deliveries: number;
  total_spend_dh: number;
  avg_cpl: number;
  avg_cpd: number;
  global_delivery_rate: number;
  countries: CountryData[];
}

interface CountryData {
  country: string;
  leads: number;
  spend_dh: number;
  deliveries: number;
  cpl: number;
  cpd: number;
  delivery_rate: number;
  delivery_id?: string;
}

export const ProductCountryPerformanceTable = () => {
  const [performanceData, setPerformanceData] = useState<ProductCountryData[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [sortColumn, setSortColumn] = useState<keyof ProductSummary>('product');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const { user } = useAuth();
  const { dateRange } = useDateRange();
  const { toast } = useToast();
  const { lastUpdate } = useRealTimeAttributions();

  // Extraction des paramètres de date
  const dateParams = useMemo(() => {
    if (!dateRange?.start || !dateRange?.end) {
      return null;
    }
    return {
      startDate: format(dateRange.start, 'yyyy-MM-dd'),
      endDate: format(dateRange.end, 'yyyy-MM-dd')
    };
  }, [dateRange?.start, dateRange?.end]);

  // Fonction pour extraire produit et pays depuis le nom de campagne
  const extractProductAndCountry = useCallback((campaignName: string): { product: string; country: string } => {
    if (!campaignName) {
      return { product: '', country: '' };
    }

    const productPatterns = [
      { pattern: /viramax/i, product: 'VIRAMAX' },
      { pattern: /gluco/i, product: 'GLUCO CONTROL' },
      { pattern: /stud/i, product: 'STUD 5000' },
      { pattern: /shilamax/i, product: 'SHILAMAX' },
      { pattern: /alprostadil/i, product: 'ALPROSTADIL' }
    ];
    
    const countryPatterns = [
      { pattern: /\b(tg|togo)\b/i, country: 'TG' },
      { pattern: /\b(gn|guinee|guinea)\b/i, country: 'GN' },
      { pattern: /\b(bn|benin)\b/i, country: 'BN' },
      { pattern: /\b(cm|cameroun|cameroon)\b/i, country: 'CM' },
      { pattern: /\b(rc|congo)\b/i, country: 'RC' },
      { pattern: /\b(rdc|congo.*dem|drc)\b/i, country: 'RDC' },
      { pattern: /\b(bfa|bf|burkina)\b/i, country: 'BFA' },
      { pattern: /\b(mal|mali)\b/i, country: 'MAL' }
    ];
    
    let product = '';
    let country = '';
    
    for (const p of productPatterns) {
      if (p.pattern.test(campaignName)) {
        product = p.product;
        break;
      }
    }
    
    for (const c of countryPatterns) {
      if (c.pattern.test(campaignName)) {
        country = c.country;
        break;
      }
    }
    
    return { product, country };
  }, []);

  // Chargement des données de performance
  const loadPerformanceData = useCallback(async () => {
    if (!user?.id || !dateParams) return;

    setLoading(true);
    
    try {
      console.log('🔍 Chargement données performance pour:', dateParams);

      // 1. Récupérer les données Ad Spending
      const { data: adSpendingData, error: adError } = await supabase
        .from('ad_spending_data')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', dateParams.startDate)
        .lte('date', dateParams.endDate);

      if (adError) throw adError;

      // 2. Récupérer les données de livraisons directement
      const { data: deliveriesData, error: deliveriesError } = await supabase
        .from('product_country_deliveries')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', dateParams.startDate)
        .lte('date', dateParams.endDate);

      if (deliveriesError) {
        console.error('Erreur livraisons:', deliveriesError);
      }

      // 3. Traitement des données Ad Spending
      const productCountryMap = new Map<string, {
        product: string;
        country: string;
        leads: number;
        spend_usd: number;
        spend_dh: number;
        deliveries: number;
        delivery_id?: string;
      }>();

      // Agrégation des données Ad Spending
      adSpendingData?.forEach(row => {
        const { product, country } = extractProductAndCountry(row.campaign_name || '');
        
        if (!product || !country) return;

        const key = `${product}_${country}`;
        const existing = productCountryMap.get(key);
        const spendUsd = row.amount_spent || 0;
        const spendDh = spendUsd * 10.5;
        const leads = row.leads || 0;

        if (existing) {
          existing.leads += leads;
          existing.spend_usd += spendUsd;
          existing.spend_dh += spendDh;
        } else {
          productCountryMap.set(key, {
            product,
            country,
            leads,
            spend_usd: spendUsd,
            spend_dh: spendDh,
            deliveries: 0,
          });
        }
      });

      // 4. Ajouter les données de livraisons
      if (deliveriesData && Array.isArray(deliveriesData)) {
        deliveriesData.forEach((delivery: any) => {
          const key = `${delivery.product}_${delivery.country}`;
          const existing = productCountryMap.get(key);
          
          if (existing) {
            existing.deliveries = delivery.deliveries;
            existing.delivery_id = delivery.id;
          } else {
            // Créer une entrée même si pas de données Ad Spending
            productCountryMap.set(key, {
              product: delivery.product,
              country: delivery.country,
              leads: 0,
              spend_usd: 0,
              spend_dh: 0,
              deliveries: delivery.deliveries,
              delivery_id: delivery.id,
            });
          }
        });
      }

      // 5. Calcul des KPIs et conversion en array
      const performanceArray: ProductCountryData[] = Array.from(productCountryMap.values()).map(item => {
        const cpl = item.leads > 0 ? item.spend_dh / item.leads : 0;
        const cpd = item.deliveries > 0 ? item.spend_dh / item.deliveries : 0;
        const deliveryRate = item.leads > 0 ? (item.deliveries / item.leads) * 100 : 0;

        return {
          ...item,
          cpl,
          cpd,
          delivery_rate: deliveryRate,
        };
      });

      console.log('📊 Données performance calculées:', performanceArray.length, 'entrées');
      setPerformanceData(performanceArray);

    } catch (error) {
      console.error('❌ Erreur chargement performance:', error);
      toast({
        title: "Erreur de chargement",
        description: "Impossible de charger les données de performance",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user?.id, dateParams, extractProductAndCountry, toast]);

  // Chargement initial et mise à jour lors du changement de dates
  useEffect(() => {
    if (user?.id && dateParams) {
      loadPerformanceData();
    }
  }, [loadPerformanceData]);

  // Mise à jour en temps réel lors des modifications
  useEffect(() => {
    if (lastUpdate && user?.id && dateParams) {
      console.log('🔄 Rechargement automatique suite à:', lastUpdate);
      loadPerformanceData();
    }
  }, [lastUpdate, loadPerformanceData, user?.id, dateParams]);

  // Regroupement des données par produit pour la vue accordéon
  const productSummaries = useMemo(() => {
    const productMap = new Map<string, ProductSummary>();

    performanceData.forEach(item => {
      if (!productMap.has(item.product)) {
        productMap.set(item.product, {
          product: item.product,
          total_leads: 0,
          total_deliveries: 0,
          total_spend_dh: 0,
          avg_cpl: 0,
          avg_cpd: 0,
          global_delivery_rate: 0,
          countries: []
        });
      }

      const productSummary = productMap.get(item.product)!;
      productSummary.total_leads += item.leads;
      productSummary.total_deliveries += item.deliveries;
      productSummary.total_spend_dh += item.spend_dh;
      
      productSummary.countries.push({
        country: item.country,
        leads: item.leads,
        spend_dh: item.spend_dh,
        deliveries: item.deliveries,
        cpl: item.cpl,
        cpd: item.cpd,
        delivery_rate: item.delivery_rate,
        delivery_id: item.delivery_id
      });
    });

    // Calcul des moyennes pour chaque produit
    productMap.forEach(productSummary => {
      productSummary.avg_cpl = productSummary.total_leads > 0 ? productSummary.total_spend_dh / productSummary.total_leads : 0;
      productSummary.avg_cpd = productSummary.total_deliveries > 0 ? productSummary.total_spend_dh / productSummary.total_deliveries : 0;
      productSummary.global_delivery_rate = productSummary.total_leads > 0 ? (productSummary.total_deliveries / productSummary.total_leads) * 100 : 0;
    });

    return Array.from(productMap.values());
  }, [performanceData]);

  // Fonction de tri des produits
  const sortedProductSummaries = useMemo(() => {
    return [...productSummaries].sort((a, b) => {
      const aVal = a[sortColumn];
      const bVal = b[sortColumn];
      
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc' 
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }
      
      return 0;
    });
  }, [productSummaries, sortColumn, sortDirection]);

  // Fonction de tri des colonnes
  const handleSort = (column: keyof ProductSummary) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  // Modification des livraisons
  const handleDeliveryEdit = async (product: string, country: string, newDeliveries: number) => {
    if (!user?.id || !dateParams) return;

    try {
      const existingData = performanceData.find(
        item => item.product === product && item.country === country
      );

      if (existingData?.delivery_id) {
        // Mise à jour
        const { error } = await supabase
          .from('product_country_deliveries')
          .update({ deliveries: newDeliveries, updated_at: new Date().toISOString() })
          .eq('id', existingData.delivery_id);

        if (error) throw error;
      } else {
        // Création
        const { error } = await supabase
          .from('product_country_deliveries')
          .insert({
            user_id: user.id,
            product,
            country,
            date: dateParams.startDate,
            deliveries: newDeliveries,
          });

        if (error) throw error;
      }

      toast({
        title: "✅ Livraisons mises à jour",
        description: `${product} - ${country}: ${newDeliveries} livraisons`,
      });

      // Recharger les données
      await loadPerformanceData();

    } catch (error) {
      console.error('Erreur mise à jour livraisons:', error);
      toast({
        title: "❌ Erreur",
        description: "Impossible de mettre à jour les livraisons",
        variant: "destructive",
      });
    }
  };

  // Validation et sauvegarde de l'édition
  const handleSaveEdit = async () => {
    if (!editingCell) return;

    const [product, country] = editingCell.split('_');
    const newValue = parseInt(editValue);

    if (isNaN(newValue) || newValue < 0) {
      toast({
        title: "❌ Valeur invalide",
        description: "Veuillez saisir un nombre positif",
        variant: "destructive",
      });
      return;
    }

    // Vérification: livraisons <= leads
    const existingData = performanceData.find(
      item => item.product === product && item.country === country
    );
    
    if (existingData && newValue > existingData.leads && existingData.leads > 0) {
      toast({
        title: "⚠️ Validation",
        description: `Les livraisons (${newValue}) ne peuvent pas dépasser les leads (${existingData.leads})`,
        variant: "destructive",
      });
      return;
    }

    await handleDeliveryEdit(product, country, newValue);
    setEditingCell(null);
    setEditValue('');
  };

  // Annulation de l'édition
  const handleCancelEdit = () => {
    setEditingCell(null);
    setEditValue('');
  };

  // Formatage des nombres
  const formatNumber = (num: number, decimals = 2) => {
    if (num === 0) return '—';
    return num.toLocaleString('fr-FR', { 
      minimumFractionDigits: decimals, 
      maximumFractionDigits: decimals 
    });
  };

  // Coloration du taux de livraison
  const getDeliveryRateColor = (rate: number) => {
    if (rate === 0) return 'text-gray-400';
    if (rate < 10) return 'text-red-500';
    if (rate > 30) return 'text-green-600';
    return 'text-orange-500';
  };

  // Fonction d'export CSV
  const handleExport = () => {
    const csvData = [];
    
    // En-têtes CSV
    csvData.push([
      'Produit',
      'Pays',
      'Leads',
      'Deliveries',
      'Spend (DH)',
      'CPL (DH)',
      'CPD (DH)',
      'Delivery Rate (%)'
    ]);

    // Données par produit et pays
    sortedProductSummaries.forEach(productSummary => {
      // Ligne de résumé du produit
      csvData.push([
        `${productSummary.product} (TOTAL)`,
        'TOUS PAYS',
        productSummary.total_leads,
        productSummary.total_deliveries,
        productSummary.total_spend_dh.toFixed(2),
        productSummary.avg_cpl.toFixed(2),
        productSummary.avg_cpd.toFixed(2),
        productSummary.global_delivery_rate.toFixed(1)
      ]);

      // Détail par pays
      productSummary.countries.forEach(country => {
        csvData.push([
          productSummary.product,
          country.country,
          country.leads,
          country.deliveries,
          country.spend_dh.toFixed(2),
          country.cpl.toFixed(2),
          country.cpd.toFixed(2),
          country.delivery_rate.toFixed(1)
        ]);
      });
    });

    // Création et téléchargement du fichier CSV
    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `performance-produits-pays-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "📤 Export réussi",
      description: "Le fichier CSV a été téléchargé",
    });
  };

  // Calcul des totaux
  const totals = useMemo(() => {
    return productSummaries.reduce((acc, item) => ({
      leads: acc.leads + item.total_leads,
      deliveries: acc.deliveries + item.total_deliveries,
      spend_dh: acc.spend_dh + item.total_spend_dh,
    }), { leads: 0, deliveries: 0, spend_dh: 0 });
  }, [productSummaries]);

  const totalCPL = totals.leads > 0 ? totals.spend_dh / totals.leads : 0;
  const totalCPD = totals.deliveries > 0 ? totals.spend_dh / totals.deliveries : 0;
  const totalDeliveryRate = totals.leads > 0 ? (totals.deliveries / totals.leads) * 100 : 0;

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">Chargement des données de performance...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <ProductCountryPerformanceTableHeader
            dataCount={performanceData.length}
            dateParams={dateParams}
            onExport={handleExport}
          />
          <RealTimeStatusIndicator />
        </div>
      </CardHeader>

      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead 
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort('product')}
                >
                  <div className="flex items-center gap-1">
                    Produit
                    {sortColumn === 'product' && (
                      sortDirection === 'asc' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />
                    )}
                  </div>
                </TableHead>
                <TableHead>Pays</TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-gray-50 text-right"
                  onClick={() => handleSort('total_leads')}
                >
                  <div className="flex items-center justify-end gap-1">
                    Leads
                    {sortColumn === 'total_leads' && (
                      sortDirection === 'asc' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />
                    )}
                  </div>
                </TableHead>
                <TableHead className="text-right">Deliveries</TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-gray-50 text-right"
                  onClick={() => handleSort('total_spend_dh')}
                >
                  <div className="flex items-center justify-end gap-1">
                    Spend (DH)
                    {sortColumn === 'total_spend_dh' && (
                      sortDirection === 'asc' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />
                    )}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-gray-50 text-right"
                  onClick={() => handleSort('avg_cpl')}
                >
                  <div className="flex items-center justify-end gap-1">
                    CPL (DH)
                    {sortColumn === 'avg_cpl' && (
                      sortDirection === 'asc' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />
                    )}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-gray-50 text-right"
                  onClick={() => handleSort('avg_cpd')}
                >
                  <div className="flex items-center justify-end gap-1">
                    CPD (DH)
                    {sortColumn === 'avg_cpd' && (
                      sortDirection === 'asc' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />
                    )}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-gray-50 text-right"
                  onClick={() => handleSort('global_delivery_rate')}
                >
                  <div className="flex items-center justify-end gap-1">
                    Delivery Rate
                    {sortColumn === 'global_delivery_rate' && (
                      sortDirection === 'asc' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />
                    )}
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedProductSummaries.map((productData) => (
                <ProductCountryAccordionRow
                  key={productData.product}
                  productData={productData}
                  onDeliveryEdit={handleDeliveryEdit}
                  editingCell={editingCell}
                  setEditingCell={setEditingCell}
                  editValue={editValue}
                  setEditValue={setEditValue}
                  onSaveEdit={handleSaveEdit}
                  onCancelEdit={handleCancelEdit}
                  formatNumber={formatNumber}
                  getDeliveryRateColor={getDeliveryRateColor}
                />
              ))}
            </TableBody>

            {/* Ligne des totaux */}
            {productSummaries.length > 0 && (
              <TableBody>
                <TableRow className="border-t-2 border-gray-300 bg-gray-50 font-bold">
                  <TableCell colSpan={2} className="font-bold text-gray-700">
                    TOTAUX GÉNÉRAUX
                  </TableCell>
                  <TableCell className="text-right font-bold">
                    {totals.leads.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right font-bold">
                    {totals.deliveries.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right font-bold">
                    {formatNumber(totals.spend_dh)}
                  </TableCell>
                  <TableCell className="text-right font-bold">
                    {formatNumber(totalCPL)}
                  </TableCell>
                  <TableCell className="text-right font-bold">
                    {formatNumber(totalCPD)}
                  </TableCell>
                  <TableCell className={`text-right font-bold ${getDeliveryRateColor(totalDeliveryRate)}`}>
                    {totalDeliveryRate > 0 ? `${formatNumber(totalDeliveryRate, 1)}%` : '—'}
                  </TableCell>
                </TableRow>
              </TableBody>
            )}
          </Table>
        </div>

        {productSummaries.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">Aucune donnée de performance</p>
            <p className="text-sm">
              Les données apparaîtront automatiquement lorsque vous importerez des campagnes Ad Spending
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
