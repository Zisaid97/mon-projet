
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AdSpendingData } from '@/hooks/useAdSpendingData';
import { coloredNumber } from '@/utils/marketingFormatters';
import { TrendingUp, Target, DollarSign, Users } from 'lucide-react';

interface AdSpendingKpiSummaryProps {
  data: AdSpendingData[];
  title?: string;
}

export const AdSpendingKpiSummary = ({ data, title = "Résumé du jour" }: AdSpendingKpiSummaryProps) => {
  if (!data || data.length === 0) return null;

  // Calculate KPIs from the data
  const totalSpent = data.reduce((sum, item) => sum + item.amount_spent, 0);
  const totalLeads = data.reduce((sum, item) => sum + item.leads, 0);
  const totalClicks = data.reduce((sum, item) => sum + item.link_clicks, 0);
  const totalImpressions = data.reduce((sum, item) => sum + item.impressions, 0);
  
  const avgCPC = totalClicks > 0 ? totalSpent / totalClicks : 0;
  const avgCPM = totalImpressions > 0 ? (totalSpent / totalImpressions) * 1000 : 0;
  const avgCTR = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
  const costPerLead = totalLeads > 0 ? totalSpent / totalLeads : 0;

  const kpis = [
    {
      label: "Dépenses totales",
      value: totalSpent,
      format: "currency",
      icon: DollarSign,
      color: "text-green-600"
    },
    {
      label: "Total prospects",
      value: totalLeads,
      format: "number",
      icon: Users,
      color: "text-blue-600"
    },
    {
      label: "CPC moyen",
      value: avgCPC,
      format: "currency",
      icon: Target,
      color: avgCPC > 5 ? "text-red-600" : "text-gray-600"
    },
    {
      label: "CPM moyen",
      value: avgCPM,
      format: "currency",
      icon: TrendingUp,
      color: "text-purple-600"
    },
    {
      label: "CTR moyen",
      value: avgCTR,
      format: "percentage",
      icon: TrendingUp,
      color: "text-indigo-600"
    },
    {
      label: "Coût/Prospect",
      value: costPerLead,
      format: "currency",
      icon: Target,
      color: "text-orange-600"
    }
  ];

  const formatValue = (value: number, format: string) => {
    switch (format) {
      case "currency":
        return `${value.toFixed(2)}$`;
      case "percentage":
        return `${value.toFixed(2)}%`;
      default:
        return value.toString();
    }
  };

  return (
    <Card className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          📊 {title}
          <span className="text-sm font-normal text-gray-500">({data.length} campagne{data.length > 1 ? 's' : ''})</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {kpis.map((kpi, index) => {
            const Icon = kpi.icon;
            return (
              <div key={index} className="text-center p-3 bg-white rounded-lg shadow-sm border">
                <div className="flex items-center justify-center mb-2">
                  <Icon className={`h-4 w-4 ${kpi.color}`} />
                </div>
                <div className="text-xs text-gray-500 mb-1">{kpi.label}</div>
                <div className={`font-semibold ${kpi.color}`}>
                  {formatValue(kpi.value, kpi.format)}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
