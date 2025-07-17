
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Package } from 'lucide-react';
import { DateRangePicker } from '@/components/DateRangePicker';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ProductCountryPerformanceTableHeaderProps {
  dataCount: number;
  dateParams: { startDate: string; endDate: string } | null;
  onExport: () => void;
}

export const ProductCountryPerformanceTableHeader = ({
  dataCount,
  dateParams,
  onExport
}: ProductCountryPerformanceTableHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Package className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-semibold">Performance par Produit et Pays</h3>
      </div>
      <div className="flex items-center gap-3">
        <Badge variant="outline" className="text-sm">
          {dataCount} entrées
        </Badge>
        {dateParams && (
          <Badge variant="secondary" className="text-sm">
            {format(new Date(dateParams.startDate), 'dd MMM', { locale: fr })} - 
            {format(new Date(dateParams.endDate), 'dd MMM yyyy', { locale: fr })}
          </Badge>
        )}
        <Button variant="outline" size="sm" onClick={onExport}>
          <Download className="h-4 w-4 mr-1" />
          Export CSV
        </Button>
      </div>
    </div>
  );
};
