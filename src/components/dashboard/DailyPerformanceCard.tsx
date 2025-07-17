
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useDailyPerformance, getPerformanceColor, getKpiColor } from "@/hooks/useDailyPerformance";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { TrendingUp, TrendingDown, BarChart3 } from "lucide-react";

interface DailyPerformanceCardProps {
  selectedDate?: Date;
}

export function DailyPerformanceCard({ selectedDate }: DailyPerformanceCardProps) {
  const { data: dailyPerformance, isLoading } = useDailyPerformance(
    selectedDate || new Date(),
    selectedDate || new Date()
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>📊 Performance Quotidienne</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded"></div>
            <div className="grid grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const todayPerformance = dailyPerformance?.[0];

  if (!todayPerformance) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>📊 Performance Quotidienne</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Aucune donnée de performance</p>
            <p className="text-sm text-gray-500">Les données seront calculées automatiquement</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          📊 Performance du {format(new Date(todayPerformance.date), "dd MMM yyyy", { locale: fr })}
          <Badge className={getPerformanceColor(todayPerformance.performance_label)}>
            {todayPerformance.performance_label}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 border rounded-lg">
            <div className="flex items-center justify-center gap-2 mb-2">
              <TrendingDown className="h-4 w-4" />
              <span className="text-sm font-medium text-gray-600">CPD</span>
            </div>
            <p className={`text-xl font-bold ${getKpiColor('cpd', todayPerformance.cpd_usd)}`}>
              {todayPerformance.cpd_usd.toFixed(2)}$
            </p>
            <div className="text-xs mt-1">
              🟢 &lt;10 🟠 10-15 🔴 &gt;15
            </div>
          </div>

          <div className="text-center p-4 border rounded-lg">
            <div className="flex items-center justify-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm font-medium text-gray-600">ROI</span>
            </div>
            <p className={`text-xl font-bold ${getKpiColor('roi', todayPerformance.roi_percent)}`}>
              {todayPerformance.roi_percent.toFixed(1)}%
            </p>
            <div className="text-xs mt-1">
              🟢 ≥30% 🟠 15-30% 🔴 &lt;15%
            </div>
          </div>

          <div className="text-center p-4 border rounded-lg">
            <div className="flex items-center justify-center gap-2 mb-2">
              <BarChart3 className="h-4 w-4" />
              <span className="text-sm font-medium text-gray-600">Taux Livraison</span>
            </div>
            <p className={`text-xl font-bold ${getKpiColor('delivery_rate', todayPerformance.delivery_rate)}`}>
              {todayPerformance.delivery_rate.toFixed(1)}%
            </p>
            <div className="text-xs mt-1">
              🟢 ≥15% 🟠 10-15% 🔴 &lt;10%
            </div>
          </div>
        </div>

        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Score Global:</span>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold">
                {todayPerformance.score > 0 ? '+' : ''}{todayPerformance.score}
              </span>
              <Badge className={getPerformanceColor(todayPerformance.performance_label)}>
                {todayPerformance.performance_label}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
