
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Calendar, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface MetaSpendData {
  id: string;
  campaign_name: string;
  date: string;
  spend_mad: number;
  spend_usd: number;
  leads: number;
  impressions: number;
  clicks: number;
  synced_at: string;
}

interface DataSectionProps {
  spendData?: MetaSpendData[];
}

export const DataSection: React.FC<DataSectionProps> = ({ spendData }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: 'MAD'
    }).format(value);
  };

  const formatCurrencyUSD = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  const totalSpendMAD = spendData?.reduce((sum, item) => sum + (item.spend_mad || 0), 0) || 0;
  const totalSpendUSD = spendData?.reduce((sum, item) => sum + (item.spend_usd || 0), 0) || 0;
  const totalLeads = spendData?.reduce((sum, item) => sum + (item.leads || 0), 0) || 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Données Meta Ads Synchronisées
          </CardTitle>
          {spendData && spendData.length > 0 && (
            <Badge variant="outline" className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {spendData.length} campagnes
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {spendData && spendData.length > 0 ? (
          <div className="space-y-6">
            {/* Résumé des totaux */}
            <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{formatCurrency(totalSpendMAD)}</p>
                <p className="text-xs text-gray-600">Total MAD</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{formatCurrencyUSD(totalSpendUSD)}</p>
                <p className="text-xs text-gray-600">Total USD</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{totalLeads}</p>
                <p className="text-xs text-gray-600">Total Leads</p>
              </div>
            </div>

            {/* Liste des campagnes */}
            <div className="space-y-3">
              <h4 className="font-semibold text-sm text-gray-700">Dernières campagnes synchronisées:</h4>
              {spendData.slice(0, 5).map((spend) => (
                <div key={spend.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex-1">
                    <p className="font-medium">{spend.campaign_name}</p>
                    <div className="flex items-center gap-3 text-sm text-gray-600 mt-1">
                      <span>{format(new Date(spend.date), "dd MMM yyyy", { locale: fr })}</span>
                      <span>•</span>
                      <span>{spend.impressions?.toLocaleString()} impressions</span>
                      <span>•</span>
                      <span>{spend.clicks} clics</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatCurrency(spend.spend_mad)}</p>
                    <p className="text-sm text-gray-600">{spend.leads} leads</p>
                    {spend.synced_at && (
                      <p className="text-xs text-gray-400">
                        Sync: {format(new Date(spend.synced_at), "HH:mm", { locale: fr })}
                      </p>
                    )}
                  </div>
                </div>
              ))}
              {spendData.length > 5 && (
                <p className="text-center text-sm text-gray-500 py-2">
                  ... et {spendData.length - 5} autres campagnes
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <RefreshCw className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Aucune donnée synchronisée</p>
            <p className="text-sm text-gray-500">
              Configurez et connectez Meta Ads puis utilisez le bouton "Sync manuelle" pour voir vos données ici
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
