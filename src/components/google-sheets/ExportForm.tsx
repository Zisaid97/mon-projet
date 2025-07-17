
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';

interface ExportFormProps {
  fileName: string;
  setFileName: (value: string) => void;
  onExport: () => void;
  loading: boolean;
  disabled: boolean;
}

export function ExportForm({
  fileName,
  setFileName,
  onExport,
  loading,
  disabled,
}: ExportFormProps) {
  return (
    <>
      <div>
        <Label htmlFor="filename">Nom du fichier</Label>
        <Input
          id="filename"
          value={fileName}
          onChange={(e) => setFileName(e.target.value)}
          placeholder="Nom du fichier"
        />
      </div>

      <Button 
        onClick={onExport} 
        disabled={loading || disabled}
        className="w-full"
      >
        <Upload className="h-4 w-4 mr-2" />
        {loading ? 'Export en cours...' : 'Créer et exporter'}
      </Button>
    </>
  );
}
