
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Users, CheckCircle, Truck, AlertTriangle } from 'lucide-react';
import { SalesData } from '@/types/sales';

interface SalesStatsProps {
  data: SalesData[];
}

export const SalesStats = ({ data }: SalesStatsProps) => {
  const totalSales = data.length;
  const totalRevenue = data.reduce((sum, sale) => sum + sale.price, 0);
  const totalDeposit = data.reduce((sum, sale) => sum + sale.deposit, 0);
  
  const confirmed = data.filter(sale => 
    sale.confirmation_status?.toLowerCase().includes('confirmé') || 
    sale.confirmation_status?.toLowerCase().includes('confirm')
  ).length;
  
  const delivered = data.filter(sale => 
    sale.delivery_status?.toLowerCase().includes('livré') || 
    sale.delivery_status?.toLowerCase().includes('deliver')
  ).length;
  
  const failed = data.filter(sale => 
    sale.confirmation_status?.toLowerCase().includes('échec') || 
    sale.confirmation_status?.toLowerCase().includes('failed') ||
    sale.delivery_status?.toLowerCase().includes('échec') || 
    sale.delivery_status?.toLowerCase().includes('failed')
  ).length;

  const confirmedPercentage = totalSales > 0 ? (confirmed / totalSales) * 100 : 0;
  const deliveredPercentage = totalSales > 0 ? (delivered / totalSales) * 100 : 0;
  const failedPercentage = totalSales > 0 ? (failed / totalSales) * 100 : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Chiffre d'affaires total</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">${totalRevenue.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">
            Acomptes: ${totalDeposit.toFixed(2)}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total des ventes</CardTitle>
          <Users className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalSales}</div>
          <p className="text-xs text-muted-foreground">
            {totalSales === 0 ? 'Aucune vente' : totalSales === 1 ? 'vente' : 'ventes'}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Ventes confirmées</CardTitle>
          <CheckCircle className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">{confirmed}</div>
          <p className="text-xs text-muted-foreground">
            {confirmedPercentage.toFixed(1)}% du total
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Ventes livrées</CardTitle>
          <Truck className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{delivered}</div>
          <p className="text-xs text-muted-foreground">
            {deliveredPercentage.toFixed(1)}% du total
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
