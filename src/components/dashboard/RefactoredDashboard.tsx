
import { useState } from "react";
import { useMonthlyKPIs } from "@/hooks/useMonthlyKPIs";
import { KpiCard } from "./KpiCard";
import { DashboardFilters } from "./DashboardFilters";
import { StatsModal } from "./StatsModal";
import { DailyPerformanceCard } from "./DailyPerformanceCard";
import { ProductProfitabilityTable } from "../products/ProductProfitabilityTable";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useFiltersStore } from "@/stores/filtersStore";
import { TrendingUp, TrendingDown, BarChart, ArrowUp, Calendar, BarChart3 } from 'lucide-react';
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export function RefactoredDashboard() {
  const [selectedDate] = useState<Date>(new Date());
  const [statsModalOpen, setStatsModalOpen] = useState(false);
  const { hasActiveFilters, filters } = useFiltersStore();
  
  const monthKey = format(selectedDate, 'yyyy-MM-01');
  const { data: kpis, isLoading } = useMonthlyKPIs(monthKey);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <KpiCard
              key={i}
              title="Chargement..."
              value="..."
              icon={<BarChart className="h-4 w-4" />}
              isLoading={true}
            />
          ))}
        </div>
      </div>
    );
  }

  const netProfitIsPositive = (kpis?.net_profit || 0) >= 0;
  const roiIsPositive = (kpis?.roi_percent || 0) >= 0;

  return (
    <div className="space-y-6">
      {/* Période sélectionnée */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            📊 Période : {format(selectedDate, "MMMM yyyy", { locale: fr })}
          </h2>
        </div>
        
        {/* Bouton d'analyse flottant */}
        <div className="relative">
          <Button
            onClick={() => setStatsModalOpen(true)}
            className="flex items-center gap-2"
            variant={hasActiveFilters() ? "default" : "outline"}
          >
            <BarChart3 className="h-4 w-4" />
            Analyse détaillée
            {hasActiveFilters() && (
              <Badge variant="secondary" className="ml-1 px-1.5 py-0.5 text-xs">
                !
              </Badge>
            )}
          </Button>
        </div>
      </div>

      {/* Performance quotidienne */}
      <DailyPerformanceCard selectedDate={selectedDate} />

      {/* Filtres */}
      <DashboardFilters />

      {/* KPIs principaux */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Revenus Totaux"
          value={`${(kpis?.total_revenue || 0).toFixed(0)} DH`}
          icon={<TrendingUp className="h-4 w-4 text-green-500" />}
          isLoading={isLoading}
        />
        <KpiCard
          title="Dépenses Publicitaires"
          value={`${(kpis?.total_spend || 0).toFixed(0)} DH`}
          icon={<TrendingDown className="h-4 w-4 text-red-500" />}
          isLoading={isLoading}
        />
        <KpiCard
          title="Profit Net"
          value={`${(kpis?.net_profit || 0).toFixed(0)} DH`}
          subValue={kpis?.total_bonus ? `Bonus: ${kpis.total_bonus.toFixed(0)} DH` : undefined}
          icon={<BarChart className={`h-4 w-4 ${netProfitIsPositive ? 'text-green-500' : 'text-red-500'}`} />}
          isLoading={isLoading}
        />
        <KpiCard
          title="ROI"
          value={`${(kpis?.roi_percent || 0).toFixed(1)} %`}
          icon={<TrendingUp className={`h-4 w-4 ${roiIsPositive ? 'text-green-500' : 'text-red-500'}`} />}
          isLoading={isLoading}
        />
      </div>

      {/* KPIs secondaires */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Leads"
          value={kpis?.total_leads || 0}
          icon={<ArrowUp className="h-4 w-4 text-blue-500" />}
          isLoading={isLoading}
        />
        <KpiCard
          title="Total Livraisons"
          value={kpis?.total_deliveries || 0}
          icon={<ArrowUp className="h-4 w-4 text-purple-500" />}
          isLoading={isLoading}
        />
        <KpiCard
          title="CPL Moyen"
          value={`${(kpis?.avg_cpl_mad || 0).toFixed(2)} DH`}
          icon={<BarChart className="h-4 w-4 text-orange-500" />}
          isLoading={isLoading}
        />
        <KpiCard
          title="CPD Moyen"
          value={`${(kpis?.avg_cpd_mad || 0).toFixed(2)} DH`}
          icon={<BarChart className="h-4 w-4 text-indigo-500" />}
          isLoading={isLoading}
        />
      </div>

      {/* Analyse de rentabilité des produits */}
      <ProductProfitabilityTable 
        startDate={filters.start || undefined}
        endDate={filters.end || undefined}
      />


      {/* Modal d'analyse */}  
      <StatsModal
        open={statsModalOpen}
        onOpenChange={setStatsModalOpen}
      />
    </div>
  );
}
