
import React, { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAdSpendingData } from '@/hooks/useAdSpendingData';
import { useMetaAttributions } from '@/hooks/useMetaAttributions';
import { format } from 'date-fns';
import { FileUploadZone } from './FileUploadZone';
import { ImportPreview } from './ImportPreview';
import { ExpectedColumnsGuide } from './ExpectedColumnsGuide';

export const AdSpendingImport = () => {
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [availableColumns, setAvailableColumns] = useState<string[]>([]);
  const [visibleColumns, setVisibleColumns] = useState<string[]>([]);
  const { toast } = useToast();
  const { importData } = useAdSpendingData();
  const { processMetaData } = useMetaAttributions();

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

      setAvailableColumns(headers);
      setVisibleColumns(headers.slice(0, 8));
      setPreviewData(data.slice(0, 5));
      setUploadStatus('success');
      
      toast({
        title: "Fichier importé avec succès",
        description: `${data.length} lignes de données détectées avec ${headers.length} colonnes`,
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
    console.log('🚀 DÉBUT DU PROCESSUS D\'IMPORT');
    
    try {
      await importData(previewData);
      
      const firstDataReport = previewData[0]?.['Début des rapports'] || previewData[0]?.['Fin des rapports'];
      const dataMonth = firstDataReport ? format(new Date(firstDataReport), 'yyyy-MM') : format(new Date(), 'yyyy-MM');
      
      const success = await processMetaData(previewData, dataMonth);
      
      if (success) {
        toast({
          title: "Données importées et attributions générées",
          description: "Les données ont été sauvegardées et les attributions automatiques ont été créées",
        });
      } else {
        toast({
          title: "Données importées",
          description: "Les données ont été sauvegardées mais les attributions automatiques ont échoué",
          variant: "destructive",
        });
      }
      
      setPreviewData([]);
      setAvailableColumns([]);
      setVisibleColumns([]);
      setUploadStatus('idle');
      
      window.dispatchEvent(new CustomEvent('meta-attributions-updated'));
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'import:', error);
      toast({
        title: "Erreur de sauvegarde",
        description: "Impossible de sauvegarder les données",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <FileUploadZone 
        onDrop={onDrop}
        uploadStatus={uploadStatus}
        availableColumns={availableColumns}
      />

      {previewData.length > 0 && (
        <ImportPreview
          previewData={previewData}
          availableColumns={availableColumns}
          visibleColumns={visibleColumns}
          onColumnVisibilityChange={setVisibleColumns}
          onConfirmImport={confirmImport}
        />
      )}

      <ExpectedColumnsGuide />
    </div>
  );
};
