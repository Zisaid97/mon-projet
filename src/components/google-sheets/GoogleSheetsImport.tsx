
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useGoogleSheetsImport } from '@/hooks/useGoogleSheetsImport';
import { ImportSelectionForm } from './ImportSelectionForm';
import { ImportOptions } from './ImportOptions';
import { ImportButton } from './ImportButton';
import { RefreshCw, Check, X } from 'lucide-react';
import { ImportPreview } from './ImportPreview';

export function GoogleSheetsImport() {
  const {
    spreadsheets,
    selectedSpreadsheet,
    setSelectedSpreadsheet,
    sheetInfo,
    selectedSheet,
    setSelectedSheet,
    range,
    setRange,
    module,
    setModule,
    autoSync,
    setAutoSync,
    skipEmptyRows,
    setSkipEmptyRows,
    loading,
    loadSpreadsheets,
    handleImport,
    importedData,
    saveImportedData,
    clearPreviewData
  } = useGoogleSheetsImport();

  const isImportDisabled = !selectedSpreadsheet || !selectedSheet;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          📥 Importer depuis Google Sheets
          <Button variant="outline" size="sm" onClick={loadSpreadsheets} disabled={loading}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <ImportSelectionForm
          spreadsheets={spreadsheets}
          selectedSpreadsheet={selectedSpreadsheet}
          setSelectedSpreadsheet={setSelectedSpreadsheet}
          sheetInfo={sheetInfo}
          selectedSheet={selectedSheet}
          setSelectedSheet={setSelectedSheet}
          range={range}
          setRange={setRange}
          module={module}
          setModule={setModule}
        />

        <ImportOptions
          autoSync={autoSync}
          setAutoSync={setAutoSync}
          skipEmptyRows={skipEmptyRows}
          setSkipEmptyRows={setSkipEmptyRows}
        />

        {!importedData ? (
          <ImportButton
            onImport={handleImport}
            loading={loading}
            disabled={isImportDisabled}
          />
        ) : (
          <div className="border-t pt-4">
            <ImportPreview data={importedData} />
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={clearPreviewData} disabled={loading}>
                <X className="h-4 w-4 mr-2" />
                Annuler
              </Button>
              <Button onClick={saveImportedData} disabled={loading}>
                <Check className="h-4 w-4 mr-2" />
                {loading ? 'Sauvegarde en cours...' : 'Valider et Sauvegarder'}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
