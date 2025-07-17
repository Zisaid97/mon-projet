
import React, { useState } from 'react';
import { Header } from "@/components/layout/Header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSalesData } from '@/hooks/useSalesData';
import { useSalesFilters } from '@/hooks/useSalesFilters';
import { SalesImport } from '@/components/sales/SalesImport';
import { SalesFilters } from '@/components/sales/SalesFilters';
import { SalesStats } from '@/components/sales/SalesStats';
import { SalesTable } from '@/components/sales/SalesTable';
import { SalesDailyView } from '@/components/sales/SalesDailyView';
import { SalesAnalytics } from '@/components/sales/SalesAnalytics';
import { SalesOrdersView } from '@/components/sales/SalesOrdersView';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export default function Sales() {
  const { data, loading, exportData, fetchData } = useSalesData();
  const { toast } = useToast();
  const {
    filters,
    filteredData,
    uniqueValues,
    sortField,
    sortDirection,
    updateFilter,
    handleSort,
    resetFilters
  } = useSalesFilters(data);

  console.log('=== SALES PAGE ===');
  console.log('Raw data:', data);
  console.log('Data length:', data?.length || 0);
  console.log('Unique values:', uniqueValues);
  console.log('Loading:', loading);

  const handleExport = () => {
    exportData(filteredData);
  };

  const handleDeleteDay = async (date: string) => {
    try {
      const { error } = await supabase
        .from('sales_data')
        .delete()
        .eq('date', date);

      if (error) throw error;

      await fetchData(); // Refresh data
      
      toast({
        title: "Jour supprimé",
        description: `Toutes les ventes du ${new Date(date).toLocaleDateString('fr-FR')} ont été supprimées.`,
      });
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer les ventes de ce jour.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <Header />
        <main className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <Header />
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🎯 Gestion des Ventes
          </h1>
          <p className="text-gray-700">
            Importez, filtrez et analysez vos données de ventes avec une interface intuitive
          </p>
        </div>

        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="orders">💰 CA Livraisons</TabsTrigger>
            <TabsTrigger value="import">📥 Import</TabsTrigger>
            <TabsTrigger value="daily">📅 Vue par jour</TabsTrigger>
            <TabsTrigger value="table">📋 Tableau</TabsTrigger>
            <TabsTrigger value="analytics">📊 Analyse</TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="space-y-6">
            <SalesOrdersView />
          </TabsContent>

          <TabsContent value="import" className="space-y-6">
            <SalesImport />
          </TabsContent>

          <TabsContent value="daily" className="space-y-6">
            <SalesStats data={filteredData} />
            <SalesFilters
              filters={filters}
              uniqueValues={uniqueValues}
              onFilterChange={updateFilter}
              onResetFilters={resetFilters}
              onExport={handleExport}
            />
            <SalesDailyView 
              data={filteredData} 
              onDeleteDay={handleDeleteDay}
            />
          </TabsContent>

          <TabsContent value="table" className="space-y-6">
            <SalesStats data={filteredData} />
            <SalesFilters
              filters={filters}
              uniqueValues={uniqueValues}
              onFilterChange={updateFilter}
              onResetFilters={resetFilters}
              onExport={handleExport}
            />
            <SalesTable
              data={filteredData}
              sortField={sortField}
              sortDirection={sortDirection}
              onSort={handleSort}
            />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <SalesStats data={data} />
            <SalesAnalytics 
              data={data || []} 
              uniqueValues={uniqueValues || {
                cities: [],
                confirmationStatuses: [],
                deliveryStatuses: [],
                salesChannels: [],
                products: [],
                agents: []
              }}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
