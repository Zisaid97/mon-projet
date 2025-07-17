
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MetaAttribution } from '@/hooks/useMetaAttributions';
import { useProductCountryDeliveries, ProductCountryDelivery } from '@/hooks/useProductCountryDeliveries';
import { useProducts } from '@/hooks/useProducts';
import { useRealTimeAttributions } from '@/hooks/useRealTimeAttributions';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar, DollarSign, MapPin, Package, TrendingUp, Edit3, Check, X, BarChart3 } from 'lucide-react';

interface AttributionDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: string;
  country: string;
  data: MetaAttribution[];
}

export const AttributionDetailModal: React.FC<AttributionDetailModalProps> = ({
  isOpen,
  onClose,
  product,
  country,
  data
}) => {
  const [deliveries, setDeliveries] = useState<ProductCountryDelivery[]>([]);
  const [editingDate, setEditingDate] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  const { getDeliveries, updateDeliveries, loading } = useProductCountryDeliveries();
  const { data: products } = useProducts();
  const { triggerUpdate } = useRealTimeAttributions();

  // Charger les livraisons existantes
  useEffect(() => {
    if (isOpen && data.length > 0) {
      const dates = data.map(item => item.date);
      getDeliveries(product, country, dates).then(setDeliveries);
    }
  }, [isOpen, product, country, data, getDeliveries, refreshTrigger]);

  // Obtenir la marge par livraison du produit
  const productData = products?.find(p => p.name === product);
  const marginPerDelivery = productData?.cpd_category || 150; // Valeur par défaut

  // Calculer les métriques de rentabilité
  const totalUsd = data.reduce((sum, item) => sum + item.spend_usd, 0);
  const totalDh = data.reduce((sum, item) => sum + item.spend_dh, 0);
  const totalDeliveries = deliveries.reduce((sum, item) => sum + item.deliveries, 0);
  const totalRevenue = totalDeliveries * marginPerDelivery;
  const netProfit = totalRevenue - totalDh;
  const roi = totalDh > 0 ? ((netProfit / totalDh) * 100) : 0;
  const cpd = totalDeliveries > 0 ? (totalDh / totalDeliveries) : 0;

  // Fonctions d'édition
  const handleEditStart = (date: string, currentValue: number) => {
    setEditingDate(date);
    setEditValue(currentValue.toString());
  };

  const handleEditSave = async () => {
    if (!editingDate) return;
    
    const newValue = parseInt(editValue) || 0;
    
    try {
      await updateDeliveries(product, country, editingDate, newValue);
      
      // Déclencher la mise à jour en temps réel
      triggerUpdate({
        type: 'delivery_update',
        productCountry: { product, country },
        timestamp: Date.now()
      });
      
      setEditingDate(null);
      setEditValue('');
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };

  const handleEditCancel = () => {
    setEditingDate(null);
    setEditValue('');
  };

  // Obtenir les livraisons pour une date donnée
  const getDeliveriesForDate = (date: string) => {
    const delivery = deliveries.find(d => d.date === date);
    return delivery?.deliveries || 0;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-blue-600" />
            Détails pour {product} - {country}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Résumé avec métriques de rentabilité */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Package className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">Total Livraisons</span>
                </div>
                <div className="text-2xl font-bold text-blue-700">{totalDeliveries}</div>
              </CardContent>
            </Card>

            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">Revenu Généré</span>
                </div>
                <div className="text-xl font-bold text-green-700">{totalRevenue.toLocaleString()} DH</div>
              </CardContent>
            </Card>

            <Card className="bg-purple-50 border-purple-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-800">Profit Net</span>
                </div>
                <div className={`text-xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {netProfit.toLocaleString()} DH
                </div>
                <div className="text-xs text-purple-600">
                  ROI: {roi.toFixed(1)}%
                </div>
              </CardContent>
            </Card>

            <Card className="bg-orange-50 border-orange-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-4 w-4 text-orange-600" />
                  <span className="text-sm font-medium text-orange-800">CPD Moyen</span>
                </div>
                <div className="text-xl font-bold text-orange-700">
                  {cpd > 0 ? `${cpd.toFixed(2)} DH` : '—'}
                </div>
                <div className="text-xs text-orange-600">
                  Dépenses: {totalDh.toLocaleString()} DH
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Historique des attributions avec livraisons éditables */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Historique des attributions avec livraisons ({data.length} entrée{data.length > 1 ? 's' : ''})
            </h3>

            <div className="space-y-3">
              {data.map((attribution) => {
                const deliveriesForDate = getDeliveriesForDate(attribution.date);
                const isEditing = editingDate === attribution.date;
                const dayRevenue = deliveriesForDate * marginPerDelivery;
                const dayProfit = dayRevenue - attribution.spend_dh;
                const dayROI = attribution.spend_dh > 0 ? ((dayProfit / attribution.spend_dh) * 100) : 0;
                
                return (
                  <Card key={attribution.id} className="border-gray-200 hover:border-blue-300 transition-colors">
                    <CardContent className="p-4">
                      <div className="grid grid-cols-1 lg:grid-cols-6 gap-4 items-center">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Calendar className="h-3 w-3 text-gray-500" />
                            <span className="text-xs text-gray-500">Date</span>
                          </div>
                          <div className="font-medium">
                            {format(new Date(attribution.date), 'dd/MM/yyyy', { locale: fr })}
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Package className="h-3 w-3 text-gray-500" />
                            <span className="text-xs text-gray-500">Livraisons</span>
                          </div>
                          {isEditing ? (
                            <div className="flex items-center gap-1">
                              <Input
                                type="number"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                className="w-16 h-8 text-sm"
                                min="0"
                                autoFocus
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleEditSave();
                                  if (e.key === 'Escape') handleEditCancel();
                                }}
                              />
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={handleEditSave}
                                disabled={loading}
                                className="h-7 w-7 p-0"
                              >
                                <Check className="h-3 w-3 text-green-600" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={handleEditCancel}
                                className="h-7 w-7 p-0"
                              >
                                <X className="h-3 w-3 text-red-500" />
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 group">
                              <span className="font-medium text-blue-600">
                                {deliveriesForDate}
                              </span>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleEditStart(attribution.date, deliveriesForDate)}
                                className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Edit3 className="h-2 w-2" />
                              </Button>
                            </div>
                          )}
                        </div>

                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <DollarSign className="h-3 w-3 text-gray-500" />
                            <span className="text-xs text-gray-500">Dépenses</span>
                          </div>
                          <div className="font-medium text-red-600">
                            {attribution.spend_dh.toLocaleString()} DH
                          </div>
                          <div className="text-xs text-gray-500">
                            ${attribution.spend_usd.toFixed(2)}
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <TrendingUp className="h-3 w-3 text-gray-500" />
                            <span className="text-xs text-gray-500">Revenu</span>
                          </div>
                          <div className="font-medium text-green-600">
                            {dayRevenue.toLocaleString()} DH
                          </div>
                          <div className="text-xs text-gray-500">
                            {marginPerDelivery}DH × {deliveriesForDate}
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <BarChart3 className="h-3 w-3 text-gray-500" />
                            <span className="text-xs text-gray-500">Profit</span>
                          </div>
                          <div className={`font-medium ${dayProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {dayProfit.toLocaleString()} DH
                          </div>
                          <div className="text-xs text-gray-500">
                            ROI: {dayROI.toFixed(1)}%
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Calendar className="h-3 w-3 text-gray-500" />
                            <span className="text-xs text-gray-500">Importé</span>
                          </div>
                          <div className="text-xs text-gray-600">
                            {format(new Date(attribution.created_at), 'dd/MM HH:mm', { locale: fr })}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Informations techniques */}
          <Card className="bg-gray-50 border-gray-200">
            <CardContent className="p-4">
              <h4 className="font-medium mb-2 text-gray-700">ℹ️ Informations sur l'analyse de rentabilité</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p>• <strong>Marge par livraison:</strong> {marginPerDelivery} DH (configurée dans la base de données produits)</p>
                <p>• <strong>Calcul du profit:</strong> (Livraisons × Marge) - Dépenses marketing</p>
                <p>• <strong>ROI:</strong> (Profit Net ÷ Dépenses) × 100</p>
                <p>• <strong>CPD:</strong> Dépenses totales ÷ Nombre de livraisons</p>
                <p>• Cliquez sur l'icône d'édition pour modifier le nombre de livraisons par date</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};
