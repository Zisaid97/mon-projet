import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { SalesData } from '@/types/sales';
import { Eye, Trash2, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SalesDetailModal } from './SalesDetailModal';

interface SalesTableProps {
  data: SalesData[];
  sortField: keyof SalesData;
  sortDirection: 'asc' | 'desc';
  onSort: (field: keyof SalesData) => void;
}

export const SalesTable = ({ data, sortField, sortDirection, onSort }: SalesTableProps) => {
  const [selectedSales, setSelectedSales] = useState<string[]>([]);
  const [detailModal, setDetailModal] = useState<{ open: boolean; sale: SalesData | null }>({
    open: false,
    sale: null
  });

  const getSortIcon = (field: keyof SalesData) => {
    if (sortField === field) {
      return sortDirection === 'asc' ? '↑' : '↓';
    }
    return '';
  };

  const getStatusBadge = (status: string, type: 'confirmation' | 'delivery') => {
    if (!status || status.trim() === '') {
      return <Badge variant="outline">Non renseigné</Badge>;
    }
    
    const lowerStatus = status.toLowerCase().trim();
    
    if (type === 'confirmation') {
      if (lowerStatus === 'confirmed' || lowerStatus === 'confirmé' || lowerStatus === 'reconfirmed') {
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Confirmé</Badge>;
      }
      if (lowerStatus === 'cancelled' || lowerStatus === 'fake' || lowerStatus === 'refused' || 
          lowerStatus === 'non confirmed' || lowerStatus === 'annulé' || lowerStatus === 'refusé') {
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">Échec</Badge>;
      }
      if (lowerStatus === 'postponed' || lowerStatus === 'voicemail' || lowerStatus === 'busy' || 
          lowerStatus === 'no response' || lowerStatus === 'to contact' || lowerStatus === 'reporté') {
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">En attente</Badge>;
      }
      if (lowerStatus === 'to return' || lowerStatus === 'to replace' || lowerStatus === 'à retourner') {
        return <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">À traiter</Badge>;
      }
    }
    
    if (type === 'delivery') {
      if (lowerStatus === 'delivered' || lowerStatus === 'livré' || lowerStatus === 'completed') {
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Livré</Badge>;
      }
      if (lowerStatus === 'returned' || lowerStatus === 'refused' || lowerStatus === 'cancelled' || 
          lowerStatus === 'retourné' || lowerStatus === 'refusé' || lowerStatus === 'annulé') {
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">Échec</Badge>;
      }
      if (lowerStatus === 'ongoing' || lowerStatus === 'dispatched' || lowerStatus === 'en cours' || 
          lowerStatus === 'expédié') {
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">En cours</Badge>;
      }
      if (lowerStatus === 'postponed' || lowerStatus === 'unreachable' || lowerStatus === 'no response' || 
          lowerStatus === 'to contact' || lowerStatus === 'not assigned' || lowerStatus === 'reporté') {
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">En attente</Badge>;
      }
    }
    
    return (
      <Badge variant="outline">
        {status} {!['confirmed', 'delivered', 'livré', 'confirmé'].includes(lowerStatus) && '⚠️'}
      </Badge>
    );
  };

  const toggleSaleSelection = (saleId: string) => {
    setSelectedSales(prev => 
      prev.includes(saleId) 
        ? prev.filter(id => id !== saleId)
        : [...prev, saleId]
    );
  };

  const toggleAllSelection = () => {
    if (selectedSales.length === data.length) {
      setSelectedSales([]);
    } else {
      setSelectedSales(data.map(sale => sale.id));
    }
  };

  return (
    <>
      <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-gray-900 dark:text-gray-100">
              Ventes ({data.length} entrées)
            </CardTitle>
            {selectedSales.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedSales.length} sélectionnée(s)
                </span>
                <Button variant="destructive" size="sm">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Supprimer
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-3 py-3 text-left">
                    <Checkbox
                      checked={selectedSales.length === data.length && data.length > 0}
                      onCheckedChange={toggleAllSelection}
                    />
                  </th>
                  <th 
                    className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => onSort('date')}
                  >
                    Date {getSortIcon('date')}
                  </th>
                  <th 
                    className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => onSort('external_order_id')}
                  >
                    ID Commande {getSortIcon('external_order_id')}
                  </th>
                  <th 
                    className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => onSort('customer')}
                  >
                    Client {getSortIcon('customer')}
                  </th>
                  <th 
                    className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => onSort('city')}
                  >
                    Ville {getSortIcon('city')}
                  </th>
                  <th 
                    className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => onSort('products')}
                  >
                    Produits {getSortIcon('products')}
                  </th>
                  <th 
                    className="px-3 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => onSort('price')}
                  >
                    Prix {getSortIcon('price')}
                  </th>
                  <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Confirmation
                  </th>
                  <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Livraison
                  </th>
                  <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {data.map((sale) => (
                  <tr key={sale.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-3 py-4">
                      <Checkbox
                        checked={selectedSales.includes(sale.id)}
                        onCheckedChange={() => toggleSaleSelection(sale.id)}
                      />
                    </td>
                    <td className="px-3 py-4 text-sm text-gray-900 dark:text-gray-100">
                      {new Date(sale.date).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-3 py-4 text-sm font-mono text-gray-900 dark:text-gray-100">
                      {sale.external_order_id}
                    </td>
                    <td className="px-3 py-4 text-sm text-gray-900 dark:text-gray-100">
                      <div>
                        <div className="font-medium">{sale.customer}</div>
                        <div className="text-gray-500 dark:text-gray-400 text-xs">{sale.phone}</div>
                      </div>
                    </td>
                    <td className="px-3 py-4 text-sm text-gray-900 dark:text-gray-100">
                      {sale.city}
                    </td>
                    <td className="px-3 py-4 text-sm text-gray-900 dark:text-gray-100 max-w-xs truncate">
                      {sale.products}
                    </td>
                    <td className="px-3 py-4 text-sm text-right font-semibold text-gray-900 dark:text-gray-100">
                      ${sale.price.toFixed(2)}
                    </td>
                    <td className="px-3 py-4 text-center">
                      {getStatusBadge(sale.confirmation_status, 'confirmation')}
                    </td>
                    <td className="px-3 py-4 text-center">
                      {getStatusBadge(sale.delivery_status, 'delivery')}
                    </td>
                    <td className="px-3 py-4 text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                          <DropdownMenuItem 
                            onClick={() => setDetailModal({ open: true, sale })}
                            className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Voir détails
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {data.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              Aucune vente trouvée avec les filtres appliqués.
            </div>
          )}
        </CardContent>
      </Card>

      <SalesDetailModal
        open={detailModal.open}
        onClose={() => setDetailModal({ open: false, sale: null })}
        sale={detailModal.sale}
      />
    </>
  );
};
