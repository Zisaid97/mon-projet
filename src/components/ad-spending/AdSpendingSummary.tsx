
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, AlertTriangle, Target } from 'lucide-react';
import { useAdSpendingData } from '@/hooks/useAdSpendingData';
import { coloredNumber } from '@/utils/marketingFormatters';

export const AdSpendingSummary = () => {
  const { data, loading } = useAdSpendingData();

  const summary = useMemo(() => {
    if (data.length === 0) return null;

    const totalSpent = data.reduce((sum, row) => sum + row.amount_spent, 0);
    const totalImpressions = data.reduce((sum, row) => sum + row.impressions, 0);
    const totalClicks = data.reduce((sum, row) => sum + row.link_clicks, 0);
    const totalLeads = data.reduce((sum, row) => sum + row.leads, 0);
    
    const avgCPC = totalClicks > 0 ? totalSpent / totalClicks : 0;
    const avgCPM = totalImpressions > 0 ? (totalSpent / totalImpressions) * 1000 : 0;
    const avgCTR = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
    const avgLPRate = totalClicks > 0 ? (totalLeads / totalClicks) * 100 : 0;

    // Alertes
    const alerts = [];
    const highCPCCampaigns = [...new Set(data.filter(row => row.cpc > 2).map(row => row.campaign_name))];
    const lowCTRCampaigns = data.reduce((acc, row) => {
      const ctr = row.impressions > 0 ? (row.link_clicks / row.impressions) * 100 : 0;
      if (ctr < 1 && ctr > 0) {
        acc.add(row.campaign_name);
      }
      return acc;
    }, new Set<string>());

    if (highCPCCampaigns.length > 0) {
      alerts.push({
        type: 'warning',
        message: `${highCPCCampaigns.length} campagne(s) avec CPC élevé (>2$)`,
        campaigns: highCPCCampaigns.slice(0, 3)
      });
    }

    if (lowCTRCampaigns.size > 0) {
      alerts.push({
        type: 'info',
        message: `${lowCTRCampaigns.size} campagne(s) avec CTR faible (<1%)`,
        campaigns: Array.from(lowCTRCampaigns).slice(0, 3)
      });
    }

    // Performance par mois
    const monthlyData = data.reduce((acc, row) => {
      const month = new Date(row.date).toISOString().slice(0, 7); // YYYY-MM
      if (!acc[month]) {
        acc[month] = { spent: 0, clicks: 0, impressions: 0, leads: 0 };
      }
      acc[month].spent += row.amount_spent;
      acc[month].clicks += row.link_clicks;
      acc[month].impressions += row.impressions;
      acc[month].leads += row.leads;
      return acc;
    }, {} as Record<string, any>);

    const months = Object.keys(monthlyData).sort();
    const currentMonth = months[months.length - 1];
    const previousMonth = months[months.length - 2];

    let trend = null;
    if (currentMonth && previousMonth) {
      const currentSpent = monthlyData[currentMonth].spent;
      const previousSpent = monthlyData[previousMonth].spent;
      const change = ((currentSpent - previousSpent) / previousSpent) * 100;
      trend = { change, direction: change > 0 ? 'up' : 'down' };
    }

    return {
      totalSpent,
      totalImpressions,
      totalClicks,
      totalLeads,
      avgCPC,
      avgCPM,
      avgCTR,
      avgLPRate,
      alerts,
      trend,
      campaignCount: new Set(data.map(row => row.campaign_name)).size,
      accountCount: new Set(data.map(row => row.account_name)).size,
      dateRange: {
        start: new Date(Math.min(...data.map(row => new Date(row.date).getTime()))).toLocaleDateString('fr-FR'),
        end: new Date(Math.max(...data.map(row => new Date(row.date).getTime()))).toLocaleDateString('fr-FR')
      }
    };
  }, [data]);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </CardContent>
      </Card>
    );
  }

  if (!summary) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <p className="text-gray-500">Aucune donnée disponible pour le résumé</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPIs principaux */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total dépensé</p>
                <p className="text-2xl font-bold text-gray-900">
                  {coloredNumber(summary.totalSpent, 2, 'success')}$
                </p>
                {summary.trend && (
                  <p className={`text-sm ${summary.trend.direction === 'up' ? 'text-red-600' : 'text-green-600'}`}>
                    {summary.trend.direction === 'up' ? '↗' : '↘'} {Math.abs(summary.trend.change).toFixed(1)}% vs mois précédent
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total clics</p>
                <p className="text-2xl font-bold text-gray-900">
                  {coloredNumber(summary.totalClicks, 0, 'info')}
                </p>
                <p className="text-sm text-gray-500">
                  CTR moyen: {coloredNumber(summary.avgCTR, 2, 'muted')}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">CPC moyen</p>
                <p className="text-2xl font-bold text-gray-900">
                  {coloredNumber(summary.avgCPC, 2, summary.avgCPC > 2 ? 'danger' : 'plain')}$
                </p>
                <p className="text-sm text-gray-500">
                  CPM: {coloredNumber(summary.avgCPM, 2, 'muted')}$
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Target className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total prospects</p>
                <p className="text-2xl font-bold text-gray-900">
                  {coloredNumber(summary.totalLeads, 0, 'info')}
                </p>
                <p className="text-sm text-gray-500">
                  LP Rate: {coloredNumber(summary.avgLPRate, 2, 'muted')}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Informations générales */}
      <Card>
        <CardHeader>
          <CardTitle>📊 Vue d'ensemble</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Période analysée</h4>
              <p className="text-gray-600">Du {summary.dateRange.start} au {summary.dateRange.end}</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Campagnes actives</h4>
              <p className="text-gray-600">{summary.campaignCount} campagnes sur {summary.accountCount} compte(s)</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Impressions totales</h4>
              <p className="text-gray-600">{summary.totalImpressions.toLocaleString('fr-FR')}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alertes */}
      {summary.alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Alertes et recommandations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {summary.alerts.map((alert, index) => (
                <div key={index} className={`p-4 rounded-lg border-l-4 ${
                  alert.type === 'warning' 
                    ? 'bg-orange-50 border-orange-400' 
                    : 'bg-blue-50 border-blue-400'
                }`}>
                  <p className="font-medium text-gray-900">{alert.message}</p>
                  {alert.campaigns.length > 0 && (
                    <p className="text-sm text-gray-600 mt-1">
                      Exemples: {alert.campaigns.join(', ')}
                      {alert.campaigns.length < new Set(data.map(row => row.campaign_name)).size && '...'}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
