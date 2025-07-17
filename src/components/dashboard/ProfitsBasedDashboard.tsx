
import { useState } from "react";
import { useProfitsDashboardStats } from "@/hooks/useProfitsDashboardStats";
import { KpiCard } from "./KpiCard";
import { TrendingUp, TrendingDown, BarChart, ArrowUp, Calendar } from 'lucide-react';
import { NetProfitChartFromProfits } from './NetProfitChartFromProfits';
import { ProductRevenuePieChart } from './ProductRevenuePieChart';
import { ProductDeliveriesCard } from './ProductDeliveriesCard';
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";

export function ProfitsBasedDashboard() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const {
    data: stats,
    isLoading,
  } = useProfitsDashboardStats(selectedDate);

  if (!stats) return null;

  const netProfitIsPositive = stats.netProfitDh >= 0;

  return (
    <div className="space-y-6">
      {/* Sélecteur de période */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            📊 Période sélectionnée :
          </h2>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-[240px] justify-start text-left font-normal",
                  !selectedDate && "text-muted-foreground"
                )}
              >
                <Calendar className="mr-2 h-4 w-4" />
                {selectedDate ? format(selectedDate, "MMMM yyyy", { locale: fr }) : "Sélectionner un mois"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Indicateur du taux de change */}
      <div className="text-center text-sm text-gray-600 dark:text-slate-400 bg-blue-50 dark:bg-slate-700 p-2 rounded-lg transition-colors">
        <span className="font-medium">💱 Taux appliqué : 1 $ = {stats.exchangeRate.toFixed(2)} DH</span>
        {stats.bonus > 0 && (
          <span className="ml-4 font-medium text-green-600">🎁 Bonus inclus : {stats.bonus.toFixed(0)} DH</span>
        )}
      </div>

      {/* Block 1: KPIs principaux */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <KpiCard
          title="Revenus Totaux"
          value={`${stats.totalRevenueDh.toFixed(2)} DH`}
          subValue={`${stats.totalRevenueUsd.toFixed(2)} $`}
          icon={<TrendingUp className="h-4 w-4 text-green-500" />}
          isLoading={isLoading}
        />
        <KpiCard
          title="Dépenses Publicitaires"
          value={`${stats.totalAdSpendDh.toFixed(2)} DH`}
          subValue={`${stats.totalAdSpendUsd.toFixed(2)} $`}
          icon={<TrendingDown className="h-4 w-4 text-red-500" />}
          isLoading={isLoading}
        />
        <KpiCard
          title="Profit Net Total"
          value={`${stats.netProfitDh.toFixed(2)} DH`}
          subValue={`${stats.netProfitUsd.toFixed(2)} $`}
          icon={<BarChart className={`h-4 w-4 ${netProfitIsPositive ? 'text-green-500' : 'text-red-500'}`} />}
          isLoading={isLoading}
        />
      </div>

      {/* Block 2: KPIs secondaires */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Leads"
          value={stats.totalLeads}
          icon={<ArrowUp className="h-4 w-4 text-blue-500" />}
          isLoading={isLoading}
        />
        <KpiCard
          title="Total Livraisons"
          value={stats.totalDeliveries}
          subValue="(Source: Profits)"
          icon={<ArrowUp className="h-4 w-4 text-purple-500" />}
          isLoading={isLoading}
        />
        <KpiCard
          title="Taux de Livraison"
          value={`${stats.deliveryRate.toFixed(2)} %`}
          icon={<TrendingUp className="h-4 w-4 text-orange-500" />}
          isLoading={isLoading}
        />
        <KpiCard
          title="ROI"
          value={`${stats.roi.toFixed(2)} %`}
          subValue={`CPL: ${stats.avgCPL.toFixed(2)}$ | CPD: ${stats.avgCPD.toFixed(2)}$`}
          icon={<BarChart className={`h-4 w-4 ${stats.roi >= 0 ? 'text-green-500' : 'text-red-500'}`} />}
          isLoading={isLoading}
        />
      </div>

      {/* Block 3: Graphiques et détails */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <NetProfitChartFromProfits selectedDate={selectedDate} />
        <ProductRevenuePieChart />
        <ProductDeliveriesCard 
          productDeliveries={stats.productDeliveries} 
          isLoading={isLoading} 
        />
      </div>
    </div>
  );
}
