import React, { useState, useEffect, useRef } from 'react';
import { Badge } from '@/components/ui/badge';
import { useRealTimeAttributions } from '@/hooks/useRealTimeAttributions';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export const RealTimeStatusIndicator: React.FC = () => {
  const { lastUpdate } = useRealTimeAttributions();
  const [isAnimating, setIsAnimating] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const animationRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (lastUpdate) {
      setIsConnected(true);
      setIsAnimating(true);
      
      // Nettoyer l'animation précédente
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
      
      animationRef.current = setTimeout(() => {
        setIsAnimating(false);
      }, 2000);
    }

    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
    };
  }, [lastUpdate]);

  return (
    <div className="flex items-center gap-2">
      <Badge 
        variant="secondary" 
        className={`transition-all duration-300 ${
          isAnimating 
            ? 'animate-pulse bg-green-100 text-green-700 border-green-300' 
            : isConnected 
              ? 'bg-blue-50 text-blue-700 border-blue-200' 
              : 'bg-red-50 text-red-700 border-red-200'
        }`}
      >
        {isConnected ? (
          <Wifi className="h-3 w-3 mr-1" />
        ) : (
          <WifiOff className="h-3 w-3 mr-1" />
        )}
        {isConnected ? 'Connecté' : 'Déconnecté'}
      </Badge>
      
      {lastUpdate && isConnected && (
        <Badge variant="outline" className="text-xs border-gray-200">
          <RefreshCw className={`h-3 w-3 mr-1 ${isAnimating ? 'animate-spin' : ''}`} />
          {format(new Date(lastUpdate.timestamp), 'HH:mm:ss', { locale: fr })}
        </Badge>
      )}
    </div>
  );
};