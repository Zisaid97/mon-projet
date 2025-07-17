
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, ChevronDown, ChevronUp, Eye, EyeOff } from 'lucide-react';
import { SalesData } from '@/types/sales';

interface DayActionsProps {
  date: string;
  salesCount: number;
  isExpanded: boolean;
  onToggleExpanded: () => void;
  onDeleteDay: () => void;
}

export const DayActions = ({ 
  date, 
  salesCount, 
  isExpanded, 
  onToggleExpanded, 
  onDeleteDay 
}: DayActionsProps) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <h3 className="text-lg font-semibold">
          📅 {new Date(date).toLocaleDateString('fr-FR', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </h3>
        <Badge variant="outline">
          {salesCount} vente{salesCount > 1 ? 's' : ''}
        </Badge>
      </div>
      
      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onToggleExpanded}
          className="text-blue-600 hover:text-blue-800"
        >
          {isExpanded ? (
            <>
              <EyeOff className="h-4 w-4 mr-1" />
              Replier
            </>
          ) : (
            <>
              <Eye className="h-4 w-4 mr-1" />
              Voir les commandes
            </>
          )}
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onDeleteDay}
          className="text-red-600 hover:text-red-800 hover:bg-red-50"
        >
          🗑️ Supprimer le jour
        </Button>
      </div>
    </div>
  );
};
