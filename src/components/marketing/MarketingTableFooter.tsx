
import React from 'react';
import { MarketingData } from '@/types/marketing';

interface MarketingTableFooterProps {
  data: MarketingData[];
  exchangeRate: number;
}

export const MarketingTableFooter: React.FC<MarketingTableFooterProps> = ({
  data,
  exchangeRate
}) => {
  // Calculs des totaux avec la logique corrigée
  const calculateTotals = () => {
    if (data.length === 0) {
      return {
        totalSpendDH: 0,
        totalSpendUSD: 0,
        totalLeads: 0,
        totalDeliveries: 0,
        totalRevenueDH: 0,
        totalProfitNetDH: 0,
        avgCPL: 0,
        avgCPD: 0,
        deliveryRate: 0
      };
    }

    const totalSpendUSD = data.reduce((sum, item) => sum + item.spend_usd, 0);
    const totalSpendDH = totalSpendUSD * exchangeRate;
    const totalLeads = data.reduce((sum, item) => sum + item.leads, 0);
    const totalDeliveries = data.reduce((sum, item) => sum + item.deliveries, 0);
    
    // CORRECTION : Calcul du revenu total avec marge directe en DH
    const totalRevenueDH = data.reduce((sum, item) => {
      // margin_per_order est maintenant directement en DH
      const marginDH = item.margin_per_order;
      return sum + (item.deliveries * marginDH);
    }, 0);
    
    // Profit Net = Revenus - Dépenses (tout en DH)
    const totalProfitNetDH = totalRevenueDH - totalSpendDH;
    
    // Moyennes globales
    const avgCPL = totalLeads > 0 ? totalSpendUSD / totalLeads : 0;
    const avgCPD = totalDeliveries > 0 ? totalSpendUSD / totalDeliveries : 0;
    const deliveryRate = totalLeads > 0 ? (totalDeliveries / totalLeads) * 100 : 0;

    return {
      totalSpendDH,
      totalSpendUSD,
      totalLeads,
      totalDeliveries,
      totalRevenueDH,
      totalProfitNetDH,
      avgCPL,
      avgCPD,
      deliveryRate
    };
  };

  const totals = calculateTotals();

  return (
    <tfoot className="bg-gray-100 dark:bg-gray-700">
      <tr className="font-bold text-gray-900 dark:text-gray-100">
        <td className="px-6 py-4 text-sm">
          📊 TOTAUX
        </td>
        <td className="px-6 py-4 text-sm">
          <div className="font-bold text-blue-600">
            {totals.totalSpendDH.toFixed(0)} DH
          </div>
        </td>
        <td className="px-6 py-4 text-sm">
          <div className="font-bold text-blue-600">
            {totals.totalSpendUSD.toFixed(2)}$
          </div>
        </td>
        <td className="px-6 py-4 text-sm">
          <div className="font-bold text-purple-600">
            {totals.totalLeads}
          </div>
        </td>
        <td className="px-6 py-4 text-sm">
          <div className="font-bold text-orange-600">
            {totals.totalDeliveries}
          </div>
          <div className="text-xs text-gray-500">
            Taux: {totals.deliveryRate.toFixed(1)}%
          </div>
        </td>
        <td className="px-6 py-4 text-sm">
          <div className="text-xs text-gray-500">
            Moyenne pondérée
          </div>
        </td>
        <td className="px-6 py-4 text-sm">
          <div className={`font-bold ${totals.avgCPL > 1.5 ? 'text-red-600' : 'text-green-600'}`}>
            {totals.avgCPL.toFixed(2)}$
          </div>
          <div className="text-xs text-gray-500">
            CPL moyen
          </div>
        </td>
        <td className="px-6 py-4 text-sm">
          <div className={`font-bold ${totals.avgCPD > 15 ? 'text-red-600' : 'text-green-600'}`}>
            {totals.avgCPD.toFixed(2)}$
          </div>
          <div className="text-xs text-gray-500">
            CPD moyen
          </div>
        </td>
        <td className="px-6 py-4 text-sm">
          <div className={`font-bold text-lg ${totals.totalProfitNetDH > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {totals.totalProfitNetDH.toFixed(0)} DH
          </div>
          <div className="text-xs text-gray-500">
            Revenus: {totals.totalRevenueDH.toFixed(0)} DH
          </div>
        </td>
        <td className="px-6 py-4 text-sm">
          <div className="text-xs text-gray-500">
            {data.length} entrée(s)
          </div>
        </td>
      </tr>
    </tfoot>
  );
};
