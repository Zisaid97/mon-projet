
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGoogleSheetsExport } from '@/hooks/useGoogleSheetsExport';
import { ExportOptions } from './ExportOptions';
import { ExportForm } from './ExportForm';
import { prepareMarketingData, prepareFinancialData, prepareProfitData } from '@/utils/googleSheetsDataPreparation';

export function GoogleSheetsExport() {
  const {
    fileName,
    setFileName,
    exportMarketing,
    setExportMarketing,
    exportFinancial,
    setExportFinancial,
    exportProfits,
    setExportProfits,
    loading,
    handleExport,
    marketingData,
    financialData,
    profitData,
    exchangeRate,
  } = useGoogleSheetsExport();

  const onExport = () => {
    const prepareMarketingDataBound = () => prepareMarketingData(marketingData || [], exchangeRate || 10);
    const prepareFinancialDataBound = () => prepareFinancialData(financialData || []);
    const prepareProfitDataBound = () => prepareProfitData(profitData || []);

    handleExport(prepareMarketingDataBound, prepareFinancialDataBound, prepareProfitDataBound);
  };

  const isExportDisabled = !exportMarketing && !exportFinancial && !exportProfits;

  return (
    <Card>
      <CardHeader>
        <CardTitle>📤 Exporter vers Google Sheets</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <ExportForm
          fileName={fileName}
          setFileName={setFileName}
          onExport={onExport}
          loading={loading}
          disabled={isExportDisabled}
        />

        <ExportOptions
          exportMarketing={exportMarketing}
          setExportMarketing={setExportMarketing}
          exportFinancial={exportFinancial}
          setExportFinancial={setExportFinancial}
          exportProfits={exportProfits}
          setExportProfits={setExportProfits}
          marketingCount={marketingData?.length || 0}
          financialCount={financialData?.length || 0}
          profitCount={profitData?.length || 0}
        />
      </CardContent>
    </Card>
  );
}
