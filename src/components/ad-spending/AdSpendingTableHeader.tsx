
import React from 'react';

interface AdSpendingTableHeaderProps {
  sortField: string;
  sortDirection: 'asc' | 'desc';
  onSort: (field: string) => void;
}

export const AdSpendingTableHeader = ({ sortField, sortDirection, onSort }: AdSpendingTableHeaderProps) => {
  const getSortIcon = (field: string) => {
    if (sortField === field) {
      return sortDirection === 'asc' ? '↑' : '↓';
    }
    return '';
  };

  return (
    <thead className="bg-gray-50">
      <tr>
        <th 
          className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
          onClick={() => onSort('date')}
        >
          Date {getSortIcon('date')}
        </th>
        <th 
          className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
          onClick={() => onSort('account_name')}
        >
          Compte {getSortIcon('account_name')}
        </th>
        <th 
          className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
          onClick={() => onSort('campaign_name')}
        >
          Campagne {getSortIcon('campaign_name')}
        </th>
        <th 
          className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
          onClick={() => onSort('impressions')}
        >
          Impressions {getSortIcon('impressions')}
        </th>
        <th 
          className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
          onClick={() => onSort('link_clicks')}
        >
          Clics {getSortIcon('link_clicks')}
        </th>
        <th 
          className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
          onClick={() => onSort('cpc')}
        >
          CPC {getSortIcon('cpc')}
        </th>
        <th 
          className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
          onClick={() => onSort('amount_spent')}
        >
          Dépensé (USD) {getSortIcon('amount_spent')}
        </th>
        <th 
          className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
          onClick={() => onSort('leads')}
        >
          Prospects {getSortIcon('leads')}
        </th>
        <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase">
          CTR %
        </th>
      </tr>
    </thead>
  );
};
