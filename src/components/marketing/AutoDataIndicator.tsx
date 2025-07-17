
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, Database, TrendingUp, Package } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface AutoDataIndicatorProps {
  isLoading: boolean;
  lastSyncAt?: Date;
  onRefresh: () => void;
  dataType: 'spending' | 'leads' | 'deliveries';
}

export function AutoDataIndicator({ isLoading, lastSyncAt, onRefresh, dataType }: AutoDataIndicatorProps) {
  const getIcon = () => {
    switch (dataType) {
      case 'spending': return <TrendingUp className="h-3 w-3" />;
      case 'leads': return <Database className="h-3 w-3" />;
      case 'deliveries': return <Package className="h-3 w-3" />;
      default: return <Database className="h-3 w-3" />;
    }
  };

  const getSource = () => {
    switch (dataType) {
      case 'spending': return 'Meta Ads';
      case 'leads': return 'Ventes';
      case 'deliveries': return 'Ventes';
      default: return 'Système';
    }
  };

  return (
    <div className="flex items-center gap-2 mt-1">
      <Badge variant="secondary" className="text-xs flex items-center gap-1">
        {getIcon()}
        Auto-importé depuis {getSource()}
      </Badge>
      
      {lastSyncAt && (
        <span className="text-xs text-gray-500">
          Sync: {format(lastSyncAt, 'HH:mm', { locale: fr })}
        </span>
      )}
      
      <Button
        variant="ghost"
        size="sm"
        onClick={onRefresh}
        disabled={isLoading}
        className="h-6 w-6 p-0"
      >
        <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
      </Button>
    </div>
  );
}
