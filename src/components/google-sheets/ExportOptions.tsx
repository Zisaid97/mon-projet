
import React from 'react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

interface ExportOptionsProps {
  exportMarketing: boolean;
  setExportMarketing: (value: boolean) => void;
  exportFinancial: boolean;
  setExportFinancial: (value: boolean) => void;
  exportProfits: boolean;
  setExportProfits: (value: boolean) => void;
  marketingCount: number;
  financialCount: number;
  profitCount: number;
}

export function ExportOptions({
  exportMarketing,
  setExportMarketing,
  exportFinancial,
  setExportFinancial,
  exportProfits,
  setExportProfits,
  marketingCount,
  financialCount,
  profitCount,
}: ExportOptionsProps) {
  return (
    <div className="space-y-3">
      <Label>Modules à exporter :</Label>
      
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="export-marketing" 
            checked={exportMarketing} 
            onCheckedChange={(checked) => setExportMarketing(checked === true)}
          />
          <Label htmlFor="export-marketing">
            📊 Données Marketing ({marketingCount} entrées)
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox 
            id="export-financial" 
            checked={exportFinancial} 
            onCheckedChange={(checked) => setExportFinancial(checked === true)}
          />
          <Label htmlFor="export-financial">
            💸 Données Financières ({financialCount} entrées)
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox 
            id="export-profits" 
            checked={exportProfits} 
            onCheckedChange={(checked) => setExportProfits(checked === true)}
          />
          <Label htmlFor="export-profits">
            💰 Données Profits ({profitCount} entrées)
          </Label>
        </div>
      </div>
    </div>
  );
}
