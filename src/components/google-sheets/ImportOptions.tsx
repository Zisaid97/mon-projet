
import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface ImportOptionsProps {
  autoSync: boolean;
  setAutoSync: (value: boolean) => void;
  skipEmptyRows?: boolean;
  setSkipEmptyRows?: (value: boolean) => void;
}

export function ImportOptions({ 
  autoSync, 
  setAutoSync, 
  skipEmptyRows = true, 
  setSkipEmptyRows 
}: ImportOptionsProps) {
  return (
    <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
      <h4 className="font-medium text-gray-900">Options d'import</h4>
      
      <div className="flex items-center space-x-2">
        <Switch
          id="auto-sync"
          checked={autoSync}
          onCheckedChange={setAutoSync}
        />
        <Label htmlFor="auto-sync" className="text-sm">
          Synchronisation automatique quotidienne
        </Label>
      </div>

      {setSkipEmptyRows && (
        <div className="flex items-center space-x-2">
          <Switch
            id="skip-empty"
            checked={skipEmptyRows}
            onCheckedChange={setSkipEmptyRows}
          />
          <Label htmlFor="skip-empty" className="text-sm">
            Ignorer les lignes vides non critiques
          </Label>
        </div>
      )}
    </div>
  );
}
