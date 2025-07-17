
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAdSpendingData } from '@/hooks/useAdSpendingData';
import { useAdSpendingFilters } from '@/hooks/useAdSpendingFilters';
import { AdSpendingFilters } from './AdSpendingFilters';
import { AdSpendingTableHeader } from './AdSpendingTableHeader';
import { AdSpendingTableRow } from './AdSpendingTableRow';

export const AdSpendingTable = () => {
  const { data, loading, exportData } = useAdSpendingData();
  const {
    searchTerm,
    setSearchTerm,
    sortField,
    sortDirection,
    filterAccount,
    setFilterAccount,
    filterCampaign,
    setFilterCampaign,
    uniqueAccounts,
    uniqueCampaigns,
    filteredData,
    handleSort
  } = useAdSpendingFilters(data);

  const handleExport = () => {
    exportData(filteredData);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtres et recherche */}
      <AdSpendingFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterAccount={filterAccount}
        setFilterAccount={setFilterAccount}
        filterCampaign={filterCampaign}
        setFilterCampaign={setFilterCampaign}
        uniqueAccounts={uniqueAccounts}
        uniqueCampaigns={uniqueCampaigns}
        onExport={handleExport}
      />

      {/* Tableau des données */}
      <Card>
        <CardHeader>
          <CardTitle>
            Données Meta Ads ({filteredData.length} lignes)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <AdSpendingTableHeader
                sortField={sortField}
                sortDirection={sortDirection}
                onSort={handleSort}
              />
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredData.map((row, index) => (
                  <AdSpendingTableRow
                    key={`row-${row.id || index}-${row.date}-${row.campaign_name}`}
                    row={row}
                    index={index}
                  />
                ))}
              </tbody>
            </table>
          </div>

          {filteredData.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Aucune donnée trouvée. Importez d'abord un fichier Meta Ads.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
