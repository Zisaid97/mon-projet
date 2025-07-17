
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AdSpendingData } from '@/hooks/useAdSpendingData';
import { coloredNumber } from '@/utils/marketingFormatters';
import { AdSpendingTableRow } from './AdSpendingTableRow';
import { AdSpendingEditModal } from './AdSpendingEditModal';
import { 
  ChevronDown, 
  ChevronUp, 
  Settings, 
  Trash2, 
  Edit, 
  AlertTriangle 
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface AdSpendingDayGroupProps {
  date: string;
  data: AdSpendingData[];
  onDelete: (date: string) => void;
  onEdit: (date: string, updatedData: AdSpendingData[]) => void;
}

export const AdSpendingDayGroup = ({ date, data, onDelete, onEdit }: AdSpendingDayGroupProps) => {
  const [isOpen, setIsOpen] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);

  // Calculs des métriques du jour
  const totalSpent = data.reduce((sum, item) => sum + item.amount_spent, 0);
  const totalLeads = data.reduce((sum, item) => sum + item.leads, 0);
  const totalClicks = data.reduce((sum, item) => sum + item.link_clicks, 0);
  const totalImpressions = data.reduce((sum, item) => sum + item.impressions, 0);
  
  const avgCPC = totalClicks > 0 ? totalSpent / totalClicks : 0;
  const avgCPM = totalImpressions > 0 ? (totalSpent / totalImpressions) * 1000 : 0;
  const avgCTR = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;

  // Indicateurs d'alerte
  const hasWarnings = totalLeads === 0 || avgCPC > 5;

  const handleDelete = () => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer toutes les données du ${new Date(date).toLocaleDateString('fr-FR')} ?`)) {
      onDelete(date);
    }
  };

  return (
    <>
      <Card className={`mb-4 ${hasWarnings ? 'border-orange-300' : ''}`}>
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="p-0 h-6 w-6">
                    {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </CollapsibleTrigger>
                
                <CardTitle className="text-lg">
                  {new Date(date).toLocaleDateString('fr-FR')}
                </CardTitle>
                
                {hasWarnings && (
                  <Badge variant="destructive" className="flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Attention
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-4">
                {/* Résumé rapide */}
                <div className="hidden md:flex items-center gap-4 text-sm text-gray-600">
                  <span>Dépenses: {coloredNumber(totalSpent, 2, 'success')}$</span>
                  <span>Prospects: {coloredNumber(totalLeads, 0, 'info')}</span>
                  <span>CPC: {coloredNumber(avgCPC, 2, avgCPC > 5 ? 'danger' : 'plain')}$</span>
                </div>

                {/* Menu actions */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setShowEditModal(true)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Modifier les données
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Supprimer la journée
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Métriques détaillées */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4 pt-4 border-t">
              <div className="text-center">
                <div className="text-sm text-gray-500">Dépenses</div>
                <div className="font-semibold text-green-600">{totalSpent.toFixed(2)}$</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-500">Prospects</div>
                <div className="font-semibold">{totalLeads}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-500">Clics</div>
                <div className="font-semibold">{totalClicks}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-500">CPC Moy.</div>
                <div className={`font-semibold ${avgCPC > 5 ? 'text-red-600' : ''}`}>
                  {avgCPC.toFixed(2)}$
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-500">CPM</div>
                <div className="font-semibold">{avgCPM.toFixed(2)}$</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-500">CTR</div>
                <div className="font-semibold">{avgCTR.toFixed(2)}%</div>
              </div>
            </div>
          </CardHeader>

          <CollapsibleContent>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Compte</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Campagne</th>
                      <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase">Impressions</th>
                      <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase">Clics</th>
                      <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase">CPC</th>
                      <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase">Dépensé</th>
                      <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase">Prospects</th>
                      <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase">CTR</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {data.map((row, index) => (
                      <AdSpendingTableRow
                        key={`${date}-${row.id || index}-${row.campaign_name}`}
                        row={row}
                        index={index}
                        hideDate={true}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      <AdSpendingEditModal
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        date={date}
        data={data}
        onSave={(updatedData) => {
          onEdit(date, updatedData);
          setShowEditModal(false);
        }}
      />
    </>
  );
};
