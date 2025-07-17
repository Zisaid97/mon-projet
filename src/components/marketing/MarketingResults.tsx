
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { type MarketingResults as MarketingResultsType } from "@/utils/marketingCalculations";

interface MarketingResultsProps {
  results: MarketingResultsType;
}

const MetricCard = ({ 
  title, 
  value, 
  valueMAD, 
  unit, 
  status, 
  icon 
}: {
  title: string;
  value: number;
  valueMAD?: number;
  unit: string;
  status: 'good' | 'bad';
  icon: string;
}) => {
  const statusColor = status === 'good' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200';
  const valueColor = status === 'good' ? 'text-green-600' : 'text-red-600';
  
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
          <span>{icon}</span>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className={`text-2xl font-bold ${valueColor}`}>
            {value.toFixed(2)} {unit}
          </div>
          {valueMAD !== undefined && (
            <div className="text-sm text-gray-500">
              {valueMAD.toFixed(2)} DH
            </div>
          )}
          <Badge variant="secondary" className={statusColor}>
            {status === 'good' ? '✅ Bon' : '❌ Amélioration nécessaire'}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};

export function MarketingResults({ results }: MarketingResultsProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="CPL (Coût par Lead)"
          value={results.cpl}
          valueMAD={results.cplMAD}
          unit="$"
          status={results.cplStatus}
          icon="👥"
        />
        
        <MetricCard
          title="CPD (Coût par Livraison)"
          value={results.cpd}
          valueMAD={results.cpdMAD}
          unit="$"
          status={results.cpdStatus}
          icon="📦"
        />
        
        <MetricCard
          title="Taux de Livraison"
          value={results.deliveryRate}
          unit="%"
          status={results.deliveryRateStatus}
          icon="📈"
        />
        
        <MetricCard
          title="Bénéfice Net"
          value={results.netProfit}
          valueMAD={results.netProfitMAD}
          unit="$"
          status={results.netProfitStatus}
          icon="💰"
        />
      </div>
      
      {/* Résumé des bénéfices */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-blue-800">📊 Résumé Financier</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Bénéfice Brut :</span>
                <div className="text-right">
                  <div className="font-semibold text-green-600">
                    {results.grossProfit.toFixed(2)} $
                  </div>
                  <div className="text-sm text-gray-500">
                    {results.grossProfitMAD.toFixed(2)} DH
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Dépenses :</span>
                <div className="text-right">
                  <div className="font-semibold text-red-600">
                    -{(results.grossProfit - results.netProfit).toFixed(2)} $
                  </div>
                  <div className="text-sm text-gray-500">
                    -{(results.grossProfitMAD - results.netProfitMAD).toFixed(2)} DH
                  </div>
                </div>
              </div>
              
              <hr className="my-2" />
              
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-800">Bénéfice Net :</span>
                <div className="text-right">
                  <div className={`font-bold text-lg ${results.netProfitStatus === 'good' ? 'text-green-600' : 'text-red-600'}`}>
                    {results.netProfit.toFixed(2)} $
                  </div>
                  <div className="text-sm text-gray-500">
                    {results.netProfitMAD.toFixed(2)} DH
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium text-gray-700">Seuils de Performance :</h4>
              <div className="text-sm space-y-1 text-gray-600">
                <div>• CPL excellent : &lt; 1.00 $</div>
                <div>• CPD excellent : &lt; 10.00 $</div>
                <div>• Taux de livraison bon : &gt; 10 %</div>
                <div>• Bénéfice net positif requis</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
