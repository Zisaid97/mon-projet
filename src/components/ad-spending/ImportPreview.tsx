
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AdSpendingColumnManager } from './AdSpendingColumnManager';

interface ImportPreviewProps {
  previewData: any[];
  availableColumns: string[];
  visibleColumns: string[];
  onColumnVisibilityChange: (columns: string[]) => void;
  onConfirmImport: () => void;
}

export const ImportPreview: React.FC<ImportPreviewProps> = ({
  previewData,
  availableColumns,
  visibleColumns,
  onColumnVisibilityChange,
  onConfirmImport
}) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <CardTitle>Aperçu des données</CardTitle>
          <div className="flex items-center gap-3">
            <AdSpendingColumnManager
              availableColumns={availableColumns}
              visibleColumns={visibleColumns}
              onColumnVisibilityChange={onColumnVisibilityChange}
              data={previewData}
            />
            <Button onClick={onConfirmImport} className="bg-green-600 hover:bg-green-700">
              Confirmer l'importation
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {visibleColumns.map((column) => (
                  <th key={column} className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase truncate max-w-32">
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {previewData.map((row, index) => (
                <tr key={index}>
                  {visibleColumns.map((column) => (
                    <td key={column} className="px-3 py-2 text-sm text-gray-900 truncate max-w-32">
                      {row[column] || '-'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {availableColumns.length > visibleColumns.length && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              📝 {availableColumns.length - visibleColumns.length} colonnes masquées. 
              Utilisez le bouton "🎛️ Colonnes visibles" pour les afficher.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
