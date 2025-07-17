
import React, { useMemo, useState } from 'react';
import { AdSpendingData } from '@/hooks/useAdSpendingData';
import { AdSpendingDayGroup } from './AdSpendingDayGroup';
import { AdSpendingKpiSummary } from './AdSpendingKpiSummary';
import { useAdSpendingCrud } from '@/hooks/useAdSpendingCrud';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Calendar, BarChart3 } from 'lucide-react';

interface AdSpendingGroupedViewProps {
  data: AdSpendingData[];
  onDataChange: () => void;
}

export const AdSpendingGroupedView = ({ data, onDataChange }: AdSpendingGroupedViewProps) => {
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  const [showGlobalKpis, setShowGlobalKpis] = useState(true);
  const { deleteDay, updateDay, loading } = useAdSpendingCrud();

  // Grouper les données par date
  const groupedData = useMemo(() => {
    const groups: { [key: string]: AdSpendingData[] } = {};
    
    data.forEach(item => {
      const date = item.date;
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(item);
    });

    // Filtrer les jours actifs si nécessaire
    if (showActiveOnly) {
      Object.keys(groups).forEach(date => {
        const dayData = groups[date];
        const hasActivity = dayData.some(item => 
          item.leads > 0 || item.amount_spent > 0 || item.link_clicks > 0
        );
        if (!hasActivity) {
          delete groups[date];
        }
      });
    }

    // Trier par date décroissante
    const sortedDates = Object.keys(groups).sort((a, b) => 
      new Date(b).getTime() - new Date(a).getTime()
    );

    return sortedDates.map(date => ({
      date,
      data: groups[date]
    }));
  }, [data, showActiveOnly]);

  const handleDelete = async (date: string) => {
    const success = await deleteDay(date);
    if (success) {
      onDataChange();
    }
  };

  const handleEdit = async (date: string, updatedData: AdSpendingData[]) => {
    const success = await updateDay(date, updatedData);
    if (success) {
      onDataChange();
    }
  };

  return (
    <div className="space-y-6">
      {/* Contrôles */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium">Vue par jour</span>
          <span className="text-xs text-gray-500">
            ({groupedData.length} jour{groupedData.length > 1 ? 's' : ''})
          </span>
        </div>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="global-kpis"
              checked={showGlobalKpis}
              onCheckedChange={setShowGlobalKpis}
            />
            <Label htmlFor="global-kpis" className="text-sm">
              📊 Résumé global
            </Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="active-only"
              checked={showActiveOnly}
              onCheckedChange={setShowActiveOnly}
            />
            <Label htmlFor="active-only" className="text-sm">
              📅 Jours actifs uniquement
            </Label>
          </div>
        </div>
      </div>

      {/* KPIs globaux */}
      {showGlobalKpis && data.length > 0 && (
        <AdSpendingKpiSummary 
          data={data} 
          title="📈 Résumé global de toutes les données"
        />
      )}

      {/* Groupes par jour */}
      {groupedData.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium mb-2">Aucune donnée trouvée</h3>
          <p>
            {showActiveOnly 
              ? "Aucun jour actif trouvé. Désactivez le filtre pour voir tous les jours."
              : "Importez d'abord un fichier Meta Ads pour voir les données."
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {groupedData.map(({ date, data: dayData }) => (
            <div key={date} className="space-y-4">
              {/* KPI du jour */}
              <AdSpendingKpiSummary 
                data={dayData} 
                title={`📅 ${new Date(date).toLocaleDateString('fr-FR')}`}
              />
              
              {/* Détails du jour */}
              <AdSpendingDayGroup
                date={date}
                data={dayData}
                onDelete={handleDelete}
                onEdit={handleEdit}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
