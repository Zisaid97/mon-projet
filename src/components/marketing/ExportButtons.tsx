
import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, FileText } from 'lucide-react';
import { useExport } from '@/hooks/useExport';

interface ExportButtonsProps {
  monthData: Array<{
    date: string;
    spend_usd: number;
    leads: number;
    deliveries: number;
    margin_per_order: number;
  }>;
  exchangeRate: number;
}

export function ExportButtons({ monthData = [], exchangeRate }: ExportButtonsProps) {
  const { exportToCSV, exportToPDF } = useExport();

  const prepareExportData = () => {
    return monthData.map(item => {
      const spendMAD = (item.spend_usd || 0) * exchangeRate;
      const revenue = (item.deliveries || 0) * 150; // 150 DH par commande
      const deliveryRate = item.leads > 0 ? (item.deliveries / item.leads) * 100 : 0;
      const cpl = item.leads > 0 ? spendMAD / item.leads : 0;
      const cpd = item.deliveries > 0 ? spendMAD / item.deliveries : 0;
      const netProfit = revenue - spendMAD;

      return {
        date: item.date,
        spend_mad: spendMAD,
        spend_usd: item.spend_usd || 0,
        leads: item.leads || 0,
        deliveries: item.deliveries || 0,
        delivery_rate: deliveryRate,
        cpl,
        cpd,
        revenue,
        net_profit: netProfit
      };
    });
  };

  const handleExportCSV = () => {
    const exportData = prepareExportData();
    exportToCSV(exportData, 'rapport_marketing');
  };

  const handleExportPDF = () => {
    const exportData = prepareExportData();
    exportToPDF(exportData, 'rapport_marketing');
  };

  if (monthData.length === 0) {
    return null;
  }

  return (
    <div className="flex gap-2">
      <Button
        onClick={handleExportCSV}
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
      >
        <Download className="h-4 w-4" />
        Export CSV
      </Button>
      <Button
        onClick={handleExportPDF}
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
      >
        <FileText className="h-4 w-4" />
        Export PDF
      </Button>
    </div>
  );
}
