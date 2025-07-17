
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Search, Filter } from 'lucide-react';

interface AdSpendingFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  filterAccount: string;
  setFilterAccount: (value: string) => void;
  filterCampaign: string;
  setFilterCampaign: (value: string) => void;
  uniqueAccounts: string[];
  uniqueCampaigns: string[];
  onExport: () => void;
}

export const AdSpendingFilters = ({
  searchTerm,
  setSearchTerm,
  filterAccount,
  setFilterAccount,
  filterCampaign,
  setFilterCampaign,
  uniqueAccounts,
  uniqueCampaigns,
  onExport
}: AdSpendingFiltersProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filtres et recherche
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={filterAccount} onValueChange={setFilterAccount}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les comptes</SelectItem>
              {uniqueAccounts.map((account, index) => (
                <SelectItem key={`account-${index}-${account}`} value={account}>
                  {account}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterCampaign} onValueChange={setFilterCampaign}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les campagnes</SelectItem>
              {uniqueCampaigns.map((campaign, index) => (
                <SelectItem key={`campaign-${index}-${campaign}`} value={campaign}>
                  {campaign}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button onClick={onExport} variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Exporter CSV
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
