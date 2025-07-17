
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { useDropzone } from 'react-dropzone';

interface FileUploadZoneProps {
  onDrop: (acceptedFiles: File[]) => void;
  uploadStatus: 'idle' | 'uploading' | 'success' | 'error';
  availableColumns: string[];
}

export const FileUploadZone: React.FC<FileUploadZoneProps> = ({
  onDrop,
  uploadStatus,
  availableColumns
}) => {
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Importer un fichier Meta Ads
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
            {isDragActive ? 'Déposez le fichier ici' : 'Glissez-déposez votre fichier Meta Ads'}
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
            Fichier importé avec succès - {availableColumns.length} colonnes détectées
          </div>
        )}
      </CardContent>
    </Card>
  );
};
