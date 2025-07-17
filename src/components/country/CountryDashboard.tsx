
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCountryData, useUpdateCountryData } from "@/hooks/useCountryData";
import { useCountryFiltersStore } from "@/stores/countryFiltersStore";
import { AfricaMap } from "@/components/maps/AfricaMap";
import { MapPin, TrendingUp, RefreshCw } from "lucide-react";

const AFRICAN_COUNTRIES = [
  { code: 'MA', name: 'Maroc' },
  { code: 'DZ', name: 'Algérie' },
  { code: 'TN', name: 'Tunisie' },
  { code: 'EG', name: 'Égypte' },
  { code: 'NG', name: 'Nigeria' },
  { code: 'ZA', name: 'Afrique du Sud' },
  { code: 'KE', name: 'Kenya' },
  { code: 'GH', name: 'Ghana' },
  { code: 'CI', name: 'Côte d\'Ivoire' },
  { code: 'SN', name: 'Sénégal' },
];

export function CountryDashboard() {
  const { filters, setSelectedCountries } = useCountryFiltersStore();
  const { data: countryData = [], isLoading } = useCountryData(filters.selectedCountries);
  const updateCountryData = useUpdateCountryData();

  console.log('CountryDashboard - countryData:', countryData);
  console.log('CountryDashboard - filters:', filters);
  console.log('CountryDashboard - isLoading:', isLoading);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: 'MAD'
    }).format(value);
  };

  const getROIColor = (roi: number) => {
    if (roi >= 30) return 'bg-green-500';
    if (roi >= 15) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const handleUpdateData = () => {
    updateCountryData.mutate();
  };

  const handleCountryClick = (countryCode: string) => {
    setSelectedCountries([countryCode]);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">🌍 Dashboard par Pays</h1>
        <Button 
          onClick={handleUpdateData}
          disabled={updateCountryData.isPending}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${updateCountryData.isPending ? 'animate-spin' : ''}`} />
          Actualiser données
        </Button>
      </div>

      {/* Carte interactive */}
      <AfricaMap onCountryClick={handleCountryClick} />

      {/* Sélecteur de pays */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Sélection des pays</CardTitle>
        </CardHeader>
        <CardContent>
          <Select
            value={filters.selectedCountries[0] || ''}
            onValueChange={(value) => setSelectedCountries([value])}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner un pays" />
            </SelectTrigger>
            <SelectContent>
              {AFRICAN_COUNTRIES.map((country) => (
                <SelectItem key={country.code} value={country.code}>
                  {country.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* KPIs par pays */}
      {Array.isArray(countryData) && countryData.map((country) => (
        <div key={country.id} className="space-y-4">
          <div className="flex items-center gap-3">
            <MapPin className="h-5 w-5 text-blue-600" />
            <h2 className="text-xl font-semibold">{country.country_name}</h2>
            <Badge className={`${getROIColor(country.roi_percent)} text-white`}>
              ROI: {country.roi_percent.toFixed(1)}%
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Revenu</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(country.revenue_mad)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Dépenses</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(country.spend_mad)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Profit Net</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(country.profit_mad)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Taux de Livraison</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-purple-600">
                  {country.delivery_rate.toFixed(1)}%
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">CPL (Coût par Lead)</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xl font-bold">{formatCurrency(country.cpl_mad)}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">CPD (Coût par Livraison)</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xl font-bold">{formatCurrency(country.cpd_mad)}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      ))}

      {(!Array.isArray(countryData) || countryData.length === 0) && !isLoading && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-8">
            <p className="text-gray-500 mb-4">Aucune donnée de pays disponible</p>
            <Button onClick={handleUpdateData}>
              Générer des données de test
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
