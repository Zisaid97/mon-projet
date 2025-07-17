
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Download, Filter, BarChart3, PieChart as PieChartIcon, TrendingUp, Search, Calendar } from 'lucide-react';
import { SalesData } from '@/types/sales';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, ResponsiveContainer } from 'recharts';
import { SalesAnalyticsModal } from './SalesAnalyticsModal';

interface SalesAnalyticsProps {
  data: SalesData[];
  uniqueValues: {
    cities: string[];
    confirmationStatuses: string[];
    deliveryStatuses: string[];
    salesChannels: string[];
    products: string[];
    agents: string[];
  };
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff7300'];

const chartConfig = {
  value: { label: "Valeur" },
  amount: { label: "Montant" },
  count: { label: "Nombre" },
  ventes: { label: "Ventes" },
  montant: { label: "Montant" },
};

export const SalesAnalytics = ({ data, uniqueValues }: SalesAnalyticsProps) => {
  const [filters, setFilters] = useState({
    city: 'all',
    confirmationStatus: 'all',
    deliveryStatus: 'all',
    product: 'all',
    searchTerm: '',
    dateFrom: '',
    dateTo: ''
  });

  const [showModal, setShowModal] = useState(false);
  const [modalFilters, setModalFilters] = useState({
    filter1: '',
    value1: '',
    filter2: '',
    value2: ''
  });

  // Données filtrées
  const filteredData = useMemo(() => {
    return data.filter(item => {
      const matchesCity = filters.city === 'all' || item.city === filters.city;
      const matchesConfirmation = filters.confirmationStatus === 'all' || item.confirmation_status === filters.confirmationStatus;
      const matchesDelivery = filters.deliveryStatus === 'all' || item.delivery_status === filters.deliveryStatus;
      const matchesProduct = filters.product === 'all' || item.products.includes(filters.product);
      
      const matchesSearch = filters.searchTerm === '' || 
        item.customer?.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        item.city?.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        item.phone?.includes(filters.searchTerm) ||
        item.products?.toLowerCase().includes(filters.searchTerm.toLowerCase());

      let matchesDate = true;
      if (filters.dateFrom) {
        matchesDate = matchesDate && new Date(item.date) >= new Date(filters.dateFrom);
      }
      if (filters.dateTo) {
        matchesDate = matchesDate && new Date(item.date) <= new Date(filters.dateTo);
      }

      return matchesCity && matchesConfirmation && matchesDelivery && matchesProduct && matchesSearch && matchesDate;
    });
  }, [data, filters]);

  // Statistiques générales
  const stats = useMemo(() => {
    const totalSales = filteredData.length;
    const totalAmount = filteredData.reduce((sum, sale) => sum + (sale.price || 0), 0);
    const averageAmount = totalSales > 0 ? totalAmount / totalSales : 0;
    
    const deliveredCount = filteredData.filter(sale => 
      sale.delivery_status?.toLowerCase().includes('livré') || 
      sale.delivery_status?.toLowerCase().includes('delivered') ||
      sale.delivery_status?.toLowerCase().includes('confirmé')
    ).length;
    const deliveryRate = totalSales > 0 ? (deliveredCount / totalSales) * 100 : 0;

    const confirmedCount = filteredData.filter(sale => 
      sale.confirmation_status?.toLowerCase().includes('confirmed') ||
      sale.confirmation_status?.toLowerCase().includes('confirmé')
    ).length;
    const confirmationRate = totalSales > 0 ? (confirmedCount / totalSales) * 100 : 0;

    return {
      totalSales,
      totalAmount,
      averageAmount,
      deliveryRate,
      confirmationRate,
      deliveredCount,
      confirmedCount
    };
  }, [filteredData]);

  // Données pour les graphiques
  const chartData = useMemo(() => {
    // Ventes par ville (Top 10)
    const cityData = filteredData.reduce((acc, sale) => {
      const city = sale.city || 'Non renseigné';
      acc[city] = (acc[city] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topCities = Object.entries(cityData)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([city, count]) => ({
        name: city.length > 15 ? city.substring(0, 15) + '...' : city,
        value: count,
        amount: filteredData.filter(s => s.city === city).reduce((sum, s) => sum + (s.price || 0), 0)
      }));

    // Statuts de livraison
    const deliveryStatusData = filteredData.reduce((acc, sale) => {
      const status = sale.delivery_status || 'Non renseigné';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const deliveryChart = Object.entries(deliveryStatusData).map(([status, count]) => ({
      name: status.length > 20 ? status.substring(0, 20) + '...' : status,
      value: count
    }));

    // Top produits par montant
    const productData = filteredData.reduce((acc, sale) => {
      const product = sale.products || 'Non renseigné';
      if (!acc[product]) {
        acc[product] = { count: 0, amount: 0 };
      }
      acc[product].count += 1;
      acc[product].amount += (sale.price || 0);
      return acc;
    }, {} as Record<string, { count: number; amount: number }>);

    const topProducts = Object.entries(productData)
      .sort(([,a], [,b]) => b.amount - a.amount)
      .slice(0, 8)
      .map(([product, data]) => ({
        name: product.length > 25 ? product.substring(0, 25) + '...' : product,
        amount: data.amount,
        count: data.count
      }));

    // Évolution des ventes sur les 30 derniers jours
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    const evolutionData = last30Days.map(date => {
      const dayData = filteredData.filter(sale => sale.date === date);
      return {
        date: new Date(date).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' }),
        ventes: dayData.length,
        montant: dayData.reduce((sum, sale) => sum + (sale.price || 0), 0)
      };
    });

    return {
      topCities,
      deliveryChart,
      topProducts,
      evolutionData
    };
  }, [filteredData]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      city: 'all',
      confirmationStatus: 'all',
      deliveryStatus: 'all',
      product: 'all',
      searchTerm: '',
      dateFrom: '',
      dateTo: ''
    });
  };

  const exportData = () => {
    const csvHeaders = [
      'Date', 'Client', 'Ville', 'Produits', 'Prix', 'Statut Confirmation', 'Statut Livraison'
    ];

    const csvContent = [
      csvHeaders.join(','),
      ...filteredData.map(row => [
        row.date,
        `"${row.customer}"`,
        `"${row.city}"`,
        `"${row.products}"`,
        row.price,
        `"${row.confirmation_status}"`,
        `"${row.delivery_status}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `analyse_ventes_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openAnalysisModal = (filter1: string, value1: string, filter2?: string, value2?: string) => {
    const modalData = filteredData.filter(item => {
      let matches = true;
      if (filter1 && value1) {
        if (filter1 === 'city') matches = matches && item.city === value1;
        if (filter1 === 'delivery_status') matches = matches && item.delivery_status === value1;
        if (filter1 === 'confirmation_status') matches = matches && item.confirmation_status === value1;
        if (filter1 === 'products') matches = matches && item.products.includes(value1);
      }
      if (filter2 && value2) {
        if (filter2 === 'city') matches = matches && item.city === value2;
        if (filter2 === 'delivery_status') matches = matches && item.delivery_status === value2;
        if (filter2 === 'confirmation_status') matches = matches && item.confirmation_status === value2;
        if (filter2 === 'products') matches = matches && item.products.includes(value2);
      }
      return matches;
    });

    setModalFilters({
      filter1: filter1 || '',
      value1: value1 || '',
      filter2: filter2 || '',
      value2: value2 || ''
    });
    setShowModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Filtres */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtres d'analyse
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher..."
                value={filters.searchTerm}
                onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={filters.city} onValueChange={(value) => handleFilterChange('city', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Ville" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les villes</SelectItem>
                {uniqueValues.cities.slice(0, 20).map((city) => (
                  <SelectItem key={city} value={city}>{city}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filters.confirmationStatus} onValueChange={(value) => handleFilterChange('confirmationStatus', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Confirmation" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                {uniqueValues.confirmationStatuses.map((status) => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filters.deliveryStatus} onValueChange={(value) => handleFilterChange('deliveryStatus', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Livraison" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                {uniqueValues.deliveryStatuses.map((status) => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              placeholder="Date début"
            />

            <Input
              type="date"
              value={filters.dateTo}
              onChange={(e) => handleFilterChange('dateTo', e.target.value)}
              placeholder="Date fin"
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={resetFilters} variant="outline" size="sm">
              Réinitialiser
            </Button>
            <Button onClick={exportData} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exporter CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Statistiques générales */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{stats.totalSales}</div>
            <div className="text-sm text-gray-600">Total ventes</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{stats.deliveryRate.toFixed(1)}%</div>
            <div className="text-sm text-gray-600">Taux livraison</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">{stats.confirmationRate.toFixed(1)}%</div>
            <div className="text-sm text-gray-600">Taux confirmation</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">${stats.averageAmount.toFixed(2)}</div>
            <div className="text-sm text-gray-600">Montant moyen</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">${stats.totalAmount.toFixed(2)}</div>
            <div className="text-sm text-gray-600">CA total</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-indigo-600">{stats.deliveredCount}</div>
            <div className="text-sm text-gray-600">Livrées</div>
          </CardContent>
        </Card>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top villes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Top 10 - Ventes par ville
              </span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => openAnalysisModal('city', chartData.topCities[0]?.name.replace('...', '') || '')}
              >
                Analyser
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData.topCities}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45} 
                    textAnchor="end" 
                    height={80}
                    fontSize={12}
                  />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="value" fill="#0088FE" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Statuts de livraison */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <PieChartIcon className="h-5 w-5" />
                Statuts de livraison
              </span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => openAnalysisModal('delivery_status', chartData.deliveryChart[0]?.name || '')}
              >
                Analyser
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Pie
                    data={chartData.deliveryChart}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.deliveryChart.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Top produits */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Top produits par CA
              </span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => openAnalysisModal('products', chartData.topProducts[0]?.name.replace('...', '') || '')}
              >
                Analyser
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData.topProducts} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    width={120}
                    fontSize={11}
                  />
                  <ChartTooltip 
                    content={<ChartTooltipContent />}
                    formatter={(value) => [`$${value}`, 'Montant']}
                  />
                  <Bar dataKey="amount" fill="#00C49F" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Évolution des ventes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Évolution sur 30 jours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData.evolutionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" fontSize={11} />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line 
                    yAxisId="left" 
                    type="monotone" 
                    dataKey="ventes" 
                    stroke="#8884d8" 
                    strokeWidth={2}
                    name="Nb ventes"
                  />
                  <Line 
                    yAxisId="right" 
                    type="monotone" 
                    dataKey="montant" 
                    stroke="#82ca9d" 
                    strokeWidth={2}
                    name="Montant ($)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Modal d'analyse détaillée */}
      <SalesAnalyticsModal
        open={showModal}
        onClose={() => setShowModal(false)}
        data={filteredData}
        filters={modalFilters}
      />
    </div>
  );
};
