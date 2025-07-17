
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, X, Filter } from "lucide-react";
import { useFiltersStore } from "@/stores/filtersStore";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export function DashboardFilters() {
  const { filters, setFilters, resetFilters, hasActiveFilters } = useFiltersStore();

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtres d'analyse
            {hasActiveFilters() && (
              <Badge variant="secondary" className="ml-2">
                Actifs
              </Badge>
            )}
          </CardTitle>
          {hasActiveFilters() && (
            <Button variant="outline" size="sm" onClick={resetFilters}>
              <X className="h-4 w-4 mr-1" />
              Réinitialiser
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Date de début */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Date de début</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.start ? format(filters.start, "dd MMM yyyy", { locale: fr }) : "Sélectionner"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={filters.start || undefined}
                  onSelect={(date) => setFilters({ start: date || null })}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Date de fin */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Date de fin</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.end ? format(filters.end, "dd MMM yyyy", { locale: fr }) : "Sélectionner"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={filters.end || undefined}
                  onSelect={(date) => setFilters({ end: date || null })}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Info sur les filtres actifs */}
          <div className="md:col-span-2 flex items-center gap-2 pt-6">
            {filters.productIds.length > 0 && (
              <Badge variant="outline">
                {filters.productIds.length} produit(s)
              </Badge>
            )}
            {filters.cities.length > 0 && (
              <Badge variant="outline">
                {filters.cities.length} ville(s)
              </Badge>
            )}
            {filters.channels.length > 0 && (
              <Badge variant="outline">
                {filters.channels.length} canal/canaux
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
