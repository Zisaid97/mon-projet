import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DateRangePicker } from '@/components/DateRangePicker';
import { useMetaAttributions, MetaAttribution, SyncStatus } from '@/hooks/useMetaAttributions';
import { useDateRange } from '@/contexts/DateRangeContext';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Zap, Globe, Package, AlertTriangle, RefreshCw, CheckCircle, XCircle, Play } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export const AutoSpendAttributionDisplay = () => {
  const [attributions, setAttributions] = useState<MetaAttribution[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({ status: null, lastSyncAt: null });
  const [isGenerating, setIsGenerating] = useState(false);

  const { dateRange } = useDateRange();
  const { user, hydrated } = useAuth();
  const { getAttributions, getSyncStatus, error, clearError, processMetaData } = useMetaAttributions();

  // Memoiser les dates pour éviter les re-renders inutiles
  const dateParams = useMemo(() => {
    if (!dateRange?.start || !dateRange?.end) {
      return null;
    }
    return {
      startDate: format(dateRange.start, 'yyyy-MM-dd'),
      endDate: format(dateRange.end, 'yyyy-MM-dd')
    };
  }, [dateRange?.start, dateRange?.end]);

  // Fonction de chargement stable
  const loadData = useCallback(async () => {
    // Attendre que l'état d'authentification soit hydraté
    if (!hydrated) {
      console.log('🔄 En attente de l\'hydratation de l\'authentification...');
      return;
    }

    // Vérifier que l'utilisateur est connecté
    if (!user?.id) {
      console.warn('❌ Utilisateur non connecté - impossible de charger les attributions');
      setAttributions([]);
      return;
    }

    // Vérifier que les paramètres de date sont disponibles
    if (!dateParams) {
      console.log('📅 Paramètres de date non disponibles');
      return;
    }
    
    // Éviter les chargements multiples
    if (loading) {
      console.log('⏳ Chargement déjà en cours, skip...');
      return;
    }
    
    try {
      setLoading(true);
      clearError();

      console.log(`🔍 Chargement des attributions Meta pour la période: ${dateParams.startDate} → ${dateParams.endDate}`);
      console.log(`👤 User ID: ${user.id}`);
      
      const attributionsData = await getAttributions(dateParams.startDate, dateParams.endDate, user.id);
      setAttributions(attributionsData || []);
      
      console.log(`📊 Attributions Meta chargées: ${attributionsData?.length || 0} entrées`);
    } catch (error) {
      console.error('❌ Erreur lors du chargement des attributions Meta:', error);
      setAttributions([]);
    } finally {
      setLoading(false);
    }
  }, [dateParams, getAttributions, clearError, loading, user?.id, hydrated]);

  // Chargement initial et sur changement de période
  useEffect(() => {
    // Éviter les appels multiples en attendant l'hydratation complète
    if (hydrated && user?.id && dateParams && !loading) {
      loadData();
    }
  }, [dateParams, user?.id, hydrated]);

  // Écouter les événements de rafraîchissement - AJOUT DE L'ÉVÉNEMENT DE SUPPRESSION
  useEffect(() => {
    const handleRefresh = () => {
      console.log('🔄 Événement de rafraîchissement reçu');
      if (!loading && user?.id && hydrated) {
        loadData();
      }
    };

    // Écouter tous les événements de synchronisation
    window.addEventListener('meta-attributions-updated', handleRefresh);
    window.addEventListener('attributions-updated', handleRefresh);
    window.addEventListener('ad-spending-deleted', handleRefresh); // NOUVEAU : écouter les suppressions
    window.addEventListener('ad-spending-updated', handleRefresh); // NOUVEAU : écouter les mises à jour

    return () => {
      window.removeEventListener('meta-attributions-updated', handleRefresh);
      window.removeEventListener('attributions-updated', handleRefresh);
      window.removeEventListener('ad-spending-deleted', handleRefresh);
      window.removeEventListener('ad-spending-updated', handleRefresh);
    };
  }, [loadData, loading, user?.id, hydrated]);

  // Agrégation des données par produit avec détail par pays (memoized)
  const aggregatedData = useMemo(() => {
    if (!attributions || attributions.length === 0) {
      return {
        productMap: {},
        globalTotalUsd: 0,
        globalTotalDh: 0,
        uniqueProducts: 0,
        uniqueCountries: 0
      };
    }

    const productMap: Record<string, {
      countries: Record<string, { usd: number; dh: number }>;
      totalUsd: number;
      totalDh: number;
    }> = {};

    let globalTotalUsd = 0;
    let globalTotalDh = 0;

    attributions.forEach(attr => {
      if (!productMap[attr.product]) {
        productMap[attr.product] = {
          countries: {},
          totalUsd: 0,
          totalDh: 0
        };
      }

      if (!productMap[attr.product].countries[attr.country]) {
        productMap[attr.product].countries[attr.country] = { usd: 0, dh: 0 };
      }

      productMap[attr.product].countries[attr.country].usd += attr.spend_usd;
      productMap[attr.product].countries[attr.country].dh += attr.spend_dh;
      productMap[attr.product].totalUsd += attr.spend_usd;
      productMap[attr.product].totalDh += attr.spend_dh;

      globalTotalUsd += attr.spend_usd;
      globalTotalDh += attr.spend_dh;
    });

    const uniqueProducts = Object.keys(productMap).length;
    const uniqueCountries = new Set(attributions.map(attr => attr.country)).size;

    return {
      productMap,
      globalTotalUsd,
      globalTotalDh,
      uniqueProducts,
      uniqueCountries
    };
  }, [attributions]);

  // Gestion du rafraîchissement manuel
  const handleRefresh = useCallback(() => {
    if (!loading && user?.id && hydrated) {
      loadData();
    }
  }, [loadData, loading, user?.id, hydrated]);

  // Générer les attributions manuellement pour la période sélectionnée
  const handleGenerateAttributions = useCallback(async () => {
    if (!user?.id || !dateParams) return;
    
    setIsGenerating(true);
    try {
      // Récupérer les données Meta Ads pour la période
      const { data: metaAdsData, error: fetchError } = await supabase
        .from('ad_spending_data')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', dateParams.startDate)
        .lte('date', dateParams.endDate);

      if (fetchError) throw fetchError;

      if (!metaAdsData || metaAdsData.length === 0) {
        throw new Error('Aucune donnée Meta Ads trouvée pour cette période');
      }

      // Détecter le mois et générer les attributions
      const targetMonth = format(new Date(dateParams.startDate), 'yyyy-MM');
      console.log(`🚀 Génération manuelle des attributions pour ${targetMonth}`, metaAdsData.length, 'lignes');
      
      const success = await processMetaData(metaAdsData, targetMonth);
      
      if (success) {
        // Recharger les données
        loadData();
      }
    } catch (error) {
      console.error('❌ Erreur lors de la génération manuelle:', error);
    } finally {
      setIsGenerating(false);
    }
  }, [user?.id, dateParams, processMetaData, loadData]);

  // Rendu du statut de synchronisation simplifié
  const renderSyncStatus = () => {
    if (!hydrated) {
      return (
        <Badge variant="outline" className="bg-gray-100 text-gray-600">
          <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
          Chargement...
        </Badge>
      );
    }

    if (!user?.id) {
      return (
        <Badge variant="outline" className="bg-red-100 text-red-700 border-red-300">
          <XCircle className="h-3 w-3 mr-1" />
          Non connecté
        </Badge>
      );
    }

    return (
      <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
        <CheckCircle className="h-3 w-3 mr-1" />
        Synchronisé automatiquement
      </Badge>
    );
  };

  // Affichage si pas d'utilisateur connecté et hydratation terminée
  if (hydrated && !user?.id) {
    return (
      <Card className="bg-red-50 border-red-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm text-red-600 flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Attribution Automatique Meta Ads
            </CardTitle>
            <div className="flex items-center gap-2">
              <DateRangePicker />
              {renderSyncStatus()}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-sm text-red-700">
            <XCircle className="h-4 w-4" />
            Utilisateur non connecté - impossible de charger les attributions
          </div>
        </CardContent>
      </Card>
    );
  }

  if (loading || !hydrated) {
    return (
      <Card className="bg-gray-50 border-dashed">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm text-gray-600 flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Attribution Automatique Meta Ads
            </CardTitle>
            <div className="flex items-center gap-2">
              <DateRangePicker />
              <RefreshCw className="h-4 w-4 animate-spin text-gray-400" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <RefreshCw className="h-4 w-4 animate-spin" />
            Chargement des attributions automatiques...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!attributions || attributions.length === 0) {
    return (
      <Card className="bg-gray-50 border-dashed">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm text-gray-600 flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Attribution Automatique Meta Ads
            </CardTitle>
            <div className="flex items-center gap-2">
              <DateRangePicker />
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                className="h-8"
                disabled={loading}
              >
                <RefreshCw className="h-3 w-3" />
              </Button>
              {renderSyncStatus()}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <p className="text-sm text-gray-500">
              Aucune dépense attribuée sur cette période.
            </p>
            
            <Button
              variant="default"
              size="sm"
              onClick={handleGenerateAttributions}
              disabled={isGenerating}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Génération en cours...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Générer les attributions automatiques
                </>
              )}
            </Button>
            
            <p className="text-xs text-gray-400">
              Cette action va récupérer les données Meta Ads de la période sélectionnée<br/>
              et générer automatiquement les attributions par produit et pays.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-green-50 to-blue-50 border-green-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm text-green-800 flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Attribution Automatique Meta Ads
          </CardTitle>
          <div className="flex items-center gap-2">
            <DateRangePicker />
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="h-8"
              disabled={loading}
            >
              <RefreshCw className="h-3 w-3" />
            </Button>
            {renderSyncStatus()}
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-300 rounded-md p-2 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Résumé global */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div className="bg-white p-3 rounded-lg border border-green-200 shadow-sm">
            <div className="text-gray-600 text-xs font-medium">Total USD</div>
            <div className="font-bold text-green-700 text-lg">
              ${aggregatedData.globalTotalUsd.toFixed(2)}
            </div>
          </div>
          <div className="bg-white p-3 rounded-lg border border-green-200 shadow-sm">
            <div className="text-gray-600 text-xs font-medium">Total MAD</div>
            <div className="font-bold text-green-700 text-lg">
              {aggregatedData.globalTotalDh.toLocaleString()} DH
            </div>
          </div>
          <div className="bg-white p-3 rounded-lg border border-blue-200 shadow-sm flex items-center gap-2">
            <Package className="h-4 w-4 text-blue-500" />
            <div>
              <div className="text-gray-600 text-xs font-medium">Produits</div>
              <div className="font-bold text-blue-700">{aggregatedData.uniqueProducts}</div>
            </div>
          </div>
          <div className="bg-white p-3 rounded-lg border border-purple-200 shadow-sm flex items-center gap-2">
            <Globe className="h-4 w-4 text-purple-500" />
            <div>
              <div className="text-gray-600 text-xs font-medium">Pays</div>
              <div className="font-bold text-purple-700">{aggregatedData.uniqueCountries}</div>
            </div>
          </div>
        </div>

        {/* Détail par produit avec pays */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-green-800 flex items-center gap-2">
            <Package className="h-4 w-4" />
            Répartition par produit :
          </h4>
          
          <div className="grid gap-3">
            {Object.entries(aggregatedData.productMap).map(([product, data]) => (
              <Card key={product} className="bg-white border-green-200 hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  {/* En-tête produit */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800 font-semibold">
                        {product}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {Object.keys(data.countries).length} pays
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-green-700">
                        {data.totalDh.toLocaleString()} DH
                      </div>
                      <div className="text-xs text-gray-500">
                        ${data.totalUsd.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  {/* Détail par pays */}
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(data.countries).map(([country, amounts]) => (
                      <div
                        key={country}
                        className="bg-gray-50 rounded-md px-3 py-2 border border-gray-200"
                      >
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs font-medium">
                            {country}
                          </Badge>
                          <div className="text-xs">
                            <div className="font-semibold text-gray-700">
                              {amounts.dh.toLocaleString()} DH
                            </div>
                            <div className="text-gray-500">
                              ${amounts.usd.toFixed(2)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Note informative */}
        <div className="bg-green-100 border border-green-300 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <Zap className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-green-700">
              <p className="font-medium">🔄 Synchronisation automatique active</p>
              <p className="mt-1 text-green-600">
                Les attributions se mettent à jour automatiquement quand vous modifiez ou supprimez des données dans Ad Spending. 
                Cette synchronisation maintient la cohérence entre les deux modules.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
