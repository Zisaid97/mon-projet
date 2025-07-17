
import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format, eachDayOfInterval, startOfMonth, endOfMonth } from 'date-fns';
import { fr } from 'date-fns/locale';

interface MissingDaysNotificationProps {
  monthData: Array<{ date: string; [key: string]: any }>;
}

export function MissingDaysNotification({ monthData = [] }: MissingDaysNotificationProps) {
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  
  // Générer tous les jours du mois jusqu'à aujourd'hui
  const allDaysUntilToday = eachDayOfInterval({
    start: monthStart,
    end: now > monthEnd ? monthEnd : now
  });
  
  // Récupérer les dates qui ont des données
  const datesWithData = new Set(monthData.map(item => item.date));
  
  // Trouver les jours manquants
  const missingDays = allDaysUntilToday.filter(day => {
    const dateString = format(day, 'yyyy-MM-dd');
    return !datesWithData.has(dateString);
  });

  if (missingDays.length === 0) {
    return null;
  }

  return (
    <Card className="border-gray-200 bg-gray-50">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-gray-700 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-2">
              Données manquantes ({missingDays.length} jour{missingDays.length > 1 ? 's' : ''})
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              Les jours suivants n'ont pas encore de données marketing :
            </p>
            <div className="flex flex-wrap gap-1">
              {missingDays.map(day => (
                <Badge 
                  key={format(day, 'yyyy-MM-dd')} 
                  variant="outline" 
                  className="border-gray-300 text-gray-700 bg-white"
                >
                  {format(day, 'dd/MM', { locale: fr })}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
