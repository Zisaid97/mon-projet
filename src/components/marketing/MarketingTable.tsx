
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { EditableCell } from './EditableCell';
import { EditableMarginCell } from './EditableMarginCell';
import { EditableSpendingCell } from './EditableSpendingCell';
import { MarketingTableFooter } from './MarketingTableFooter';
import { DeliveryImportModal } from './DeliveryImportModal';
import { coloredNumber } from '@/utils/marketingFormatters';
import { MarketingData } from '@/types/marketing';
import { Trash2, RefreshCw, Archive, Upload } from 'lucide-react';
import { useDateRange } from '@/contexts/DateRangeContext';
import { Badge } from '@/components/ui/badge';
import { useExchangeRateSync } from '@/hooks/useExchangeRateSync';

interface MarketingTableProps {
  data: MarketingData[];
  onUpdate: (id: string, field: string, value: number) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  isUpdating: boolean;
  exchangeRate: number;
}

interface DeliveryData {
  date: string;
  deliveries: number;
}

export const MarketingTable: React.FC<MarketingTableProps> = ({
  data,
  onUpdate,
  onDelete,
  isUpdating,
  exchangeRate // Gardé pour compatibilité mais pas utilisé
}) => {
  const { dateRange } = useDateRange();
  const [importModalOpen, setImportModalOpen] = useState(false);
  
  // ✅ CORRECTION: Utiliser toujours le taux moyen mensuel de la page Finance
  const { monthlyAverageRate } = useExchangeRateSync();
  const activeExchangeRate = monthlyAverageRate || 10.0;

  const handleSpendingUpdate = async (id: string, newSpendDH: number) => {
    // Convert DH to USD for storage using monthly average rate
    const newSpendUSD = newSpendDH / activeExchangeRate;
    await onUpdate(id, 'spend_usd', newSpendUSD);
  };

  const handleMarginUpdate = async (id: string, newMarginDH: number) => {
    // CORRECTION : La marge est maintenant stockée directement en DH
    await onUpdate(id, 'margin_per_order', newMarginDH);
  };

  const handleDeliveryImport = async (deliveries: DeliveryData[]) => {
    // Group data by date for faster lookup
    const deliveryMap = new Map(deliveries.map(d => [d.date, d.deliveries]));
    
    // Update each matching marketing data entry
    const updatePromises = data
      .filter(item => deliveryMap.has(item.date))
      .map(item => {
        const newDeliveries = deliveryMap.get(item.date)!;
        return onUpdate(item.id, 'deliveries', newDeliveries);
      });

    await Promise.all(updatePromises);
  };

  // Fonction pour recalculer une ligne complète
  const recalculateRow = (item: MarketingData) => {
    // ✅ CORRECTION: Utiliser le taux moyen mensuel pour tous les calculs
    const spendDH = item.spend_usd * activeExchangeRate;
    // CORRECTION : La marge est maintenant directement en DH dans la base
    const marginDH = item.margin_per_order;
    
    // Calculs indépendants par jour
    const cpl = item.leads > 0 ? item.spend_usd / item.leads : 0;
    const cpd = item.deliveries > 0 ? item.spend_usd / item.deliveries : 0;
    
    // CORRECTION : Profit Net = (Marge DH × Livraisons) - Dépenses DH
    const totalRevenueDH = item.deliveries * marginDH;
    const profitNetDH = totalRevenueDH - spendDH;

    return {
      spendDH,
      marginDH,
      cpl,
      cpd,
      profitNetDH,
      totalRevenueDH
    };
  };

  return (
    <>
      <div className="overflow-x-auto">
        <div className="mb-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold text-gray-900">📊 Historique des Performances</h3>
            {dateRange.isArchive && (
              <Badge variant="secondary" className="bg-orange-100 text-orange-700 flex items-center gap-1">
                <Archive className="h-3 w-3" />
                Archive - {dateRange.label}
              </Badge>
            )}
          </div>
          <div className="text-sm text-gray-600">
            {dateRange.isArchive ? (
              <span className="text-orange-600">⚠️ Données archivées (lecture seule)</span>
            ) : (
              <span>ℹ️ Tous les calculs sont indépendants par jour</span>
            )}
          </div>
        </div>
        
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Dépenses (DH)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Dépenses ($)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Leads
              </th>
              <th 
                className={`px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider ${
                  !dateRange.isArchive ? 'cursor-pointer hover:bg-gray-100 flex items-center gap-2' : ''
                }`}
                onClick={() => !dateRange.isArchive && setImportModalOpen(true)}
                title={!dateRange.isArchive ? "Cliquer pour importer les livraisons" : ""}
              >
                Livraisons
                {!dateRange.isArchive && (
                  <Upload className="h-3 w-3 text-blue-500" />
                )}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Taux Livraison
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Marge/CMD (DH)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                CPL ($)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                CPD ($)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Profit Net (DH)
              </th>
              {!dateRange.isArchive && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {data.map((item) => {
              const calculations = recalculateRow(item);
              
              return (
                <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {new Date(item.date).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {dateRange.isArchive ? (
                      <span className="font-mono">{calculations.spendDH.toFixed(2)} DH</span>
                    ) : (
                      <EditableSpendingCell
                        value={calculations.spendDH}
                        onSave={(newValue) => handleSpendingUpdate(item.id, newValue)}
                        isUpdating={isUpdating}
                      />
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {coloredNumber(item.spend_usd, 2, "muted")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {dateRange.isArchive ? (
                      <span>{item.leads}</span>
                    ) : (
                      <EditableCell
                        value={item.leads}
                        onSave={(newValue) => onUpdate(item.id, 'leads', newValue)}
                        isUpdating={isUpdating}
                      />
                    )}
                  </td>
                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                     {dateRange.isArchive ? (
                       <span>{item.deliveries}</span>
                     ) : (
                       <EditableCell
                         value={item.deliveries}
                         onSave={(newValue) => onUpdate(item.id, 'deliveries', newValue)}
                         isUpdating={isUpdating}
                       />
                     )}
                   </td>
                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                     {(() => {
                       const deliveryRate = item.leads > 0 ? (item.deliveries / item.leads) * 100 : 0;
                       return (
                         <span className={`font-medium ${deliveryRate < 8 ? 'text-red-600' : deliveryRate > 15 ? 'text-green-600' : 'text-yellow-600'}`}>
                           {deliveryRate.toFixed(1)}%
                         </span>
                       );
                     })()}
                   </td>
                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {dateRange.isArchive ? (
                      <span className="font-mono">{item.margin_per_order.toFixed(2)} DH</span>
                    ) : (
                      <EditableMarginCell
                        value={item.margin_per_order}
                        onSave={(newValue) => handleMarginUpdate(item.id, newValue)}
                        isUpdating={isUpdating}
                        exchangeRate={activeExchangeRate}
                      />
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    <span className={`font-medium ${calculations.cpl > 1.5 ? 'text-red-600' : 'text-green-600'}`}>
                      {calculations.cpl.toFixed(2)}$
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    <span className={`font-medium ${calculations.cpd > 15 ? 'text-red-600' : 'text-green-600'}`}>
                      {calculations.cpd.toFixed(2)}$
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    <div className="flex flex-col">
                      <span className={`font-bold ${calculations.profitNetDH > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {calculations.profitNetDH.toFixed(0)} DH
                      </span>
                      <span className="text-xs text-gray-500">
                        Revenus: {calculations.totalRevenueDH.toFixed(0)} DH
                      </span>
                    </div>
                  </td>
                  {!dateRange.isArchive && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            // Force un recalcul en mettant à jour la marge avec la même valeur
                            handleMarginUpdate(item.id, item.margin_per_order);
                          }}
                          disabled={isUpdating}
                          title="Recalculer cette ligne"
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => onDelete(item.id)}
                          disabled={isUpdating}
                          title="Supprimer cette ligne"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
          <MarketingTableFooter data={data} exchangeRate={activeExchangeRate} />
        </table>
        
        {data.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            {dateRange.isArchive ? (
              <div className="flex flex-col items-center gap-2">
                <Archive className="h-8 w-8 text-gray-400" />
                <p>Aucune donnée archivée pour cette période</p>
              </div>
            ) : (
              <p>Aucune donnée pour le mois actuel</p>
            )}
          </div>
        )}
      </div>

      <DeliveryImportModal
        open={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        onImport={handleDeliveryImport}
        isUpdating={isUpdating}
      />
    </>
  );
};
