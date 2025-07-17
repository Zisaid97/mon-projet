
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Search, Filter, RotateCcw, CalendarIcon } from 'lucide-react';
import { SalesFilters as SalesFiltersType } from '@/types/sales';

interface SalesFiltersProps {
  filters: SalesFiltersType;
  uniqueValues: {
    cities: string[];
    confirmationStatuses: string[];
    deliveryStatuses: string[];
    salesChannels: string[];
    products: string[];
    agents: string[];
  };
  onFilterChange: (key: keyof SalesFiltersType, value: string) => void;
  onResetFilters: () => void;
  onExport: () => void;
}

export const SalesFilters = ({
  filters,
  uniqueValues,
  onFilterChange,
  onResetFilters,
  onExport
}: SalesFiltersProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filtres et recherche
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Recherche globale */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Rechercher par client, ville, téléphone..."
              value={filters.searchTerm}
              onChange={(e) => onFilterChange('searchTerm', e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filtres de date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Date de début</label>
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => onFilterChange('dateFrom', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Date de fin</label>
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => onFilterChange('dateTo', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* Filtres principaux */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <Select value={filters.city} onValueChange={(value) => onFilterChange('city', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Toutes les villes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les villes</SelectItem>
                {uniqueValues.cities.map((city) => (
                  <SelectItem key={city} value={city}>
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filters.confirmationStatus} onValueChange={(value) => onFilterChange('confirmationStatus', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Statut confirmation" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                {uniqueValues.confirmationStatuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filters.deliveryStatus} onValueChange={(value) => onFilterChange('deliveryStatus', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Statut livraison" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                {uniqueValues.deliveryStatuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filters.salesChannel} onValueChange={(value) => onFilterChange('salesChannel', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Canal de vente" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les canaux</SelectItem>
                {uniqueValues.salesChannels.map((channel) => (
                  <SelectItem key={channel} value={channel}>
                    {channel}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filters.product} onValueChange={(value) => onFilterChange('product', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Produit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les produits</SelectItem>
                {uniqueValues.products.map((product) => (
                  <SelectItem key={product} value={product}>
                    {product}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filters.agent} onValueChange={(value) => onFilterChange('agent', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Agent/Livreur" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les agents</SelectItem>
                {uniqueValues.agents.map((agent) => (
                  <SelectItem key={agent} value={agent}>
                    {agent}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            <Button onClick={onResetFilters} variant="outline" size="sm">
              <RotateCcw className="h-4 w-4 mr-2" />
              Réinitialiser
            </Button>
            <Button onClick={onExport} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exporter CSV
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
