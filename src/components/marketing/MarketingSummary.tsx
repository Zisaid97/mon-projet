
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MonthlyResume } from "@/utils/marketingCalculations";
import { useMonthlyBonus } from "@/hooks/useMonthlyBonus";

interface MarketingSummaryProps {
  monthlyResume: MonthlyResume;
}

export function MarketingSummary({ monthlyResume }: MarketingSummaryProps) {
  const { bonus } = useMonthlyBonus();
  
  // Ajouter le bonus au bénéfice net total
  const totalNetProfitWithBonusMAD = monthlyResume.totalNetProfitMAD + bonus;
  const totalNetProfitWithBonusUSD = totalNetProfitWithBonusMAD / 10; // Using default exchange rate for display

  const getStatusBadge = (status: 'good' | 'bad') => {
    const className = status === 'good' 
      ? 'bg-green-100 text-green-800 border-green-200' 
      : 'bg-red-100 text-red-800 border-red-200';
    
    return (
      <Badge variant="secondary" className={className}>
        {status === 'good' ? '✅' : '❌'}
      </Badge>
    );
  };

  return (
    <Card className="bg-gradient-to-br from-blue-50 via-white to-violet-100">
      <CardHeader>
        <CardTitle className="text-xl text-blue-800 flex items-center gap-2">
          📈 Résumé Mensuel
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Totaux */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-white rounded-lg shadow-sm">
            <div className="text-2xl font-bold text-blue-600">
              {monthlyResume.totalSpend.toFixed(2)} $
            </div>
            <div className="text-sm text-gray-500">
              {monthlyResume.totalSpendMAD.toFixed(2)} DH
            </div>
            <div className="text-xs text-gray-400 mt-1">Dépenses Totales</div>
          </div>
          
          <div className="text-center p-4 bg-white rounded-lg shadow-sm">
            <div className="text-2xl font-bold text-orange-600">
              {monthlyResume.totalLeads}
            </div>
            <div className="text-xs text-gray-400 mt-1">Total Leads</div>
          </div>
          
          <div className="text-center p-4 bg-white rounded-lg shadow-sm">
            <div className="text-2xl font-bold text-green-600">
              {monthlyResume.totalDeliveries}
            </div>
            <div className="text-xs text-gray-400 mt-1">Total Livraisons</div>
          </div>
          
          <div className="text-center p-4 bg-white rounded-lg shadow-sm">
            <div className={`text-2xl font-bold ${totalNetProfitWithBonusMAD > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {totalNetProfitWithBonusUSD.toFixed(2)} $
            </div>
            <div className="text-sm text-gray-500">
              {totalNetProfitWithBonusMAD.toFixed(2)} DH
            </div>
            <div className="text-xs text-gray-400 mt-1">Bénéfice Net Total</div>
            {bonus > 0 && (
              <div className="text-xs text-purple-600 mt-1">
                (+ {bonus.toFixed(0)} DH bonus)
              </div>
            )}
          </div>
        </div>

        {/* Moyennes avec statuts */}
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-700 text-lg">Moyennes de Performance</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm">
              <div>
                <div className="font-medium text-gray-700">CPL Moyen</div>
                <div className="text-lg font-bold text-blue-600">
                  {monthlyResume.avgCPL.toFixed(2)} $
                </div>
                <div className="text-sm text-gray-500">
                  {monthlyResume.avgCPLMAD.toFixed(2)} DH
                </div>
              </div>
              {getStatusBadge(monthlyResume.avgCPLStatus)}
            </div>
            
            <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm">
              <div>
                <div className="font-medium text-gray-700">CPD Moyen</div>
                <div className="text-lg font-bold text-purple-600">
                  {monthlyResume.avgCPD.toFixed(2)} $
                </div>
                <div className="text-sm text-gray-500">
                  {monthlyResume.avgCPDMAD.toFixed(2)} DH
                </div>
              </div>
              {getStatusBadge(monthlyResume.avgCPDStatus)}
            </div>
            
            <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm">
              <div>
                <div className="font-medium text-gray-700">Taux de Livraison Moyen</div>
                <div className="text-lg font-bold text-green-600">
                  {monthlyResume.avgDeliveryRate.toFixed(1)} %
                </div>
              </div>
              {getStatusBadge(monthlyResume.avgDeliveryRateStatus)}
            </div>
          </div>
        </div>

        {/* Légende des performances */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h5 className="font-medium text-gray-700 mb-3">Critères de Performance :</h5>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-green-100 text-green-800">✅</Badge>
                <span>CPL &lt; 1.50 $</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-red-100 text-red-800">❌</Badge>
                <span>CPL ≥ 1.50 $</span>
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-green-100 text-green-800">✅</Badge>
                <span>CPD &lt; 15.00 $</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-red-100 text-red-800">❌</Badge>
                <span>CPD ≥ 15.00 $</span>
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-green-100 text-green-800">✅</Badge>
                <span>Taux &gt; 8.0 %</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-red-100 text-red-800">❌</Badge>
                <span>Taux ≤ 8.0 %</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
