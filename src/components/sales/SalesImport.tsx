
import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { useToast } from '@/hooks/use-toast';
import { useSalesData } from '@/hooks/useSalesData';

export const SalesImport = () => {
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [previewData, setPreviewData] = useState<any[]>([]);
  const { toast } = useToast();
  const { importData } = useSalesData();

  const expectedColumns = [
    'ID',
    'ID Externe de la Commande',
    'Date',
    'Canal de Vente',
    'Numéro de Suivi',
    'Client',
    'Produit(s)',
    'Prix',
    'Méthode de Paiement',
    'Acompte',
    'Expédition Client',
    'Téléphone',
    'Adresse',
    'Ville',
    'Notes',
    'Statut de Confirmation',
    'Note de Confirmation',
    'Livreur',
    'Statut de Livraison',
    'Note de Livraison'
  ];

  const parseCSV = (text: string) => {
    const lines = text.split('\n');
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const data = [];
    
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim()) {
        const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
        const row: any = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });
        data.push(row);
      }
    }
    
    return { data, headers };
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setUploadStatus('uploading');
    
    try {
      const text = await file.text();
      const { data, headers } = parseCSV(text);
      
      if (data.length === 0) {
        throw new Error('Aucune donnée trouvée dans le fichier');
      }

      setPreviewData(data.slice(0, 5));
      setUploadStatus('success');
      
      toast({
        title: "Fichier importé avec succès",
        description: `${data.length} lignes de ventes détectées`,
      });
    } catch (error) {
      console.error('Erreur lors de l\'importation:', error);
      setUploadStatus('error');
      toast({
        title: "Erreur d'importation",
        description: "Impossible de lire le fichier. Vérifiez le format.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const confirmImport = async () => {
    try {
      await importData(previewData);
      setPreviewData([]);
      setUploadStatus('idle');
    } catch (error) {
      toast({
        title: "Erreur de sauvegarde",
        description: "Impossible de sauvegarder les données",
        variant: "destructive",
      });
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    },
    multiple: false
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Importer un fichier de ventes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <input {...getInputProps()} />
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-lg font-medium text-gray-900 mb-2">
              {isDragActive ? 'Déposez le fichier ici' : 'Glissez-déposez votre fichier de ventes'}
            </p>
            <p className="text-gray-500 mb-4">
              Formats acceptés : CSV, XLS, XLSX
            </p>
            <Button variant="outline">
              Sélectionner un fichier
            </Button>
          </div>

          {uploadStatus === 'uploading' && (
            <div className="mt-4 text-center">
              <div className="inline-flex items-center gap-2 text-blue-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                Traitement du fichier...
              </div>
            </div>
          )}

          {uploadStatus === 'error' && (
            <div className="mt-4 flex items-center gap-2 text-red-600">
              <AlertCircle className="h-4 w-4" />
              Erreur lors de l'importation du fichier
            </div>
          )}

          {uploadStatus === 'success' && (
            <div className="mt-4 flex items-center gap-2 text-green-600">
              <CheckCircle className="h-4 w-4" />
              Fichier importé avec succès
            </div>
          )}
        </CardContent>
      </Card>

      {previewData.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Aperçu des données</CardTitle>
              <Button onClick={confirmImport} className="bg-green-600 hover:bg-green-700">
                Confirmer l'importation
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {Object.keys(previewData[0] || {}).map((column) => (
                      <th key={column} className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase truncate max-w-32">
                        {column}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {previewData.map((row, index) => (
                    <tr key={index}>
                      {Object.values(row).map((value: any, cellIndex) => (
                        <td key={cellIndex} className="px-3 py-2 text-sm text-gray-900 truncate max-w-32">
                          {value || '-'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Colonnes attendues (dans l'ordre exact)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {expectedColumns.map((column, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-mono">
                  {index + 1}
                </span>
                <span>{column}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
