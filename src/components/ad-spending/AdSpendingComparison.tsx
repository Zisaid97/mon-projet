
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AdSpendingData } from '@/hooks/useAdSpendingData';
import { Download, TrendingUp, TrendingDown } from 'lucide-react';

interface AdSpendingComparisonProps {
  data: AdSpendingData[];
}

interface DayMetrics {
  date: string;
  totalSpent: number;
  totalLeads: number;
  totalClicks: number;
  totalImpressions: number;
  avgCPC: number;
  avgCTR: number;
}

export const AdSpendingComparison = ({ data }: AdSpendingComparisonProps) => {
  const [date1, setDate1] = useState<string>('');
  const [date2, setDate2] = useState<string>('');

  // Calculer les métriques par jour
  const dayMetrics = useMemo(() => {
    const metrics: { [key: string]: DayMetrics } = {};
    
    data.forEach(item => {
      const date = item.date;
      if (!metrics[date]) {
        metrics[date] = {
          date,
          totalSpent: 0,
          totalLeads: 0,
          totalClicks: 0,
          totalImpressions: 0,
          avgCPC: 0,
          avgCTR: 0
        };
      }
      
      metrics[date].totalSpent += item.amount_spent;
      metrics[date].totalLeads += item.leads;
      metrics[date].totalClicks += item.link_clicks;
      metrics[date].totalImpressions += item.impressions;
    });
    
    // Calculer les moyennes
    Object.values(metrics).forEach(metric => {
      metric.avgCPC = metric.totalClicks > 0 ? metric.totalSpent / metric.totalClicks : 0;
      metric.avgCTR = metric.totalImpressions > 0 ? (metric.totalClicks / metric.totalImpressions) * 100 : 0;
    });
    
    return metrics;
  }, [data]);

  const availableDates = Object.keys(dayMetrics).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  const comparison = useMemo(() => {
    if (!date1 || !date2 || !dayMetrics[date1] || !dayMetrics[date2]) return null;

    const metrics1 = dayMetrics[date1];
    const metrics2 = dayMetrics[date2];

    const calculateVariation = (val1: number, val2: number, isPercentage = false) => {
      if (val1 === 0 && val2 === 0) return { value: 0, text: '0%', positive: true };
      if (val1 === 0) return { value: Infinity, text: '+∞', positive: true };
      
      const variation = ((val2 - val1) / val1) * 100;
      const isPositive = variation >= 0;
      
      if (isPercentage) {
        // Pour les pourcentages, afficher la différence en points
        const diff = val2 - val1;
        return {
          value: variation,
          text: `${diff >= 0 ? '+' : ''}${diff.toFixed(2)} pts`,
          positive: diff >= 0
        };
      }
      
      return {
        value: variation,
        text: `${isPositive ? '+' : ''}${variation.toFixed(1)}%`,
        positive: isPositive
      };
    };

    return {
      spent: calculateVariation(metrics1.totalSpent, metrics2.totalSpent),
      leads: calculateVariation(metrics1.totalLeads, metrics2.totalLeads),
      cpc: calculateVariation(metrics1.avgCPC, metrics2.avgCPC),
      ctr: calculateVariation(metrics1.avgCTR, metrics2.avgCTR, true)
    };
  }, [date1, date2, dayMetrics]);

  const exportComparison = () => {
    if (!comparison || !dayMetrics[date1] || !dayMetrics[date2]) return;

    const metrics1 = dayMetrics[date1];
    const metrics2 = dayMetrics[date2];

    const csvContent = [
      ['Indicateur', `Date 1 (${new Date(date1).toLocaleDateString('fr-FR')})`, `Date 2 (${new Date(date2).toLocaleDateString('fr-FR')})`, 'Variation'],
      ['Dépenses ($)', metrics1.totalSpent.toFixed(2), metrics2.totalSpent.toFixed(2), comparison.spent.text],
      ['Prospects', metrics1.totalLeads.toString(), metrics2.totalLeads.toString(), comparison.leads.text],
      ['CPC ($)', metrics1.avgCPC.toFixed(2), metrics2.avgCPC.toFixed(2), comparison.cpc.text],
      ['CTR (%)', metrics1.avgCTR.toFixed(2), metrics2.avgCTR.toFixed(2), comparison.ctr.text]
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `comparaison-${date1}-vs-${date2}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            📊 Comparer les performances
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Date 1</label>
              <Select value={date1} onValueChange={setDate1}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir une date" />
                </SelectTrigger>
                <SelectContent>
                  {availableDates.map(date => (
                    <SelectItem key={`date1-${date}`} value={date}>
                      {new Date(date).toLocaleDateString('fr-FR')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Date 2</label>
              <Select value={date2} onValueChange={setDate2}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir une date" />
                </SelectTrigger>
                <SelectContent>
                  {availableDates.map(date => (
                    <SelectItem key={`date2-${date}`} value={date}>
                      {new Date(date).toLocaleDateString('fr-FR')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {comparison && dayMetrics[date1] && dayMetrics[date2] && (
            <div className="mt-6">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-200">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-200 px-4 py-2 text-left">🔍 Indicateur</th>
                      <th className="border border-gray-200 px-4 py-2 text-center">
                        Date 1<br />
                        <span className="text-sm text-gray-500">
                          {new Date(date1).toLocaleDateString('fr-FR')}
                        </span>
                      </th>
                      <th className="border border-gray-200 px-4 py-2 text-center">
                        Date 2<br />
                        <span className="text-sm text-gray-500">
                          {new Date(date2).toLocaleDateString('fr-FR')}
                        </span>
                      </th>
                      <th className="border border-gray-200 px-4 py-2 text-center">Variation</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-200 px-4 py-2 font-medium">Dépenses ($)</td>
                      <td className="border border-gray-200 px-4 py-2 text-center">
                        {dayMetrics[date1].totalSpent.toFixed(2)}
                      </td>
                      <td className="border border-gray-200 px-4 py-2 text-center">
                        {dayMetrics[date2].totalSpent.toFixed(2)}
                      </td>
                      <td className={`border border-gray-200 px-4 py-2 text-center font-semibold flex items-center justify-center gap-1 ${
                        comparison.spent.positive ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {comparison.spent.positive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                        {comparison.spent.text}
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-gray-200 px-4 py-2 font-medium">Prospects</td>
                      <td className="border border-gray-200 px-4 py-2 text-center">
                        {dayMetrics[date1].totalLeads}
                      </td>
                      <td className="border border-gray-200 px-4 py-2 text-center">
                        {dayMetrics[date2].totalLeads}
                      </td>
                      <td className={`border border-gray-200 px-4 py-2 text-center font-semibold flex items-center justify-center gap-1 ${
                        comparison.leads.positive ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {comparison.leads.positive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                        {comparison.leads.text}
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-gray-200 px-4 py-2 font-medium">CPC ($)</td>
                      <td className="border border-gray-200 px-4 py-2 text-center">
                        {dayMetrics[date1].avgCPC.toFixed(2)}
                      </td>
                      <td className="border border-gray-200 px-4 py-2 text-center">
                        {dayMetrics[date2].avgCPC.toFixed(2)}
                      </td>
                      <td className={`border border-gray-200 px-4 py-2 text-center font-semibold flex items-center justify-center gap-1 ${
                        comparison.cpc.positive ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {comparison.cpc.positive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                        {comparison.cpc.text}
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-gray-200 px-4 py-2 font-medium">CTR (%)</td>
                      <td className="border border-gray-200 px-4 py-2 text-center">
                        {dayMetrics[date1].avgCTR.toFixed(2)}%
                      </td>
                      <td className="border border-gray-200 px-4 py-2 text-center">
                        {dayMetrics[date2].avgCTR.toFixed(2)}%
                      </td>
                      <td className={`border border-gray-200 px-4 py-2 text-center font-semibold flex items-center justify-center gap-1 ${
                        comparison.ctr.positive ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {comparison.ctr.positive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                        {comparison.ctr.text}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end mt-4">
                <Button onClick={exportComparison} variant="outline" className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Exporter comparaison CSV
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
