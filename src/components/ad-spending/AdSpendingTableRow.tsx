
import React from 'react';
import { AdSpendingData } from '@/hooks/useAdSpendingData';
import { coloredNumber } from '@/utils/marketingFormatters';

interface AdSpendingTableRowProps {
  row: AdSpendingData;
  index: number;
  hideDate?: boolean;
}

export const AdSpendingTableRow = ({ row, index, hideDate = false }: AdSpendingTableRowProps) => {
  const ctr = row.impressions > 0 ? (row.link_clicks / row.impressions) * 100 : 0;
  const isHighCPC = row.cpc > 2;
  
  return (
    <tr key={`row-${row.id || index}-${row.date}-${row.campaign_name}`} className={isHighCPC ? 'bg-red-50' : ''}>
      {!hideDate && (
        <td className="px-3 py-4 text-sm text-gray-900">
          {new Date(row.date).toLocaleDateString('fr-FR')}
        </td>
      )}
      <td className="px-3 py-4 text-sm text-gray-900">{row.account_name}</td>
      <td className="px-3 py-4 text-sm text-gray-900 max-w-xs truncate">
        {row.campaign_name}
      </td>
      <td className="px-3 py-4 text-sm text-right">
        {coloredNumber(row.impressions, 0, 'info')}
      </td>
      <td className="px-3 py-4 text-sm text-right">
        {coloredNumber(row.link_clicks, 0, 'info')}
      </td>
      <td className="px-3 py-4 text-sm text-right">
        {coloredNumber(row.cpc, 2, isHighCPC ? 'danger' : 'plain')}$
      </td>
      <td className="px-3 py-4 text-sm text-right font-semibold">
        {coloredNumber(row.amount_spent, 2, 'success')}$
      </td>
      <td className="px-3 py-4 text-sm text-right">
        {coloredNumber(row.leads, 0, 'info')}
      </td>
      <td className="px-3 py-4 text-sm text-right">
        {coloredNumber(ctr, 2, 'muted')}%
      </td>
    </tr>
  );
};
