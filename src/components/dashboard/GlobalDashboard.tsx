
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { KpiCard } from "./KpiCard";
import { TrendingUp, TrendingDown, BarChart, ArrowUp } from 'lucide-react';
import { NetProfitChart } from './NetProfitChart';
import { ProductRevenuePieChart } from './ProductRevenuePieChart';

export function GlobalDashboard() {
  const {
    totalLeads,
    totalDeliveries,
    deliveryRate,
    totalAdSpendUsd,
    totalAdSpendDh,
    totalRevenueUsd,
    totalRevenueDh,
    netProfitUsd,
    netProfitDh,
    exchangeRate,
    isLoading,
  } = useDashboardStats();
  
  const netProfitIsPositive = netProfitDh >= 0;

  return (
    <div className="space-y-6">
      <div className="text-center text-sm text-gray-600 dark:text-slate-400 bg-blue-50 dark:bg-slate-700 p-2 rounded-lg transition-colors">
        <span className="font-medium">📊 Taux appliqué : 1 $ = {exchangeRate.toFixed(2)} DH</span>
      </div>

      {/* Block 1: KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <KpiCard
          title="Revenus Totaux"
          value={`${totalRevenueDh.toFixed(2)} DH`}
          subValue={`${totalRevenueUsd.toFixed(2)} $`}
          icon={<TrendingUp className="h-4 w-4 text-green-500" />}
          isLoading={isLoading}
        />
        <KpiCard
          title="Dépenses Publicitaires"
          value={`${totalAdSpendDh.toFixed(2)} DH`}
          subValue={`${totalAdSpendUsd.toFixed(2)} $`}
          icon={<TrendingDown className="h-4 w-4 text-red-500" />}
          isLoading={isLoading}
        />
        <KpiCard
          title="Profit Net Total"
          value={`${netProfitDh.toFixed(2)} DH`}
          subValue={`${netProfitUsd.toFixed(2)} $`}
          icon={<BarChart className={`h-4 w-4 ${netProfitIsPositive ? 'text-green-500' : 'text-red-500'}`} />}
          isLoading={isLoading}
        />
        <KpiCard
          title="Total Leads"
          value={totalLeads}
          icon={<ArrowUp className="h-4 w-4 text-gray-500" />}
          isLoading={isLoading}
        />
        <KpiCard
          title="Total Livraisons"
          value={totalDeliveries}
          icon={<ArrowUp className="h-4 w-4 text-gray-500" />}
          isLoading={isLoading}
        />
        <KpiCard
          title="Taux de Livraison"
          value={`${deliveryRate.toFixed(2)} %`}
          icon={<TrendingUp className="h-4 w-4 text-gray-500" />}
          isLoading={isLoading}
        />
      </div>

      {/* Block 2 & 3: Charts */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <NetProfitChart />
        <ProductRevenuePieChart />
      </div>
    </div>
  );
}
