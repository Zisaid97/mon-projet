
import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { MarketingResults } from '../MarketingResults';
import { MarketingTable } from '../MarketingTable';
import { MarketingSummary } from '../MarketingSummary';
import { EnhancedAutoSpendAttributionDisplay } from '../EnhancedAutoSpendAttributionDisplay';
import { ProductCountryPerformanceTable } from '../ProductCountryPerformanceTable';

interface MarketingTabsContentProps {
  monthData: any[];
  marketingResults: any;
  monthlyResume: any;
  exchangeRate: number;
  loading: boolean;
  onUpdateDeliveries: (id: string, newDeliveries: number) => void;
  onUpdateMargin: (id: string, newMargin: number) => void;
  onDeleteData: () => void;
  FormComponent: React.ComponentType<any>;
  formProps: any;
}

export const MarketingTabsContent = ({
  monthData,
  marketingResults,
  monthlyResume,
  exchangeRate,
  loading,
  onUpdateDeliveries,
  onUpdateMargin,
  onDeleteData,
  FormComponent,
  formProps
}: MarketingTabsContentProps) => {
  // Convert the individual update functions to the single onUpdate function expected by MarketingTable
  const handleUpdate = async (id: string, field: string, value: number) => {
    if (field === 'deliveries') {
      await onUpdateDeliveries(id, value);
    } else if (field === 'margin_per_order') {
      await onUpdateMargin(id, value);
    }
  };

  const handleDelete = async (id: string) => {
    await onDeleteData();
  };

  return (
    <>
      <TabsContent value="performance" className="space-y-6">
        {/* Formulaire de saisie */}
        <FormComponent {...formProps} />
        
        {/* Résultats en temps réel */}
        <MarketingResults results={marketingResults} />
        
        
        {/* Résumé mensuel */}
        <MarketingSummary 
          monthlyResume={monthlyResume}
        />
        
        {/* Tableau détaillé des données */}
        <MarketingTable
          data={monthData}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
          isUpdating={loading}
          exchangeRate={exchangeRate}
        />
      </TabsContent>

      <TabsContent value="attribution" className="space-y-6">
        {/* Attribution automatique des dépenses Meta */}
        <EnhancedAutoSpendAttributionDisplay />
      </TabsContent>
    </>
  );
};
