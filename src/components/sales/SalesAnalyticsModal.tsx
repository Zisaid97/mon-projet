
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Download, X, AlertCircle } from 'lucide-react';
import { SalesData } from '@/types/sales';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, ResponsiveContainer } from 'recharts';

interface SalesAnalyticsModalProps {
  open: boolean;
  onClose: () => void;
  data: SalesData[];
  filters: {
    filter1: string;
    value1: string;
    filter2: string;
    value2: string;
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

export const SalesAnalyticsModal = ({ open, onClose, data, filters }: SalesAnalyticsModalProps) => {
  console.log('=== MODAL ANALYTICS ===');
  console.log('Modal open:', open);
  console.log('Data received:', data);
  console.log('Data length:', data?.length || 0);
  console.log('Filters:', filters);

  // Si aucune donnée
  if (!data || data.length === 0) {
    console.log('No data available for modal');
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Aucune donnée trouvée</span>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-8">
            <AlertCircle className="h-16 w-16 text-gray-400" />
            <div className="text-center">
              <p className="text-lg font-medium text-gray-900 mb-2">Aucun résultat</p>
              <p className="text-gray-600">
                Aucune vente ne correspond aux filtres sélectionnés
              </p>
              {filters.filter1 && (
                <div className="mt-2 p-3 bg-gray-50 rounded-lg text-sm">
                  <p><strong>{filters.filter1}:</strong> {filters.value1}</p>
                  {filters.filter2 && filters.value2 && (
                    <p><strong>{filters.filter2}:</strong> {filters.value2}</p>
                  )}
                </div>
              )}
            </div>
            <Button onClick={onClose}>Fermer</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Calculs des statistiques
  const totalSales = data.length;
  const totalAmount = data.reduce((sum, sale) => sum + (sale.price || 0), 0);
  const averageAmount = totalSales > 0 ? totalAmount / totalSales : 0;
  
  const deliveredCount = data.filter(sale => 
    sale.delivery_status?.toLowerCase().includes('livré') || 
    sale.delivery_status?.toLowerCase().includes('delivered') ||
    sale.delivery_status?.toLowerCase().includes('confirmé')
  ).length;
  const deliveryRate = totalSales > 0 ? (deliveredCount / totalSales) * 100 : 0;

  const uniqueProducts = new Set(data.map(sale => sale.products)).size;

  // Données pour le graphique des villes
  const cityData = data.reduce((acc, sale) => {
    const city = sale.city || 'Non renseigné';
    acc[city] = (acc[city] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const cityChartData = Object.entries(cityData).map(([city, count]) => ({
    name: city.length > 15 ? city.substring(0, 15) + '...' : city,
    value: count,
    amount: data.filter(s => s.city === city).reduce((sum, s) => sum + (s.price || 0), 0)
  }));

  // Données pour les statuts
  const statusData = data.reduce((acc, sale) => {
    const status = sale.delivery_status || 'Non renseigné';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const statusChartData = Object.entries(statusData).map(([status, count]) => ({
    name: status.length > 20 ? status.substring(0, 20) + '...' : status,
    value: count
  }));

  // Données des produits
  const productData = data.reduce((acc, sale) => {
    const product = sale.products || 'Non renseigné';
    if (!acc[product]) {
      acc[product] = { count: 0, amount: 0 };
    }
    acc[product].count += 1;
    acc[product].amount += (sale.price || 0);
    return acc;
  }, {} as Record<string, { count: number; amount: number }>);

  const productChartData = Object.entries(productData)
    .map(([product, data]) => ({
      name: product.length > 20 ? product.substring(0, 20) + '...' : product,
      amount: data.amount,
      count: data.count
    }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 10);

  // Évolution sur 7 jours
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toISOString().split('T')[0];
  }).reverse();

  const evolutionData = last7Days.map(date => {
    const dayData = data.filter(sale => sale.date === date);
    return {
      date: new Date(date).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' }),
      ventes: dayData.length,
      montant: dayData.reduce((sum, sale) => sum + (sale.price || 0), 0)
    };
  });

  const handleExport = () => {
    const csvContent = [
      'Date,Ventes,Montant',
      ...evolutionData.map(item => `${item.date},${item.ventes},${item.montant}`)
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

  console.log('Rendering modal with data:', totalSales, 'sales');

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Analyse des données de ventes</span>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Résumé des filtres */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Filtres appliqués</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <strong>{filters.filter1}:</strong> {filters.value1}
                {filters.filter2 && filters.value2 && (
                  <> • <strong>{filters.filter2}:</strong> {filters.value2}</>
                )}
              </p>
              <p className="text-xs text-green-600 mt-1">
                ✅ {totalSales} vente(s) analysée(s)
              </p>
            </CardContent>
          </Card>

          {/* Statistiques générales */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="text-2xl font-bold text-blue-600">{totalSales}</div>
                <div className="text-sm text-gray-600">Total des ventes</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="text-2xl font-bold text-green-600">{deliveryRate.toFixed(1)}%</div>
                <div className="text-sm text-gray-600">Taux de livraison</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="text-2xl font-bold text-purple-600">${averageAmount.toFixed(2)}</div>
                <div className="text-sm text-gray-600">Montant moyen</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="text-2xl font-bold text-orange-600">{uniqueProducts}</div>
                <div className="text-sm text-gray-600">Produits différents</div>
              </CardContent>
            </Card>
          </div>

          {/* Graphiques */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Graphique des villes */}
            {cityChartData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Ventes par ville</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Pie
                          data={cityChartData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {cityChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            )}

            {/* Graphique des statuts */}
            {statusChartData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Statuts de livraison</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={statusChartData}>
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
                        <Bar dataKey="value" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            )}

            {/* Graphique des montants par produit */}
            {productChartData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Top 10 - Montants par produit</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={productChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="name" 
                          angle={-45} 
                          textAnchor="end" 
                          height={80}
                          fontSize={12}
                        />
                        <YAxis />
                        <ChartTooltip 
                          content={<ChartTooltipContent />}
                          formatter={(value, name) => [
                            name === 'amount' ? `$${value}` : value, 
                            name === 'amount' ? 'Montant' : 'Quantité'
                          ]} 
                        />
                        <Bar dataKey="amount" fill="#82ca9d" />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            )}

            {/* Évolution sur 7 jours */}
            <Card>
              <CardHeader>
                <CardTitle>Évolution sur 7 jours</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={evolutionData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
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

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Exporter CSV
            </Button>
            <Button onClick={onClose}>
              Fermer
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
