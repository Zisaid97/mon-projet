
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  TableRow, 
  TableCell,
} from '@/components/ui/table';
import { 
  ChevronDown, 
  ChevronRight,
  Edit3, 
  Check, 
  X 
} from 'lucide-react';

interface CountryData {
  country: string;
  leads: number;
  spend_dh: number;
  deliveries: number;
  cpl: number;
  cpd: number;
  delivery_rate: number;
  delivery_id?: string;
}

interface ProductSummary {
  product: string;
  total_leads: number;
  total_deliveries: number;
  total_spend_dh: number;
  avg_cpl: number;
  avg_cpd: number;
  global_delivery_rate: number;
  countries: CountryData[];
}

interface ProductCountryAccordionRowProps {
  productData: ProductSummary;
  onDeliveryEdit: (product: string, country: string, newDeliveries: number) => Promise<void>;
  editingCell: string | null;
  setEditingCell: (cellKey: string | null) => void;
  editValue: string;
  setEditValue: (value: string) => void;
  onSaveEdit: () => Promise<void>;
  onCancelEdit: () => void;
  formatNumber: (num: number, decimals?: number) => string;
  getDeliveryRateColor: (rate: number) => string;
}

export const ProductCountryAccordionRow = ({
  productData,
  onDeliveryEdit,
  editingCell,
  setEditingCell,
  editValue,
  setEditValue,
  onSaveEdit,
  onCancelEdit,
  formatNumber,
  getDeliveryRateColor
}: ProductCountryAccordionRowProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
      {/* Ligne principale du produit */}
      <TableRow 
        className="hover:bg-gray-50 cursor-pointer font-medium bg-blue-50"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <TableCell className="py-4">
          <div className="flex items-center gap-2">
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-gray-500" />
            ) : (
              <ChevronRight className="h-4 w-4 text-gray-500" />
            )}
            <Badge variant="default" className="font-medium bg-blue-600">
              {productData.product}
            </Badge>
          </div>
        </TableCell>
        <TableCell className="text-center font-medium text-gray-500">
          —
        </TableCell>
        <TableCell className="text-right font-bold">
          {productData.total_leads.toLocaleString()}
        </TableCell>
        <TableCell className="text-right font-bold">
          {productData.total_deliveries.toLocaleString()}
        </TableCell>
        <TableCell className="text-right font-bold">
          {formatNumber(productData.total_spend_dh)}
        </TableCell>
        <TableCell className="text-right font-bold">
          {formatNumber(productData.avg_cpl)}
        </TableCell>
        <TableCell className="text-right font-bold">
          {formatNumber(productData.avg_cpd)}
        </TableCell>
        <TableCell className={`text-right font-bold ${getDeliveryRateColor(productData.global_delivery_rate)}`}>
          {productData.global_delivery_rate > 0 ? `${formatNumber(productData.global_delivery_rate, 1)}%` : '—'}
        </TableCell>
      </TableRow>

      {/* Lignes détaillées par pays (si déplié) */}
      {isExpanded && productData.countries.map((countryData) => {
        const cellKey = `${productData.product}_${countryData.country}`;
        const isEditing = editingCell === cellKey;

        return (
          <TableRow key={cellKey} className="hover:bg-gray-25 bg-gray-25">
            <TableCell className="pl-12">
              <span className="text-sm text-gray-600">└─</span>
            </TableCell>
            <TableCell>
              <Badge variant="outline" className="font-medium text-xs">
                🌍 {countryData.country}
              </Badge>
            </TableCell>
            <TableCell className="text-right text-sm">
              {countryData.leads.toLocaleString()}
            </TableCell>
            <TableCell className="text-right text-sm">
              {isEditing ? (
                <div className="flex items-center gap-1">
                  <Input
                    type="number"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="w-16 h-7 text-xs"
                    min="0"
                    autoFocus
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={onSaveEdit}
                    className="h-7 w-7 p-0"
                  >
                    <Check className="h-3 w-3 text-green-600" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={onCancelEdit}
                    className="h-7 w-7 p-0"
                  >
                    <X className="h-3 w-3 text-red-500" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-end gap-1 group">
                  <span className="text-sm">{countryData.deliveries}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingCell(cellKey);
                      setEditValue(countryData.deliveries.toString());
                    }}
                    className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Edit3 className="h-2 w-2" />
                  </Button>
                </div>
              )}
            </TableCell>
            <TableCell className="text-right text-sm">
              {formatNumber(countryData.spend_dh)}
            </TableCell>
            <TableCell className="text-right text-sm">
              {formatNumber(countryData.cpl)}
            </TableCell>
            <TableCell className="text-right text-sm">
              {formatNumber(countryData.cpd)}
            </TableCell>
            <TableCell className={`text-right text-sm ${getDeliveryRateColor(countryData.delivery_rate)}`}>
              {countryData.delivery_rate > 0 ? `${formatNumber(countryData.delivery_rate, 1)}%` : '—'}
              {countryData.delivery_rate < 10 && countryData.delivery_rate > 0 && (
                <Badge variant="destructive" className="ml-1 text-xs">
                  ⚠️
                </Badge>
              )}
            </TableCell>
          </TableRow>
        );
      })}
    </>
  );
};
