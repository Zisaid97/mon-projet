
import { useState } from 'react';
import { useGoogleSheets } from '@/hooks/useGoogleSheets';
import { useMarketingData } from '@/hooks/useMarketingData';
import { useFinancialRows } from '@/hooks/useFinancialTracking';
import { useProfitRows } from '@/hooks/useProfitTracking';
import { useExchangeRate } from '@/hooks/useExchangeRate';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';

export function useGoogleSheetsExport() {
  const { user } = useAuth();
  const { createSpreadsheet, writeSheetData } = useGoogleSheets();
  const { data: marketingData } = useMarketingData();
  const { data: financialData } = useFinancialRows();
  const { data: profitData } = useProfitRows();
  const { data: exchangeRate } = useExchangeRate();
  
  const [fileName, setFileName] = useState<string>(`Export_${format(new Date(), 'yyyy-MM-dd')}`);
  const [exportMarketing, setExportMarketing] = useState<boolean>(true);
  const [exportFinancial, setExportFinancial] = useState<boolean>(true);
  const [exportProfits, setExportProfits] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);

  const handleExport = async (
    prepareMarketingData: () => any[][],
    prepareFinancialData: () => any[][],
    prepareProfitData: () => any[][]
  ) => {
    try {
      setLoading(true);
      
      // Create new spreadsheet
      const spreadsheetResponse = await createSpreadsheet(fileName);
      const spreadsheetId = spreadsheetResponse.spreadsheetId;
      
      let exportCount = 0;

      // Export Marketing data
      if (exportMarketing && marketingData?.length) {
        const marketingRows = prepareMarketingData();
        await writeSheetData(spreadsheetId, 'Marketing!A1', marketingRows);
        exportCount++;
      }

      // Export Financial data
      if (exportFinancial && financialData?.length) {
        const financialRows = prepareFinancialData();
        await writeSheetData(spreadsheetId, 'Financial!A1', financialRows);
        exportCount++;
      }

      // Export Profit data
      if (exportProfits && profitData?.length) {
        const profitRows = prepareProfitData();
        await writeSheetData(spreadsheetId, 'Profits!A1', profitRows);
        exportCount++;
      }

      toast({
        title: "Export réussi",
        description: `${exportCount} modules exportés vers "${fileName}"`
      });

      // Open the created spreadsheet
      window.open(`https://docs.google.com/spreadsheets/d/${spreadsheetId}`, '_blank');

    } catch (error) {
      toast({
        title: "Erreur d'export",
        description: error instanceof Error ? error.message : "Erreur inconnue",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return {
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
  };
}
