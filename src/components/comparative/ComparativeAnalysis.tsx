
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useComparativeAnalysis } from "@/hooks/useComparativeAnalysis";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CalendarIcon, TrendingUp, TrendingDown, Download } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

export function ComparativeAnalysis() {
  const [periodA, setPeriodA] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
    end: new Date(new Date().getFullYear(), new Date().getMonth(), 0)
  });
  
  const [periodB, setPeriodB] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth() - 2, 1),
    end: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 0)
  });

  const { data: analysis, isLoading } = useComparativeAnalysis(periodA, periodB);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: 'MAD'
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const getVariationColor = (variation: number) => {
    if (variation > 0) return 'text-green-600 bg-green-50';
    if (variation < 0) return 'text-red-600 bg-red-50';
    return 'text-gray-600 bg-gray-50';
  };

  const getVariationIcon = (variation: number) => {
    return variation >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />;
  };

  const chartData = [
    {
      name: 'Période A',
      profit: analysis?.periodA.profit_mad || 0,
      roi: analysis?.periodA.roi_percent || 0,
    },
    {
      name: 'Période B',
      profit: analysis?.periodB.profit_mad || 0,
      roi: analysis?.periodB.roi_percent || 0,
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">📊 Analyse Comparative</h1>
        <Button variant="outline" className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Exporter CSV
        </Button>
      </div>

      {/* Sélecteurs de période */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Période A</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm">
              <CalendarIcon className="h-4 w-4" />
              {format(periodA.start, "dd MMM", { locale: fr })} - {format(periodA.end, "dd MMM yyyy", { locale: fr })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Période B</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm">
              <CalendarIcon className="h-4 w-4" />
              {format(periodB.start, "dd MMM", { locale: fr })} - {format(periodB.end, "dd MMM yyyy", { locale: fr })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cartes KPI */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Revenu</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{formatCurrency(analysis?.periodA.revenue_mad || 0)}</p>
                <p className="text-sm text-gray-600">vs {formatCurrency(analysis?.periodB.revenue_mad || 0)}</p>
              </div>
              <Badge className={getVariationColor(analysis?.variations.revenue || 0)}>
                {getVariationIcon(analysis?.variations.revenue || 0)}
                {formatPercent(analysis?.variations.revenue || 0)}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Dépenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{formatCurrency(analysis?.periodA.spend_mad || 0)}</p>
                <p className="text-sm text-gray-600">vs {formatCurrency(analysis?.periodB.spend_mad || 0)}</p>
              </div>
              <Badge className={getVariationColor(analysis?.variations.spend || 0)}>
                {getVariationIcon(analysis?.variations.spend || 0)}
                {formatPercent(analysis?.variations.spend || 0)}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Profit Net</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{formatCurrency(analysis?.periodA.profit_mad || 0)}</p>
                <p className="text-sm text-gray-600">vs {formatCurrency(analysis?.periodB.profit_mad || 0)}</p>
              </div>
              <Badge className={getVariationColor(analysis?.variations.profit || 0)}>
                {getVariationIcon(analysis?.variations.profit || 0)}
                {formatPercent(analysis?.variations.profit || 0)}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">ROI</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{(analysis?.periodA.roi_percent || 0).toFixed(1)}%</p>
                <p className="text-sm text-gray-600">vs {(analysis?.periodB.roi_percent || 0).toFixed(1)}%</p>
              </div>
              <Badge className={getVariationColor(analysis?.variations.roi || 0)}>
                {getVariationIcon(analysis?.variations.roi || 0)}
                {formatPercent(analysis?.variations.roi || 0)}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">CPL</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{formatCurrency(analysis?.periodA.cpl_mad || 0)}</p>
                <p className="text-sm text-gray-600">vs {formatCurrency(analysis?.periodB.cpl_mad || 0)}</p>
              </div>
              <Badge className={getVariationColor(-(analysis?.variations.cpl || 0))}>
                {getVariationIcon(-(analysis?.variations.cpl || 0))}
                {formatPercent(-(analysis?.variations.cpl || 0))}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">CPD</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{formatCurrency(analysis?.periodA.cpd_mad || 0)}</p>
                <p className="text-sm text-gray-600">vs {formatCurrency(analysis?.periodB.cpd_mad || 0)}</p>
              </div>
              <Badge className={getVariationColor(-(analysis?.variations.cpd || 0))}>
                {getVariationIcon(-(analysis?.variations.cpd || 0))}
                {formatPercent(-(analysis?.variations.cpd || 0))}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Profit Net - Comparaison</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Bar dataKey="profit" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>ROI - Évolution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => `${Number(value).toFixed(1)}%`} />
                <Line type="monotone" dataKey="roi" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
