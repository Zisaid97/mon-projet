
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, startOfWeek, endOfWeek, eachWeekOfInterval, startOfMonth, endOfMonth } from 'date-fns';
import { fr } from 'date-fns/locale';

interface WeeklyProfitChartProps {
  monthData: Array<{
    date: string;
    spend_usd: number;
    leads: number;
    deliveries: number;
    margin_per_order: number;
  }>;
  exchangeRate: number;
}

export function WeeklyProfitChart({ monthData, exchangeRate }: WeeklyProfitChartProps) {
  // Calculer les données par semaine
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  
  const weeks = eachWeekOfInterval({
    start: monthStart,
    end: monthEnd
  }, { weekStartsOn: 1 }); // Commencer par lundi

  const weeklyData = weeks.map(weekStart => {
    const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
    const weekNumber = format(weekStart, 'w', { locale: fr });
    
    // Filtrer les données de cette semaine
    const weekData = monthData.filter(item => {
      const itemDate = new Date(item.date);
      return itemDate >= weekStart && itemDate <= weekEnd;
    });
    
    // Calculer les totaux de la semaine
    const totalSpendUSD = weekData.reduce((sum, item) => sum + (item.spend_usd || 0), 0);
    const totalSpendMAD = totalSpendUSD * exchangeRate;
    const totalDeliveries = weekData.reduce((sum, item) => sum + (item.deliveries || 0), 0);
    const totalRevenue = totalDeliveries * 150; // 150 DH par commande
    const netProfit = totalRevenue - totalSpendMAD;
    
    return {
      week: `S${weekNumber}`,
      weekRange: `${format(weekStart, 'dd/MM', { locale: fr })} - ${format(weekEnd, 'dd/MM', { locale: fr })}`,
      netProfit: netProfit,
      revenue: totalRevenue,
      expenses: totalSpendMAD
    };
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-800">
          📈 Évolution des bénéfices par semaine
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div style={{ width: '100%', height: '300px' }}>
          <ResponsiveContainer>
            <LineChart data={weeklyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="week"
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `${value.toFixed(0)} DH`}
              />
              <Tooltip 
                formatter={(value: number, name: string) => {
                  const formattedValue = `${value.toFixed(2)} DH`;
                  const labelMap: { [key: string]: string } = {
                    'netProfit': 'Bénéfice net',
                    'revenue': 'Chiffre d\'affaires',
                    'expenses': 'Dépenses'
                  };
                  return [formattedValue, labelMap[name] || name];
                }}
                labelFormatter={(label, payload) => {
                  const data = payload?.[0]?.payload;
                  return data ? `${label} (${data.weekRange})` : label;
                }}
              />
              <Line 
                type="monotone" 
                dataKey="netProfit" 
                stroke="#10b981" 
                strokeWidth={3}
                name="netProfit"
              />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#3b82f6" 
                strokeWidth={2}
                strokeDasharray="5 5"
                name="revenue"
              />
              <Line 
                type="monotone" 
                dataKey="expenses" 
                stroke="#ef4444" 
                strokeWidth={2}
                strokeDasharray="3 3"
                name="expenses"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center gap-6 mt-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-green-500"></div>
            <span>Bénéfice net</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-blue-500 border-dashed"></div>
            <span>Chiffre d'affaires</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-red-500 border-dashed"></div>
            <span>Dépenses</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
