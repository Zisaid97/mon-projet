
import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

interface ImportButtonProps {
  onImport: () => void;
  loading: boolean;
  disabled: boolean;
}

export function ImportButton({ onImport, loading, disabled }: ImportButtonProps) {
  return (
    <Button 
      onClick={onImport} 
      disabled={loading || disabled}
      className="w-full"
    >
      <Download className="h-4 w-4 mr-2" />
      {loading ? 'Import en cours...' : 'Importer les données'}
    </Button>
  );
}
