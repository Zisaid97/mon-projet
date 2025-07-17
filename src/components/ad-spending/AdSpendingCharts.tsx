
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { useAdSpendingData } from '@/hooks/useAdSpendingData';

export const AdSpendingCharts = () => {
  const { data, loading } = useAdSpendingData();

  // Données pour le graphique linéaire des dépenses par jour
  const dailySpendingData = useMemo(() => {
    const grouped = data.reduce((acc, row) => {
      const date = new Date(row.date).toLocaleDateString('fr-FR');
      if (!acc[date]) {
        acc[date] = { date, total_spent: 0, total_clicks: 0, total_impressions: 0 };
      }
      acc[date].total_spent += row.amount_spent;
      acc[date].total_clicks += row.link_clicks;
      acc[date].total_impressions += row.impressions;
      return acc;
    }, {} as Record<string, any>);

    return Object.values(grouped).sort((a: any, b: any) => 
      new Date(a.date.split('/').reverse().join('-')).getTime() - 
      new Date(b.date.split('/').reverse().join('-')).getTime()
    );
  }, [data]);

  // Données pour le camembert des campagnes les plus dépensières
  const campaignSpendingData = useMemo(() => {
    const grouped = data.reduce((acc, row) => {
      if (!acc[row.campaign_name]) {
        acc[row.campaign_name] = { name: row.campaign_name, value: 0 };
      }
      acc[row.campaign_name].value += row.amount_spent;
      return acc;
    }, {} as Record<string, any>);

    return Object.values(grouped)
      .sort((a: any, b: any) => b.value - a.value)
      .slice(0, 8); // Top 8 campagnes
  }, [data]);

  // Données pour l'histogramme des clics par campagne
  const campaignClicksData = useMemo(() => {
    const grouped = data.reduce((acc, row) => {
      if (!acc[row.campaign_name]) {
        acc[row.campaign_name] = { 
          name: row.campaign_name.length > 20 ? row.campaign_name.substring(0, 20) + '...' : row.campaign_name, 
          clicks: 0, 
          leads: 0 
        };
      }
      acc[row.campaign_name].clicks += row.link_clicks;
      acc[row.campaign_name].leads += row.leads;
      return acc;
    }, {} as Record<string, any>);

    return Object.values(grouped)
      .sort((a: any, b: any) => b.clicks - a.clicks)
      .slice(0, 10); // Top 10 campagnes
  }, [data]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff7c7c'];

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </CardContent>
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <p className="text-gray-500">Aucune donnée disponible pour les graphiques</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Graphique linéaire des dépenses par jour */}
      <Card>
        <CardHeader>
          <CardTitle>📈 Évolution des dépenses quotidiennes</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailySpendingData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value: any) => [`${value.toFixed(2)}$`, 'Dépenses']} />
              <Legend />
              <Line type="monotone" dataKey="total_spent" stroke="#8884d8" strokeWidth={2} name="Dépenses ($)" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Camembert des campagnes les plus dépensières */}
        <Card>
          <CardHeader>
            <CardTitle>🥧 Top campagnes par dépenses</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={campaignSpendingData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${percent > 5 ? name.substring(0, 15) + '...' : ''} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {campaignSpendingData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => [`${value.toFixed(2)}$`, 'Dépenses']} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Histogramme des clics par campagne */}
        <Card>
          <CardHeader>
            <CardTitle>📊 Top campagnes par clics</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={campaignClicksData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip />
                <Legend />
                <Bar dataKey="clicks" fill="#8884d8" name="Clics" />
                <Bar dataKey="leads" fill="#82ca9d" name="Prospects" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Graphique combiné des performances */}
      <Card>
        <CardHeader>
          <CardTitle>📊 Performance quotidienne combinée</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={dailySpendingData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="total_spent" stroke="#8884d8" strokeWidth={2} name="Dépenses ($)" />
              <Line yAxisId="right" type="monotone" dataKey="total_clicks" stroke="#82ca9d" strokeWidth={2} name="Clics" />
              <Line yAxisId="right" type="monotone" dataKey="total_impressions" stroke="#ffc658" strokeWidth={2} name="Impressions (/1000)" 
                    dot={false} strokeDasharray="5 5" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
