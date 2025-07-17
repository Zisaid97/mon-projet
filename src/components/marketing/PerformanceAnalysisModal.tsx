
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Search, Download, BarChart3, PieChart, Filter, TrendingUp, TrendingDown, AlertTriangle, CalendarIcon, Globe, Trophy } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useMonthlyAverageRate } from '@/hooks/useMonthlyAverageRate';

interface PerformanceData {
  product: string;
  country: string;
  totalSpendDH: number;
  totalDeliveries: number;
  revenueGenerated: number;
  netProfit: number;
  cpd: number;
  roi: number;
  performanceLabel: 'profitable' | 'needs_improvement' | 'loss';
  performanceIcon: string;
  performanceColor: string;
}

interface PerformanceAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  // Nouvelles props pour recevoir les données synchronisées
  attributionsData?: Record<string, {
    countries: Record<string, { usd: number; dh: number; entries: any[] }>;
    totalUsd: number;
    totalDh: number;
  }>;
  deliveriesData?: Record<string, Record<string, number>>;
  productPrices?: Map<string, number>;
  dateRange?: { startDate: string; endDate: string };
}

const PERFORMANCE_THRESHOLDS = {
  profitable: { roiMin: 20, cpdMax: 130 },
  needsImprovement: { roiMin: 10, roiMax: 20, cpdMin: 130, cpdMax: 150 },
  loss: { roiMax: 0, cpdMin: 150 }
};

export const PerformanceAnalysisModal: React.FC<PerformanceAnalysisModalProps> = ({ 
  isOpen, 
  onClose,
  attributionsData = {},
  deliveriesData = {},
  productPrices = new Map(),
  dateRange
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProduct, setFilterProduct] = useState('all');
  const [filterCountry, setFilterCountry] = useState('all');
  const [filterPerformance, setFilterPerformance] = useState('all');
  const [loading, setLoading] = useState(false);
  
  // Date filters locaux (optionnels si on veut override les dates parentes)
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();

  // États pour les graphiques
  const [chartView, setChartView] = useState('products');
  const [chartMetric, setChartMetric] = useState('profit');
  const [chartType, setChartType] = useState('bar');

  // State pour les données filtrées par date
  const [filteredAttributionsData, setFilteredAttributionsData] = useState<Record<string, {
    countries: Record<string, { usd: number; dh: number; entries: any[] }>;
    totalUsd: number;
    totalDh: number;
  }>>({});
  const [filteredDeliveriesData, setFilteredDeliveriesData] = useState<Record<string, Record<string, number>>>({});
  const [filteredProductPrices, setFilteredProductPrices] = useState<Map<string, number>>(new Map());

  const { user } = useAuth();
  
  // Utiliser les dates locales si définies, sinon utiliser celles passées en props
  const effectiveDateRange = useMemo(() => {
    if (startDate && endDate) {
      return {
        startDate: format(startDate, 'yyyy-MM-dd'),
        endDate: format(endDate, 'yyyy-MM-dd')
      };
    }
    return dateRange || {
      startDate: format(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
      endDate: format(new Date(), 'yyyy-MM-dd')
    };
  }, [startDate, endDate, dateRange]);

  // Hook pour récupérer le taux de change moyen
  const { data: monthlyAverageRate } = useMonthlyAverageRate(
    startDate || (dateRange ? new Date(dateRange.startDate) : new Date())
  );

  // Hook pour récupérer les produits avec leurs CPD de la base de données
  const [productCpdMap, setProductCpdMap] = useState<Map<string, number>>(new Map());

  // Catégoriser la performance
  const categorizePerformance = useCallback((roi: number, cpd: number): { label: 'profitable' | 'needs_improvement' | 'loss', icon: string, color: string } => {
    if (roi > PERFORMANCE_THRESHOLDS.profitable.roiMin && cpd < PERFORMANCE_THRESHOLDS.profitable.cpdMax) {
      return { label: 'profitable', icon: '🟢', color: 'text-green-600 bg-green-50' };
    } else if (
      (roi >= PERFORMANCE_THRESHOLDS.needsImprovement.roiMin && roi <= PERFORMANCE_THRESHOLDS.needsImprovement.roiMax) ||
      (cpd >= PERFORMANCE_THRESHOLDS.needsImprovement.cpdMin && cpd <= PERFORMANCE_THRESHOLDS.needsImprovement.cpdMax)
    ) {
      return { label: 'needs_improvement', icon: '🟠', color: 'text-orange-600 bg-orange-50' };
    } else {
      return { label: 'loss', icon: '🔴', color: 'text-red-600 bg-red-50' };
    }
  }, []);

  // Fonction pour charger les données filtrées par date
  const loadFilteredData = useCallback(async () => {
    if (!user?.id || loading) return;

    setLoading(true);
    console.log('🔄 FORÇAGE RECALCUL - Rechargement complet des données...');
    
    try {
      console.log('🔄 Chargement données filtrées pour période:', effectiveDateRange);

      // 1. Charger les produits avec leurs CPD de la base de données
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('name, cpd_category')
        .eq('user_id', user.id);

      if (productsError) throw productsError;

      // Créer une map des CPD par produit
      const cpdMap = new Map<string, number>();
      productsData?.forEach(product => {
        cpdMap.set(product.name.toUpperCase(), product.cpd_category);
      });
      setProductCpdMap(cpdMap);
      console.log('💰 CPD chargés depuis la base:', Object.fromEntries(cpdMap));

      // 2. Charger les données Ad Spending filtrées par date
      const { data: adSpendingData, error: adError } = await supabase
        .from('ad_spending_data')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', effectiveDateRange.startDate)
        .lte('date', effectiveDateRange.endDate);

      if (adError) throw adError;

      // 3. Charger les données de livraisons filtrées par date depuis product_country_deliveries
      const { data: deliveriesData, error: deliveriesError } = await supabase
        .from('product_country_deliveries')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', effectiveDateRange.startDate)
        .lte('date', effectiveDateRange.endDate);

      if (deliveriesError) throw deliveriesError;

      // 4. Traitement des données avec taux de change moyen
      const exchangeRate = monthlyAverageRate || 10.5;
      
      // Fonction pour extraire produit et pays - UTILISER LA MÊME LOGIQUE que useMetaAttributions
      const extractProductAndCountry = (campaignName: string) => {
        const productPatterns = [
          { pattern: /viramax/i, product: 'VIRAMAX' },
          { pattern: /gluco/i, product: 'GLUCO CONTROL' },
          { pattern: /stud/i, product: 'STUD 5000' },
          { pattern: /shilamax/i, product: 'SHILAMAX' },
          { pattern: /(shilajite.*gold.*gummies|gold.*gummies)/i, product: 'SHILAJITE GOLD GUMMIES' },
          { pattern: /alprostadil/i, product: 'ALPROSTADIL' }
        ];
        
        const countryPatterns = [
          { pattern: /\b(tg|togo)\b/i, country: 'TG' },
          { pattern: /\b(gn|guinee|guinea)\b/i, country: 'GN' },
          { pattern: /\b(bn|bj|benin)\b/i, country: 'BN' },
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
      };

      // Agrégation des dépenses par produit/pays avec calcul du nombre de campagnes
      const aggregatedAttributions: Record<string, {
        countries: Record<string, { 
          usd: number; 
          dh: number; 
          entries: any[];
          campaignCount: number; // NOUVEAU: Nombre de campagnes par jour
        }>;
        totalUsd: number;
        totalDh: number;
      }> = {};

      // Analyser les dépenses par jour pour calculer le nombre de campagnes
      const dailyCampaignTracker: Record<string, Set<string>> = {}; // produit-pays-date -> Set de campaigns

      adSpendingData?.forEach(row => {
        const { product, country } = extractProductAndCountry(row.campaign_name || '');
        
        if (!product || !country) return;

        // Tracker unique par produit-pays-date
        const dayKey = `${product}-${country}-${row.date}`;
        if (!dailyCampaignTracker[dayKey]) {
          dailyCampaignTracker[dayKey] = new Set();
        }
        dailyCampaignTracker[dayKey].add(row.campaign_name || '');

        if (!aggregatedAttributions[product]) {
          aggregatedAttributions[product] = {
            countries: {},
            totalUsd: 0,
            totalDh: 0
          };
        }

        if (!aggregatedAttributions[product].countries[country]) {
          aggregatedAttributions[product].countries[country] = {
            usd: 0,
            dh: 0,
            entries: [],
            campaignCount: 0
          };
        }

        const spendUsd = row.amount_spent || 0;
        const spendDh = spendUsd * exchangeRate; // Utilisation du taux moyen

        aggregatedAttributions[product].countries[country].usd += spendUsd;
        aggregatedAttributions[product].countries[country].dh += spendDh;
        aggregatedAttributions[product].countries[country].entries.push(row);
        aggregatedAttributions[product].totalUsd += spendUsd;
        aggregatedAttributions[product].totalDh += spendDh;
      });

      // Calculer le nombre total de campagnes pour chaque produit/pays
      Object.keys(dailyCampaignTracker).forEach(dayKey => {
        const [product, country, date] = dayKey.split('-');
        const campaignCount = dailyCampaignTracker[dayKey].size;
        
        if (aggregatedAttributions[product]?.countries[country]) {
          aggregatedAttributions[product].countries[country].campaignCount += campaignCount;
        }
      });

      // Agrégation des livraisons par produit/pays depuis product_country_deliveries
      const aggregatedDeliveries: Record<string, Record<string, number>> = {};
      deliveriesData?.forEach(delivery => {
        let productName = delivery.product?.toUpperCase() || '';
        const country = delivery.country || '';
        
        if (!productName || !country) return;
        
        // Normaliser les noms de produits pour correspondre EXACTEMENT à ceux des attributions
        if (productName.includes('SHILAJITE') && productName.includes('GOLD')) {
          productName = 'SHILAJITE GOLD GUMMIES';
        } else if (productName.includes('GLUCO')) {
          productName = 'GLUCO CONTROL';
        }
        
        console.log(`🔄 Livraison trouvée: ${productName} (${country}) = ${delivery.deliveries}`);
        
        if (!aggregatedDeliveries[productName]) {
          aggregatedDeliveries[productName] = {};
        }
        // CORRECTION: Agréger correctement par date - sommer toutes les livraisons pour le produit/pays
        aggregatedDeliveries[productName][country] = 
          (aggregatedDeliveries[productName][country] || 0) + (delivery.deliveries || 0);
      });

      setFilteredAttributionsData(aggregatedAttributions);
      setFilteredDeliveriesData(aggregatedDeliveries);
      setFilteredProductPrices(cpdMap);

      console.log('✅ RECALCUL FORCÉ - Données rechargées:', {
        attributions: Object.keys(aggregatedAttributions).length,
        deliveries: Object.keys(aggregatedDeliveries).length,
        cpd_products: cpdMap.size,
        exchangeRate,
        period: effectiveDateRange,
        // Debug VIRAMAX - RDC spécifiquement
        viramax_rdc_spend: aggregatedAttributions['VIRAMAX']?.countries['RDC']?.dh || 0,
        viramax_rdc_deliveries: aggregatedDeliveries['VIRAMAX']?.['RDC'] || 0,
        viramax_cpd: cpdMap.get('VIRAMAX') || 0,
        viramax_campaigns: aggregatedAttributions['VIRAMAX']?.countries['RDC']?.campaignCount || 0
      });

    } catch (error) {
      console.error('❌ Erreur chargement données filtrées:', error);
      toast({
        title: "Erreur de chargement",
        description: "Impossible de charger les données pour la période sélectionnée",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user?.id, effectiveDateRange, monthlyAverageRate, toast]);

  // Charger les données filtrées quand la période change
  useEffect(() => {
    if (isOpen && user?.id) {
      loadFilteredData();
    }
  }, [isOpen, effectiveDateRange, loadFilteredData]);

  // ✅ UTILISER LES DONNÉES FILTRÉES PAR DATE
  const performanceData = useMemo(() => {
    const results: PerformanceData[] = [];
    
    const dataToUse = Object.keys(filteredAttributionsData).length > 0 
      ? { 
          attributions: filteredAttributionsData, 
          deliveries: filteredDeliveriesData, 
          prices: filteredProductPrices 
        }
      : { 
          attributions: attributionsData, 
          deliveries: deliveriesData, 
          prices: productPrices 
        };
    
    console.log('🔄 Génération analyse avec données filtrées:', {
      attributions: Object.keys(dataToUse.attributions).length,
      deliveries: Object.keys(dataToUse.deliveries).length,
      prices: dataToUse.prices.size,
      period: effectiveDateRange
    });

    // Parcourir les données d'attributions filtrées
    Object.entries(dataToUse.attributions).forEach(([product, productData]) => {
      Object.entries(productData.countries).forEach(([country, amounts]) => {
        const totalSpendDH = amounts.dh;
        const totalDeliveries = dataToUse.deliveries[product]?.[country] || 0;
        // CORRECTION: Utiliser le CPD de la base de données
        const productCpd = dataToUse.prices.get(product.toUpperCase()) || 150; // CPD par défaut
        
        // Calculer le nombre de campagnes basé sur les jours uniques de dépenses
        let campaignCount = 1;
        if (productData.countries[country]?.entries) {
          const uniqueDays = new Set(productData.countries[country].entries.map((entry: any) => entry.date));
          campaignCount = uniqueDays.size;
        }
        
        const revenueGenerated = totalDeliveries * productCpd;
        const netProfit = revenueGenerated - totalSpendDH;
        const cpd = totalDeliveries > 0 ? totalSpendDH / totalDeliveries : 0;
        const roi = totalSpendDH > 0 ? ((netProfit / totalSpendDH) * 100) : 0;
        
        const performance = categorizePerformance(roi, cpd);

        console.log(`📊 Performance ${product} (${country}) [${effectiveDateRange.startDate} - ${effectiveDateRange.endDate}]:`, {
          spend: totalSpendDH.toFixed(2),
          deliveries: totalDeliveries,
          cpd_used: productCpd,
          revenue: revenueGenerated.toFixed(2),
          profit: netProfit.toFixed(2),
          cpd_calculated: cpd.toFixed(2),
          roi: roi.toFixed(2),
          campaigns: campaignCount,
          calculation: `${totalDeliveries} × ${productCpd} - ${totalSpendDH.toFixed(2)} = ${netProfit.toFixed(2)}`
        });

        results.push({
          product,
          country,
          totalSpendDH,
          totalDeliveries,
          revenueGenerated,
          netProfit,
          cpd,
          roi,
          performanceLabel: performance.label,
          performanceIcon: performance.icon,
          performanceColor: performance.color
        });
      });
    });

    // Trier par profit net décroissant
    results.sort((a, b) => b.netProfit - a.netProfit);
    
    console.log(`✅ Analyse par date terminée: ${results.length} combinaisons pour période ${effectiveDateRange.startDate} - ${effectiveDateRange.endDate}`);
    return results;
  }, [filteredAttributionsData, filteredDeliveriesData, filteredProductPrices, attributionsData, deliveriesData, productPrices, categorizePerformance, effectiveDateRange]);

  // Filtrer les données
  const filteredData = useMemo(() => {
    return performanceData.filter(item => {
      const matchesSearch = searchTerm === '' || 
        item.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.country.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesProduct = filterProduct === 'all' || item.product === filterProduct;
      const matchesCountry = filterCountry === 'all' || item.country === filterCountry;
      const matchesPerformance = filterPerformance === 'all' || item.performanceLabel === filterPerformance;

      return matchesSearch && matchesProduct && matchesCountry && matchesPerformance;
    });
  }, [performanceData, searchTerm, filterProduct, filterCountry, filterPerformance]);

  // Options de filtres
  const uniqueProducts = useMemo(() => [...new Set(performanceData.map(item => item.product))], [performanceData]);
  const uniqueCountries = useMemo(() => [...new Set(performanceData.map(item => item.country))], [performanceData]);

  // Statistiques globales
  const globalStats = useMemo(() => {
    const total = filteredData.length;
    const profitable = filteredData.filter(item => item.performanceLabel === 'profitable').length;
    const needsImprovement = filteredData.filter(item => item.performanceLabel === 'needs_improvement').length;
    const loss = filteredData.filter(item => item.performanceLabel === 'loss').length;
    
    const totalSpend = filteredData.reduce((sum, item) => sum + item.totalSpendDH, 0);
    const totalRevenue = filteredData.reduce((sum, item) => sum + item.revenueGenerated, 0);
    const totalProfit = filteredData.reduce((sum, item) => sum + item.netProfit, 0);

    return { total, profitable, needsImprovement, loss, totalSpend, totalRevenue, totalProfit };
  }, [filteredData]);

  // Couleurs pour les graphiques
  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00', '#ff00ff', '#00ffff', '#ff0000'];

  // Fonction pour préparer les données des graphiques
  const getChartData = useCallback(() => {
    if (chartView === 'products') {
      const productData = filteredData.reduce((acc, item) => {
        if (!acc[item.product]) {
          acc[item.product] = {
            name: item.product,
            spend: 0,
            deliveries: 0,
            profit: 0,
            roi: 0,
            countries: new Set(),
            campaigns: 0
          };
        }
        acc[item.product].spend += item.totalSpendDH;
        acc[item.product].deliveries += item.totalDeliveries;
        acc[item.product].profit += item.netProfit;
        acc[item.product].countries.add(item.country);
        
        // Calculer le nombre de campagnes basé sur les jours uniques de dépenses
        const productAttrib = filteredAttributionsData[item.product] || attributionsData[item.product];
        const countryAttrib = productAttrib?.countries[item.country];
        
        if (countryAttrib?.entries) {
          // Compter les jours uniques où il y a eu des dépenses = nombre de campagnes
          const uniqueDays = new Set(countryAttrib.entries.map((entry: any) => entry.date));
          acc[item.product].campaigns += uniqueDays.size;
        } else {
          acc[item.product].campaigns += 1;
        }
        return acc;
      }, {} as Record<string, any>);

      return Object.values(productData).map(item => ({
        ...item,
        countries: item.countries.size,
        roi: item.spend > 0 ? ((item.profit / item.spend) * 100) : 0
      }));
    }

    if (chartView === 'countries') {
      const countryData = filteredData.reduce((acc, item) => {
        if (!acc[item.country]) {
          acc[item.country] = {
            name: item.country,
            spend: 0,
            deliveries: 0,
            profit: 0,
            roi: 0,
            products: new Set(),
            campaigns: 0
          };
        }
        acc[item.country].spend += item.totalSpendDH;
        acc[item.country].deliveries += item.totalDeliveries;
        acc[item.country].profit += item.netProfit;
        acc[item.country].products.add(item.product);
        
        // Calculer le nombre de campagnes basé sur les jours uniques de dépenses
        const productAttrib = filteredAttributionsData[item.product] || attributionsData[item.product];
        const countryAttrib = productAttrib?.countries[item.country];
        
        if (countryAttrib?.entries) {
          // Compter les jours uniques où il y a eu des dépenses = nombre de campagnes
          const uniqueDays = new Set(countryAttrib.entries.map((entry: any) => entry.date));
          acc[item.country].campaigns += uniqueDays.size;
        } else {
          acc[item.country].campaigns += 1;
        }
        return acc;
      }, {} as Record<string, any>);

      return Object.values(countryData).map(item => ({
        ...item,
        products: item.products.size,
        roi: item.spend > 0 ? ((item.profit / item.spend) * 100) : 0
      }));
    }

    // Vue campagnes = toutes les combinaisons produit-pays
    return filteredData.map(item => ({
      name: `${item.product} (${item.country})`,
      spend: item.totalSpendDH,
      deliveries: item.totalDeliveries,
      profit: item.netProfit,
      roi: item.roi,
      campaigns: 1 // Chaque ligne représente une combinaison unique = 1 campagne
    }));
  }, [filteredData, chartView]);

  // Fonction pour rendre le graphique principal
  const renderMainChart = useCallback(() => {
    const data = getChartData();
    const metricKey = chartMetric;

    if (chartType === 'bar') {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="name" 
              angle={-45}
              textAnchor="end"
              height={100}
              interval={0}
              fontSize={12}
            />
            <YAxis />
            <Tooltip 
              formatter={(value, name) => {
                if (name === 'spend') return [`${Number(value).toLocaleString()} DH`, 'Dépenses'];
                if (name === 'deliveries') return [value, 'Livraisons'];
                if (name === 'profit') return [`${Number(value).toLocaleString()} DH`, 'Profit Net'];
                if (name === 'roi') return [`${Number(value).toFixed(1)}%`, 'ROI'];
                if (name === 'campaigns') return [value, 'Campagnes'];
                return [value, name];
              }}
            />
            <Bar 
              dataKey={metricKey} 
              fill="#8884d8"
              name={
                metricKey === 'spend' ? 'Dépenses' :
                metricKey === 'deliveries' ? 'Livraisons' :
                metricKey === 'profit' ? 'Profit Net' :
                metricKey === 'campaigns' ? 'Campagnes' : 'ROI'
              }
            />
          </BarChart>
        </ResponsiveContainer>
      );
    }

    if (chartType === 'pie') {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <RechartsPieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              outerRadius={80}
              fill="#8884d8"
              dataKey={metricKey}
              label={({ name, value }) => 
                metricKey === 'spend' || metricKey === 'profit' 
                  ? `${name}: ${Number(value).toLocaleString()}` 
                  : `${name}: ${value}`
              }
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value) => {
                if (metricKey === 'spend' || metricKey === 'profit') {
                  return [`${Number(value).toLocaleString()} DH`];
                }
                if (metricKey === 'roi') {
                  return [`${Number(value).toFixed(1)}%`];
                }
                if (metricKey === 'campaigns') {
                  return [`${value} campagnes`];
                }
                return [value];
              }}
            />
          </RechartsPieChart>
        </ResponsiveContainer>
      );
    }

    // Line chart
    return (
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="name" 
            angle={-45}
            textAnchor="end"
            height={100}
            interval={0}
            fontSize={12}
          />
          <YAxis />
          <Tooltip 
            formatter={(value, name) => {
              if (name === 'spend') return [`${Number(value).toLocaleString()} DH`, 'Dépenses'];
              if (name === 'deliveries') return [value, 'Livraisons'];
              if (name === 'profit') return [`${Number(value).toLocaleString()} DH`, 'Profit Net'];
              if (name === 'roi') return [`${Number(value).toFixed(1)}%`, 'ROI'];
              if (name === 'campaigns') return [value, 'Campagnes'];
              return [value, name];
            }}
          />
          <Line 
            type="monotone" 
            dataKey={metricKey} 
            stroke="#8884d8" 
            strokeWidth={2}
            name={
              metricKey === 'spend' ? 'Dépenses' :
              metricKey === 'deliveries' ? 'Livraisons' :
              metricKey === 'profit' ? 'Profit Net' :
              metricKey === 'campaigns' ? 'Campagnes' : 'ROI'
            }
          />
        </LineChart>
      </ResponsiveContainer>
    );
  }, [getChartData, chartMetric, chartType]);

  // Statistiques par produit et pays
  const getProductCountryStats = useCallback(() => {
    const productStats = filteredData.reduce((acc, item) => {
      if (!acc[item.product]) {
        acc[item.product] = {
          product: item.product,
          countries: new Set(),
          countryList: [],
          totalCampaigns: 0,
          totalSpend: 0,
          totalDeliveries: 0,
          totalProfit: 0
        };
      }
      
      acc[item.product].countries.add(item.country);
      acc[item.product].totalCampaigns += 1;
      acc[item.product].totalSpend += item.totalSpendDH;
      acc[item.product].totalDeliveries += item.totalDeliveries;
      acc[item.product].totalProfit += item.netProfit;
      
      return acc;
    }, {} as Record<string, any>);

    return Object.values(productStats).map(stat => ({
      ...stat,
      countries: stat.countries.size,
      countryList: Array.from(stat.countries)
    })).sort((a, b) => b.totalProfit - a.totalProfit);
  }, [filteredData]);

  // Top performers
  const getTopPerformers = useCallback(() => {
    return filteredData
      .slice()
      .sort((a, b) => b.netProfit - a.netProfit)
      .slice(0, 5)
      .map(item => ({
        name: item.product,
        country: item.country,
        profit: item.netProfit,
        roi: item.roi
      }));
  }, [filteredData]);

  // Exporter en CSV
  const exportToCSV = useCallback(() => {
    const headers = [
      'Produit', 'Pays', 'Dépenses (DH)', 'Livraisons', 
      'Revenus (DH)', 'Profit Net (DH)', 'CPD (DH)', 'ROI (%)', 'Performance'
    ];

    const csvContent = [
      headers.join(','),
      ...filteredData.map(item => [
        `"${item.product}"`,
        `"${item.country}"`,
        item.totalSpendDH.toFixed(2),
        item.totalDeliveries,
        item.revenueGenerated.toFixed(2),
        item.netProfit.toFixed(2),
        item.cpd.toFixed(2),
        item.roi.toFixed(2),
        item.performanceLabel === 'profitable' ? 'Rentable' : 
        item.performanceLabel === 'needs_improvement' ? 'À améliorer' : 'Perte'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `analyse-performance-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Export réussi",
      description: "Le fichier CSV a été téléchargé",
    });
  }, [filteredData]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[95vh] flex flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            📊 Analyse Dynamique des Performances - Données Synchronisées ✅
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <Tabs defaultValue="analysis" className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-3 shrink-0">
              <TabsTrigger value="analysis">📊 Analyse Détaillée</TabsTrigger>
              <TabsTrigger value="overview">📈 Vue d'ensemble</TabsTrigger>
              <TabsTrigger value="charts">📉 Graphiques</TabsTrigger>
            </TabsList>

            <TabsContent value="analysis" className="flex-1 overflow-y-auto">
              <div className="space-y-4 p-1">
                {/* Filtres et période */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">🔍 Filtres et Période d'Analyse</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {/* Sélection de période optionnelle */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Date de début (optionnel)</label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !startDate && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {startDate ? format(startDate, "dd/MM/yyyy") : "Auto"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={startDate}
                              onSelect={setStartDate}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Date de fin (optionnel)</label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !endDate && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {endDate ? format(endDate, "dd/MM/yyyy") : "Auto"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={endDate}
                              onSelect={setEndDate}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>

                      <div className="text-xs text-gray-500 flex items-center self-end">
                        📅 Période active: {effectiveDateRange.startDate} → {effectiveDateRange.endDate}
                      </div>

                      <div className="text-xs text-green-600 flex items-center self-end">
                        ✅ Données synchronisées en temps réel
                      </div>
                    </div>

                    {/* Filtres de recherche */}
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                      <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Rechercher..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-8"
                        />
                      </div>
                      
                      <Select value={filterProduct} onValueChange={setFilterProduct}>
                        <SelectTrigger>
                          <SelectValue placeholder="Produit" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Tous les produits</SelectItem>
                          {uniqueProducts.filter(product => product && product.trim()).map(product => (
                            <SelectItem key={product} value={product}>{product}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select value={filterCountry} onValueChange={setFilterCountry}>
                        <SelectTrigger>
                          <SelectValue placeholder="Pays" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Tous les pays</SelectItem>
                          {uniqueCountries.filter(country => country && country.trim()).map(country => (
                            <SelectItem key={country} value={country}>{country}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select value={filterPerformance} onValueChange={setFilterPerformance}>
                        <SelectTrigger>
                          <SelectValue placeholder="Performance" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Toutes</SelectItem>
                          <SelectItem value="profitable">🟢 Rentable</SelectItem>
                          <SelectItem value="needs_improvement">🟠 À améliorer</SelectItem>
                          <SelectItem value="loss">🔴 Perte</SelectItem>
                        </SelectContent>
                      </Select>

                      <Button
                        variant="outline"
                        onClick={() => {
                          setSearchTerm('');
                          setFilterProduct('all');
                          setFilterCountry('all');
                          setFilterPerformance('all');
                        }}
                      >
                        <Filter className="h-4 w-4 mr-2" />
                        Reset
                      </Button>

                      <Button 
                        onClick={() => {
                          // Forcer le rechargement complet des données
                          setFilteredAttributionsData({});
                          setFilteredDeliveriesData({});
                          setFilteredProductPrices(new Map());
                          loadFilteredData();
                        }} 
                        variant="outline"
                        className="bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100"
                      >
                        🔄 Forcer Recalcul
                      </Button>

                      <Button onClick={exportToCSV} variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Export CSV
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Notification de synchronisation */}
                <div className="bg-green-100 border border-green-300 rounded-md p-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-700 font-medium">
                      ✅ Données synchronisées en temps réel avec la section Attribution
                    </span>
                  </div>
                  <p className="text-xs text-green-600 mt-1">
                    Les montants affichés correspondent exactement aux données de la page Attribution des Dépenses
                  </p>
                </div>

                {/* Tableau des résultats */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center justify-between">
                      📋 Résultats Synchronisés ({filteredData.length} combinaisons)
                      {loading && (
                        <div className="flex items-center gap-2 text-blue-600">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                          <span className="text-xs">Chargement...</span>
                        </div>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="overflow-y-auto max-h-96">
                    {loading ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                          <p className="text-gray-500">Chargement des données filtrées par date...</p>
                          <p className="text-xs text-gray-400 mt-1">
                            Période: {effectiveDateRange.startDate} → {effectiveDateRange.endDate}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Performance</TableHead>
                            <TableHead>Produit</TableHead>
                            <TableHead>Pays</TableHead>
                            <TableHead className="text-right">Dépenses (DH)</TableHead>
                            <TableHead className="text-right">Livraisons</TableHead>
                            <TableHead className="text-right">Revenus (DH)</TableHead>
                            <TableHead className="text-right">Profit Net (DH)</TableHead>
                            <TableHead className="text-right">CPD (DH)</TableHead>
                            <TableHead className="text-right">ROI (%)</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredData.map((item, index) => (
                            <TableRow key={`${item.product}_${item.country}_${index}`}>
                              <TableCell>
                                <Badge className={item.performanceColor}>
                                  {item.performanceIcon} {
                                    item.performanceLabel === 'profitable' ? 'Rentable' :
                                    item.performanceLabel === 'needs_improvement' ? 'À améliorer' : 'Perte'
                                  }
                                </Badge>
                              </TableCell>
                              <TableCell className="font-medium">{item.product}</TableCell>
                              <TableCell>{item.country}</TableCell>
                              <TableCell className="text-right font-semibold text-blue-600">{item.totalSpendDH.toLocaleString()} DH</TableCell>
                              <TableCell className="text-right">{item.totalDeliveries}</TableCell>
                              <TableCell className="text-right">{item.revenueGenerated.toLocaleString()} DH</TableCell>
                              <TableCell className={`text-right font-semibold ${item.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {item.netProfit >= 0 ? '+' : ''}{item.netProfit.toLocaleString()} DH
                              </TableCell>
                              <TableCell className="text-right">{item.cpd.toFixed(2)} DH</TableCell>
                              <TableCell className={`text-right font-semibold ${item.roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {item.roi >= 0 ? '+' : ''}{item.roi.toFixed(1)}%
                              </TableCell>
                            </TableRow>
                          ))}
                          
                          {/* Ligne de totaux et moyennes */}
                          {filteredData.length > 0 && (
                            <TableRow className="border-t-2 border-gray-300 bg-gray-50 font-bold">
                              <TableCell className="font-bold text-gray-800">📊 TOTAUX / MOYENNES</TableCell>
                              <TableCell className="text-center text-gray-600">{filteredData.length} lignes</TableCell>
                              <TableCell className="text-center text-gray-600">-</TableCell>
                              <TableCell className="text-right font-bold text-blue-700">
                                {globalStats.totalSpend.toLocaleString()} DH
                              </TableCell>
                              <TableCell className="text-right font-bold">
                                {filteredData.reduce((sum, item) => sum + item.totalDeliveries, 0)}
                              </TableCell>
                              <TableCell className="text-right font-bold text-green-700">
                                {globalStats.totalRevenue.toLocaleString()} DH
                              </TableCell>
                              <TableCell className={`text-right font-bold ${globalStats.totalProfit >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                                {globalStats.totalProfit >= 0 ? '+' : ''}{globalStats.totalProfit.toLocaleString()} DH
                              </TableCell>
                              <TableCell className="text-right font-bold text-orange-600">
                                {filteredData.length > 0 ? 
                                  (globalStats.totalSpend / filteredData.reduce((sum, item) => sum + item.totalDeliveries, 0) || 0).toFixed(2) 
                                  : '0.00'} DH
                                <div className="text-xs text-gray-500 font-normal">CPD Moyen</div>
                              </TableCell>
                              <TableCell className={`text-right font-bold ${(globalStats.totalProfit / globalStats.totalSpend * 100) >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                                {globalStats.totalSpend > 0 ? 
                                  ((globalStats.totalProfit / globalStats.totalSpend) * 100).toFixed(1) 
                                  : '0.0'}%
                                <div className="text-xs text-gray-500 font-normal">ROI Global</div>
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="overview" className="flex-1 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Total Combinaisons</p>
                        <p className="text-2xl font-bold">{globalStats.total}</p>
                      </div>
                      <BarChart3 className="h-8 w-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">🟢 Rentables</p>
                        <p className="text-2xl font-bold text-green-600">{globalStats.profitable}</p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">🟠 À améliorer</p>
                        <p className="text-2xl font-bold text-orange-600">{globalStats.needsImprovement}</p>
                      </div>
                      <AlertTriangle className="h-8 w-8 text-orange-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">🔴 En perte</p>
                        <p className="text-2xl font-bold text-red-600">{globalStats.loss}</p>
                      </div>
                      <TrendingDown className="h-8 w-8 text-red-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">💰 Dépenses Totales</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-blue-600">
                      {globalStats.totalSpend.toLocaleString()} DH
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">📈 Revenus Totaux</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-green-600">
                      {globalStats.totalRevenue.toLocaleString()} DH
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">💎 Profit Net Global</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className={`text-3xl font-bold ${globalStats.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {globalStats.totalProfit >= 0 ? '+' : ''}{globalStats.totalProfit.toLocaleString()} DH
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="charts" className="flex-1 overflow-y-auto">
              <div className="space-y-6 p-1">
              {/* Filtres dynamiques pour les graphiques */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Filter className="h-5 w-5" />
                    Filtres Graphiques
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Vue Graphique</label>
                      <Select value={chartView} onValueChange={setChartView}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="products">Par Produit</SelectItem>
                          <SelectItem value="countries">Par Pays</SelectItem>
                          <SelectItem value="campaigns">Campagnes</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-2 block">Métrique</label>
                      <Select value={chartMetric} onValueChange={setChartMetric}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="spend">Dépenses (DH)</SelectItem>
                          <SelectItem value="deliveries">Livraisons</SelectItem>
                          <SelectItem value="profit">Profit Net</SelectItem>
                          <SelectItem value="roi">ROI (%)</SelectItem>
                          <SelectItem value="campaigns">🎯 Nombre de Campagnes</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Type de Graphique</label>
                      <Select value={chartType} onValueChange={setChartType}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bar">Barres</SelectItem>
                          <SelectItem value="pie">Camembert</SelectItem>
                          <SelectItem value="line">Ligne</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Graphiques */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Graphique principal */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      {chartView === 'products' && 'Analyse par Produit'}
                      {chartView === 'countries' && 'Analyse par Pays'}
                      {chartView === 'campaigns' && 'Analyse des Campagnes'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      {renderMainChart()}
                    </div>
                  </CardContent>
                </Card>

                {/* Statistiques produits/pays */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Globe className="h-5 w-5" />
                      Répartition Géographique
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {getProductCountryStats().map((stat, index) => (
                        <div key={index} className="border-b pb-3 last:border-b-0">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium text-sm">{stat.product}</span>
                            <span className="text-xs bg-blue-100 px-2 py-1 rounded">
                              {stat.countries} pays
                            </span>
                          </div>
                          <div className="text-xs text-gray-600">
                            Pays: {stat.countryList.join(', ')}
                          </div>
                          <div className="flex justify-between text-xs mt-1">
                            <span>Total campagnes: {stat.totalCampaigns}</span>
                            <span className={stat.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}>
                              {stat.totalProfit >= 0 ? '+' : ''}{stat.totalProfit.toLocaleString()} DH
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Top performers */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Trophy className="h-5 w-5" />
                      Top Performers
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {getTopPerformers().map((performer, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                              index === 0 ? 'bg-yellow-500 text-white' :
                              index === 1 ? 'bg-gray-400 text-white' :
                              index === 2 ? 'bg-orange-500 text-white' :
                              'bg-blue-500 text-white'
                            }`}>
                              {index + 1}
                            </div>
                            <div>
                              <div className="font-medium text-sm">{performer.name}</div>
                              <div className="text-xs text-gray-600">{performer.country}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`font-bold text-sm ${performer.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {performer.profit >= 0 ? '+' : ''}{performer.profit.toLocaleString()} DH
                            </div>
                            <div className="text-xs text-gray-500">
                              ROI: {performer.roi.toFixed(1)}%
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};
