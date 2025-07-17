
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Settings2, Eye, EyeOff } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface AdSpendingColumnManagerProps {
  availableColumns: string[];
  visibleColumns: string[];
  onColumnVisibilityChange: (columns: string[]) => void;
  data?: any[];
}

export const AdSpendingColumnManager = ({ 
  availableColumns, 
  visibleColumns, 
  onColumnVisibilityChange,
  data = []
}: AdSpendingColumnManagerProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleColumn = (column: string) => {
    const newVisibleColumns = visibleColumns.includes(column)
      ? visibleColumns.filter(col => col !== column)
      : [...visibleColumns, column];
    
    onColumnVisibilityChange(newVisibleColumns);
  };

  const showAllColumns = () => {
    onColumnVisibilityChange(availableColumns);
  };

  const hideAllColumns = () => {
    onColumnVisibilityChange([]);
  };

  return (
    <div className="flex items-center gap-2">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Settings2 className="h-4 w-4" />
            🎛️ Colonnes visibles ({visibleColumns.length}/{availableColumns.length})
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="end">
          <Card className="border-0 shadow-none">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Gestion des colonnes</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={showAllColumns}>
                  <Eye className="h-3 w-3 mr-1" />
                  Tout afficher
                </Button>
                <Button variant="outline" size="sm" onClick={hideAllColumns}>
                  <EyeOff className="h-3 w-3 mr-1" />
                  Tout masquer
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 max-h-64 overflow-y-auto">
              {availableColumns.map((column) => (
                <div key={column} className="flex items-center space-x-2">
                  <Checkbox
                    id={column}
                    checked={visibleColumns.includes(column)}
                    onCheckedChange={() => toggleColumn(column)}
                  />
                  <label 
                    htmlFor={column} 
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                  >
                    {column}
                  </label>
                  <span className="text-xs text-gray-500">
                    {data.length > 0 && data[0][column] !== undefined ? '✓' : '—'}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </PopoverContent>
      </Popover>
    </div>
  );
};
