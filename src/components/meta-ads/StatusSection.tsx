
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, AlertCircle, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface StatusSectionProps {
  hasConfig: boolean;
}

export const StatusSection: React.FC<StatusSectionProps> = ({ hasConfig }) => {
  const [isSyncing, setIsSyncing] = useState(false);

  const handleManualSync = async () => {
    if (!hasConfig) {
      toast({
        title: "Configuration requise",
        description: "Veuillez d'abord configurer votre connexion Meta Ads",
        variant: "destructive",
      });
      return;
    }

    setIsSyncing(true);
    
    try {
      console.log('🔄 Déclenchement de la synchronisation manuelle...');
      
      const { data, error } = await supabase.functions.invoke('sync-meta-ads-data', {
        body: { 
          triggered_by: 'manual',
          timestamp: new Date().toISOString()
        }
      });

      if (error) {
        throw error;
      }

      console.log('✅ Synchronisation terminée:', data);
      
      toast({
        title: "Synchronisation réussie",
        description: `${data.successful_syncs}/${data.total_integrations} comptes synchronisés`,
      });

    } catch (error) {
      console.error('❌ Erreur synchronisation:', error);
      toast({
        title: "Erreur de synchronisation",
        description: "Impossible de synchroniser les données Meta Ads",
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5" />
          Statut de la Synchronisation
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Badge variant={hasConfig ? "default" : "secondary"}>
              {hasConfig ? "Configuré" : "Non configuré"}
            </Badge>
            <Badge variant="outline">
              Sync automatique: Minuit (UTC)
            </Badge>
          </div>
          
          <Button
            onClick={handleManualSync}
            disabled={!hasConfig || isSyncing}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            {isSyncing ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            {isSyncing ? 'Synchronisation...' : 'Sync manuelle'}
          </Button>
        </div>

        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-blue-900">Synchronisation automatique</h4>
              <p className="text-sm text-blue-700">
                Vos dépenses Meta Ads sont synchronisées automatiquement chaque jour à minuit (UTC).
                Les données apparaissent dans votre module Marketing et peuvent être utilisées pour l'attribution automatique des dépenses par produit/pays.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
