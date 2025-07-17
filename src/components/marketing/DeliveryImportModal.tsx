
import React, { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { toast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

interface DeliveryData {
  date: string;
  deliveries: number;
}

interface DeliveryImportModalProps {
  open: boolean;
  onClose: () => void;
  onImport: (deliveries: DeliveryData[]) => Promise<void>;
  isUpdating: boolean;
}

export const DeliveryImportModal: React.FC<DeliveryImportModalProps> = ({
  open,
  onClose,
  onImport,
  isUpdating
}) => {
  const [previewData, setPreviewData] = useState<DeliveryData[]>([]);
  const [step, setStep] = useState<'upload' | 'preview' | 'success'>('upload');
  const [errors, setErrors] = useState<string[]>([]);

  const parseCSV = (text: string): DeliveryData[] => {
    const lines = text.split('\n').filter(line => line.trim());
    const data: DeliveryData[] = [];
    const errors: string[] = [];

    // Skip header line if it exists
    const startIndex = lines[0].toLowerCase().includes('date') ? 1 : 0;

    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const [dateStr, deliveriesStr] = line.split(',').map(cell => cell.trim().replace(/"/g, ''));
      
      if (!dateStr || !deliveriesStr) {
        errors.push(`Ligne ${i + 1}: Format invalide`);
        continue;
      }

      // Parse date (support multiple formats)
      let date: Date;
      try {
        // Try different date formats
        if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
          date = new Date(dateStr);
        } else if (dateStr.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
          const [day, month, year] = dateStr.split('/');
          date = new Date(`${year}-${month}-${day}`);
        } else if (dateStr.match(/^\d{1,2}\/\d{1,2}\/\d{4}$/)) {
          const [month, day, year] = dateStr.split('/');
          date = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
        } else {
          date = new Date(dateStr);
        }

        if (isNaN(date.getTime())) {
          errors.push(`Ligne ${i + 1}: Date invalide "${dateStr}"`);
          continue;
        }
      } catch {
        errors.push(`Ligne ${i + 1}: Date invalide "${dateStr}"`);
        continue;
      }

      const deliveries = parseInt(deliveriesStr);
      if (isNaN(deliveries) || deliveries < 0) {
        errors.push(`Ligne ${i + 1}: Nombre de livraisons invalide "${deliveriesStr}"`);
        continue;
      }

      data.push({
        date: date.toISOString().split('T')[0],
        deliveries
      });
    }

    setErrors(errors);
    return data;
  };

  const parseExcel = async (file: File): Promise<DeliveryData[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          // Simple Excel parsing - convert to CSV format
          const text = new TextDecoder().decode(data);
          const csvData = parseCSV(text);
          resolve(csvData);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('Erreur de lecture du fichier'));
      reader.readAsArrayBuffer(file);
    });
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    setErrors([]);

    try {
      let data: DeliveryData[];

      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        const text = await file.text();
        data = parseCSV(text);
      } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        // For Excel files, we'll treat them as CSV for now
        // In a real implementation, you'd use a library like xlsx
        const text = await file.text();
        data = parseCSV(text);
      } else {
        toast({
          title: "Format non supporté",
          description: "Seuls les fichiers CSV et Excel sont acceptés",
          variant: "destructive"
        });
        return;
      }

      if (data.length === 0 && errors.length === 0) {
        toast({
          title: "Fichier vide",
          description: "Le fichier ne contient aucune donnée valide",
          variant: "destructive"
        });
        return;
      }

      setPreviewData(data);
      setStep('preview');
    } catch (error) {
      toast({
        title: "Erreur d'importation",
        description: "Impossible de lire le fichier",
        variant: "destructive"
      });
    }
  }, [errors]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    multiple: false
  });

  const handleImport = async () => {
    try {
      await onImport(previewData);
      setStep('success');
      toast({
        title: "Import réussi ✅",
        description: `${previewData.length} livraisons mises à jour`
      });
    } catch (error) {
      toast({
        title: "Erreur d'import",
        description: "Impossible de mettre à jour les livraisons",
        variant: "destructive"
      });
    }
  };

  const handleClose = () => {
    setStep('upload');
    setPreviewData([]);
    setErrors([]);
    onClose();
  };

  const resetToUpload = () => {
    setStep('upload');
    setPreviewData([]);
    setErrors([]);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Importer les livraisons
          </DialogTitle>
        </DialogHeader>

        {step === 'upload' && (
          <div className="space-y-6">
            <div className="text-sm text-gray-600">
              <p className="mb-2">Format attendu :</p>
              <div className="bg-gray-50 p-3 rounded font-mono text-xs">
                Date,Nombre de livraisons "Delivered"<br/>
                2025-07-01,25<br/>
                2025-07-02,36<br/>
                2025-07-03,25
              </div>
            </div>

            <div
              {...getRootProps()}
              className={`
                border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                ${isDragActive 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-300 hover:border-gray-400'
                }
              `}
            >
              <input {...getInputProps()} />
              <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium mb-2">
                {isDragActive ? 'Déposez le fichier ici' : 'Glissez-déposez ou cliquez pour sélectionner'}
              </p>
              <p className="text-sm text-gray-500">
                Formats supportés : CSV, Excel (.xlsx, .xls)
              </p>
            </div>
          </div>
        )}

        {step === 'preview' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  {previewData.length} lignes trouvées
                </Badge>
                {errors.length > 0 && (
                  <Badge variant="destructive">
                    {errors.length} erreurs
                  </Badge>
                )}
              </div>
              <Button variant="outline" onClick={resetToUpload}>
                Changer de fichier
              </Button>
            </div>

            {errors.length > 0 && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-1">
                    <p className="font-medium">Erreurs détectées :</p>
                    {errors.slice(0, 5).map((error, index) => (
                      <p key={index} className="text-sm">{error}</p>
                    ))}
                    {errors.length > 5 && (
                      <p className="text-sm text-gray-500">... et {errors.length - 5} autres</p>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {previewData.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-medium">Aperçu des données :</h3>
                <div className="border rounded-lg overflow-hidden">
                  <div className="max-h-64 overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="px-4 py-2 text-left">Date</th>
                          <th className="px-4 py-2 text-left">Livraisons</th>
                        </tr>
                      </thead>
                      <tbody>
                        {previewData.slice(0, 20).map((item, index) => (
                          <tr key={index} className="border-t">
                            <td className="px-4 py-2">
                              {new Date(item.date).toLocaleDateString('fr-FR')}
                            </td>
                            <td className="px-4 py-2">{item.deliveries}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {previewData.length > 20 && (
                    <div className="bg-gray-50 px-4 py-2 text-sm text-gray-600 text-center">
                      ... et {previewData.length - 20} lignes supplémentaires
                    </div>
                  )}
                </div>

                <div className="flex gap-3 justify-end">
                  <Button variant="outline" onClick={resetToUpload}>
                    Annuler
                  </Button>
                  <Button 
                    onClick={handleImport}
                    disabled={isUpdating || previewData.length === 0}
                  >
                    {isUpdating ? 'Import en cours...' : `Importer ${previewData.length} livraisons`}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {step === 'success' && (
          <div className="text-center space-y-4 py-8">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
            <div>
              <h3 className="text-lg font-medium">Import réussi !</h3>
              <p className="text-gray-600 mt-2">
                {previewData.length} livraisons ont été mises à jour
              </p>
            </div>
            <Button onClick={handleClose}>
              Fermer
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
