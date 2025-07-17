
import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { SalesData } from '@/types/sales';
import { TrendingUp, Users, CheckCircle, Truck } from 'lucide-react';
import { DayActions } from './DayActions';
import { ExtendedSalesTable } from './ExtendedSalesTable';
import { useToast } from '@/hooks/use-toast';

interface SalesDailyViewProps {
  data: SalesData[];
  onDeleteDay?: (date: string) => void;
}

export const SalesDailyView = ({ data, onDeleteDay }: SalesDailyViewProps) => {
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const groupedData = useMemo(() => {
    const groups: { [key: string]: SalesData[] } = {};
    
    data.forEach(sale => {
      const date = sale.date;
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(sale);
    });

    const sortedDates = Object.keys(groups).sort((a, b) => 
      new Date(b).getTime() - new Date(a).getTime()
    );

    return sortedDates.map(date => ({
      date,
      sales: groups[date]
    }));
  }, [data]);

  const getDayStats = (sales: SalesData[]) => {
    const totalSales = sales.length;
    const totalRevenue = sales.reduce((sum, sale) => sum + sale.price, 0);
    const confirmed = sales.filter(sale => 
      sale.confirmation_status?.toLowerCase().includes('confirmé') || 
      sale.confirmation_status?.toLowerCase().includes('confirm')
    ).length;
    const delivered = sales.filter(sale => 
      sale.delivery_status?.toLowerCase().includes('livré') || 
      sale.delivery_status?.toLowerCase().includes('deliver')
    ).length;

    return { totalSales, totalRevenue, confirmed, delivered };
  };

  const toggleDayExpansion = (date: string) => {
    const newExpanded = new Set(expandedDays);
    if (newExpanded.has(date)) {
      newExpanded.delete(date);
    } else {
      newExpanded.add(date);
    }
    setExpandedDays(newExpanded);
  };

  const handleDeleteDay = (date: string) => {
    if (onDeleteDay) {
      onDeleteDay(date);
      toast({
        title: "Jour supprimé",
        description: `Toutes les ventes du ${new Date(date).toLocaleDateString('fr-FR')} ont été supprimées.`,
      });
    }
  };

  if (groupedData.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
        <h3 className="text-lg font-medium mb-2">Aucune vente trouvée</h3>
        <p>Importez d'abord un fichier de ventes pour voir les données groupées par jour.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {groupedData.map(({ date, sales }) => {
        const stats = getDayStats(sales);
        const isExpanded = expandedDays.has(date);
        
        return (
          <Card key={date} className="mb-4">
            <CardHeader className="pb-3">
              <DayActions
                date={date}
                salesCount={stats.totalSales}
                isExpanded={isExpanded}
                onToggleExpanded={() => toggleDayExpansion(date)}
                onDeleteDay={() => handleDeleteDay(date)}
              />

              {/* Statistiques du jour */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="text-sm text-gray-500">Chiffre d'affaires</div>
                  <div className="font-semibold text-green-600">${stats.totalRevenue.toFixed(2)}</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <Users className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="text-sm text-gray-500">Total ventes</div>
                  <div className="font-semibold">{stats.totalSales}</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <CheckCircle className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="text-sm text-gray-500">Confirmées</div>
                  <div className="font-semibold text-blue-600">{stats.confirmed}</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <Truck className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="text-sm text-gray-500">Livrées</div>
                  <div className="font-semibold text-green-600">{stats.delivered}</div>
                </div>
              </div>
            </CardHeader>

            {isExpanded && (
              <CardContent>
                <ExtendedSalesTable sales={sales} />
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
};
