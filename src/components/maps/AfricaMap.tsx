
import React, { useState, useMemo } from 'react';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import { scaleLinear } from 'd3-scale';
import { useCountryData } from '@/hooks/useCountryData';
import { useCountryFiltersStore } from '@/stores/countryFiltersStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const geoUrl = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

type KpiType = 'roi' | 'revenue' | 'deliveries';

interface AfricaMapProps {
  onCountryClick?: (countryCode: string) => void;
}

export function AfricaMap({ onCountryClick }: AfricaMapProps) {
  const { filters, setSelectedKpi } = useCountryFiltersStore();
  const [hoveredCountry, setHoveredCountry] = useState<any>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const { data: countryData = [] } = useCountryData();

  // Map country codes to names for better matching
  const countryCodeMap: Record<string, string> = {
    'MA': 'MAR', // Morocco
    'DZ': 'DZA', // Algeria
    'TN': 'TUN', // Tunisia
    'EG': 'EGY', // Egypt
    'NG': 'NGA', // Nigeria
    'ZA': 'ZAF', // South Africa
    'KE': 'KEN', // Kenya
    'GH': 'GHA', // Ghana
    'CI': 'CIV', // Côte d'Ivoire
    'SN': 'SEN', // Senegal
  };

  const colorScales = useMemo(() => ({
    roi: scaleLinear<string>()
      .domain([-10, 0, 15, 30])
      .range(['#ef4444', '#f97316', '#86efac', '#16a34a']),
    revenue: scaleLinear<string>()
      .domain([0, 10000, 30000, 70000])
      .range(['#fef3c7', '#fbbf24', '#f59e0b', '#d97706']),
    deliveries: scaleLinear<string>()
      .domain([0, 50, 150, 300])
      .range(['#ddd6fe', '#a78bfa', '#8b5cf6', '#7c3aed'])
  }), []);

  const dataByCountryCode = useMemo(() => {
    const map: Record<string, any> = {};
    countryData.forEach(country => {
      const isoCode = countryCodeMap[country.country_code];
      if (isoCode) {
        map[isoCode] = country;
      }
    });
    return map;
  }, [countryData]);

  const getKpiValue = (country: any, kpi: KpiType) => {
    switch (kpi) {
      case 'roi':
        return country.roi_percent;
      case 'revenue':
        return country.revenue_mad;
      case 'deliveries':
        return Math.round(country.revenue_mad / (country.cpd_mad || 100)); // Estimate deliveries
      default:
        return 0;
    }
  };

  const formatKpiValue = (value: number, kpi: KpiType) => {
    switch (kpi) {
      case 'roi':
        return `${value.toFixed(1)}%`;
      case 'revenue':
        return `${value.toLocaleString()} MAD`;
      case 'deliveries':
        return `${Math.round(value)} livraisons`;
      default:
        return value.toString();
    }
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    setTooltipPosition({ x: event.clientX, y: event.clientY });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle className="flex items-center gap-2">
            🌍 Carte de Performance - Afrique
          </CardTitle>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={filters.selectedKpi === 'roi' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedKpi('roi')}
            >
              ROI
            </Button>
            <Button
              variant={filters.selectedKpi === 'revenue' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedKpi('revenue')}
            >
              CA
            </Button>
            <Button
              variant={filters.selectedKpi === 'deliveries' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedKpi('deliveries')}
            >
              Livraisons
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <ComposableMap
            projection="geoMercator"
            projectionConfig={{
              center: [15, 0],
              scale: 350
            }}
            width={800}
            height={400}
            className="w-full h-auto"
          >
            <Geographies geography={geoUrl}>
              {({ geographies }) =>
                geographies
                  .filter(geo => {
                    const continent = geo.properties.CONTINENT;
                    return continent === 'Africa';
                  })
                  .map(geo => {
                    const isoCode = geo.properties.ISO_A3;
                    const countryName = geo.properties.NAME;
                    const countryInfo = dataByCountryCode[isoCode];
                    const kpiValue = countryInfo ? getKpiValue(countryInfo, filters.selectedKpi) : null;
                    
                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        fill={
                          kpiValue !== null
                            ? colorScales[filters.selectedKpi](kpiValue)
                            : '#e5e7eb'
                        }
                        stroke="#ffffff"
                        strokeWidth={0.5}
                        style={{
                          default: { outline: 'none' },
                          hover: { 
                            outline: 'none',
                            stroke: '#374151',
                            strokeWidth: 1,
                            cursor: 'pointer'
                          },
                          pressed: { outline: 'none' }
                        }}
                        onMouseEnter={(event) => {
                          if (countryInfo) {
                            setHoveredCountry({
                              name: countryName,
                              ...countryInfo,
                              kpiValue,
                              kpiFormatted: formatKpiValue(kpiValue, filters.selectedKpi)
                            });
                          }
                        }}
                        onMouseLeave={() => setHoveredCountry(null)}
                        onMouseMove={handleMouseMove}
                        onClick={() => {
                          if (countryInfo && onCountryClick) {
                            onCountryClick(countryInfo.country_code);
                          }
                        }}
                      />
                    );
                  })
              }
            </Geographies>
          </ComposableMap>

          {/* Tooltip */}
          {hoveredCountry && (
            <div
              className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-3 pointer-events-none"
              style={{
                left: tooltipPosition.x + 10,
                top: tooltipPosition.y - 60,
                transform: 'translateX(-50%)'
              }}
            >
              <div className="font-bold text-sm">{hoveredCountry.name}</div>
              <div className="text-sm text-gray-600">
                {filters.selectedKpi === 'roi' && `ROI: ${hoveredCountry.kpiFormatted}`}
                {filters.selectedKpi === 'revenue' && `CA: ${hoveredCountry.kpiFormatted}`}
                {filters.selectedKpi === 'deliveries' && `${hoveredCountry.kpiFormatted}`}
              </div>
              {filters.selectedKpi === 'roi' && (
                <div className="text-xs text-gray-500 mt-1">
                  CA: {hoveredCountry.revenue_mad.toLocaleString()} MAD
                </div>
              )}
            </div>
          )}

          {/* Legend */}
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <span>{filters.selectedKpi === 'roi' ? '< 0%' : 'Faible'}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 bg-orange-500 rounded"></div>
                <span>{filters.selectedKpi === 'roi' ? '0-15%' : 'Moyen'}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 bg-green-300 rounded"></div>
                <span>{filters.selectedKpi === 'roi' ? '15-30%' : 'Bon'}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 bg-green-600 rounded"></div>
                <span>{filters.selectedKpi === 'roi' ? '≥ 30%' : 'Excellent'}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
