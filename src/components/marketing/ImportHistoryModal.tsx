
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { History, FileText, Calendar, TrendingUp, AlertCircle } from 'lucide-react';

interface ImportHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  dateRange: { startDate: string; endDate: string } | null;
}

interface ImportData {
  date: string;
  campaign_name: string;
  amount_spent: number;
  leads: number;
  created_at: string;
  account_name: string;
}

export const ImportHistoryModal: React.FC<ImportHistoryModalProps> = ({
  isOpen,
  onClose,
  dateRange
}) => {
  const [imports, setImports] = useState<ImportData[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  // Charger l'historique des imports
  useEffect(() => {
    if (!isOpen || !user?.id || !dateRange) return;

    const loadImportHistory = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('ad_spending_data')
          .select('date, campaign_name, amount_spent, leads, created_at, account_name')
          .eq('user_id', user.id)
          .gte('date', dateRange.startDate)
          .lte('date', dateRange.endDate)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setImports(data || []);
      } catch (error) {
        console.error('Erreur lors du chargement de l\'historique:', error);
      } finally {
        setLoading(false);
      }
    };

    loadImportHistory();
  }, [isOpen, user?.id, dateRange]);

  // Grouper les imports par date d'import
  const groupedImports = imports.reduce((acc, item) => {
    const importDate = format(new Date(item.created_at), 'yyyy-MM-dd');
    if (!acc[importDate]) {
      acc[importDate] = [];
    }
    acc[importDate].push(item);
    return acc;
  }, {} as Record<string, ImportData[]>);

  // Statistiques globales
  const totalSpent = imports.reduce((sum, item) => sum + item.amount_spent, 0);
  const totalLeads = imports.reduce((sum, item) => sum + item.leads, 0);
  const uniqueCampaigns = new Set(imports.map(item => item.campaign_name)).size;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5 text-blue-600" />
            Historique des imports Meta Ads
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">Chargement de l'historique...</span>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Statistiques globales */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">Total dépensé</span>
                  </div>
                  <div className="text-lg font-bold text-blue-700">${totalSpent.toFixed(2)}</div>
                </CardContent>
              </Card>

              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">Total leads</span>
                  </div>
                  <div className="text-lg font-bold text-green-700">{totalLeads}</div>
                </CardContent>
              </Card>

              <Card className="bg-purple-50 border-purple-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-4 w-4 text-purple-600" />
                    <span className="text-sm font-medium text-purple-800">Campagnes</span>
                  </div>
                  <div className="text-lg font-bold text-purple-700">{uniqueCampaigns}</div>
                </CardContent>
              </Card>

              <Card className="bg-orange-50 border-orange-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4 text-orange-600" />
                    <span className="text-sm font-medium text-orange-800">Imports</span>
                  </div>
                  <div className="text-lg font-bold text-orange-700">{Object.keys(groupedImports).length}</div>
                </CardContent>
              </Card>
            </div>

            {/* Période analysée */}
            {dateRange && (
              <Card className="bg-gray-50 border-gray-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">
                      Période analysée : du {format(new Date(dateRange.startDate), 'dd MMMM yyyy', { locale: fr })} 
                      au {format(new Date(dateRange.endDate), 'dd MMMM yyyy', { locale: fr })}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Historique des imports */}
            {Object.keys(groupedImports).length === 0 ? (
              <Card className="border-dashed border-gray-300">
                <CardContent className="p-8 text-center">
                  <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-700 mb-2">Aucun import trouvé</h3>
                  <p className="text-gray-500">
                    Aucune donnée Meta Ads n'a été importée pour cette période.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Détail des imports ({Object.keys(groupedImports).length} session{Object.keys(groupedImports).length > 1 ? 's' : ''})
                </h3>

                {Object.entries(groupedImports)
                  .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
                  .map(([importDate, items]) => {
                    const sessionTotal = items.reduce((sum, item) => sum + item.amount_spent, 0);
                    const sessionLeads = items.reduce((sum, item) => sum + item.leads, 0);

                    return (
                      <Card key={importDate} className="border-gray-200">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <Badge variant="outline" className="bg-blue-100 text-blue-800">
                                📅 {format(new Date(importDate), 'dd MMMM yyyy', { locale: fr })}
                              </Badge>
                              <Badge variant="outline">
                                {items.length} ligne{items.length > 1 ? 's' : ''}
                              </Badge>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-medium">${sessionTotal.toFixed(2)}</div>
                              <div className="text-xs text-gray-500">{sessionLeads} leads</div>
                            </div>
                          </div>

                          <div className="space-y-2">
                            {items.slice(0, 5).map((item, index) => (
                              <div key={index} className="bg-gray-50 p-3 rounded border">
                                <div className="flex items-center justify-between">
                                  <div className="flex-1">
                                    <div className="font-medium text-sm text-gray-800">
                                      {item.campaign_name}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      {item.account_name} • {format(new Date(item.date), 'dd/MM/yyyy')}
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-sm font-medium">${item.amount_spent.toFixed(2)}</div>
                                    <div className="text-xs text-gray-500">{item.leads} leads</div>
                                  </div>
                                </div>
                              </div>
                            ))}
                            
                            {items.length > 5 && (
                              <div className="text-center text-sm text-gray-500 pt-2">
                                ... et {items.length - 5} autre{items.length - 5 > 1 ? 's' : ''} ligne{items.length - 5 > 1 ? 's' : ''}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
              </div>
            )}

            {/* Note informative */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-700">
                    <p className="font-medium mb-1">ℹ️ À propos de cet historique</p>
                    <ul className="space-y-1 text-blue-600 text-xs">
                      <li>• Affiche tous les fichiers Meta Ads importés pour la période</li>
                      <li>• Chaque import génère automatiquement des attributions par produit/pays</li>
                      <li>• Les montants sont en USD (devise d'origine Meta Ads)</li>
                      <li>• Seules les campagnes avec format reconnu sont attribuées</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
