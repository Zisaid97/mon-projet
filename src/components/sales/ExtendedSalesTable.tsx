
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { SalesData } from '@/types/sales';

interface ExtendedSalesTableProps {
  sales: SalesData[];
}

export const ExtendedSalesTable = ({ sales }: ExtendedSalesTableProps) => {
  const getStatusBadge = (status: string, type: 'confirmation' | 'delivery') => {
    if (!status || status.trim() === '') {
      return <Badge variant="outline" className="text-xs">Non renseigné</Badge>;
    }
    
    const lowerStatus = status.toLowerCase().trim();
    
    if (type === 'confirmation') {
      // Statuts de confirmation positifs
      if (lowerStatus === 'confirmed' || lowerStatus === 'confirmé' || lowerStatus === 'reconfirmed') {
        return <Badge className="bg-blue-100 text-blue-800 text-xs">Confirmé</Badge>;
      }
      // Statuts d'échec
      if (lowerStatus === 'cancelled' || lowerStatus === 'fake' || lowerStatus === 'refused' || 
          lowerStatus === 'non confirmed' || lowerStatus === 'annulé' || lowerStatus === 'refusé') {
        return <Badge className="bg-red-100 text-red-800 text-xs">Échec</Badge>;
      }
      // Statuts en attente
      if (lowerStatus === 'postponed' || lowerStatus === 'voicemail' || lowerStatus === 'busy' || 
          lowerStatus === 'no response' || lowerStatus === 'to contact' || lowerStatus === 'reporté') {
        return <Badge className="bg-yellow-100 text-yellow-800 text-xs">En attente</Badge>;
      }
      // Statuts spéciaux
      if (lowerStatus === 'to return' || lowerStatus === 'to replace' || lowerStatus === 'à retourner') {
        return <Badge className="bg-orange-100 text-orange-800 text-xs">À traiter</Badge>;
      }
    }
    
    if (type === 'delivery') {
      // Statuts de livraison réussis
      if (lowerStatus === 'delivered' || lowerStatus === 'livré' || lowerStatus === 'completed') {
        return <Badge className="bg-green-100 text-green-800 text-xs">Livré</Badge>;
      }
      // Statuts d'échec de livraison
      if (lowerStatus === 'returned' || lowerStatus === 'refused' || lowerStatus === 'cancelled' || 
          lowerStatus === 'retourné' || lowerStatus === 'refusé' || lowerStatus === 'annulé') {
        return <Badge className="bg-red-100 text-red-800 text-xs">Échec</Badge>;
      }
      // Statuts en cours
      if (lowerStatus === 'ongoing' || lowerStatus === 'dispatched' || lowerStatus === 'en cours' || 
          lowerStatus === 'expédié') {
        return <Badge className="bg-blue-100 text-blue-800 text-xs">En cours</Badge>;
      }
      // Statuts en attente
      if (lowerStatus === 'postponed' || lowerStatus === 'unreachable' || lowerStatus === 'no response' || 
          lowerStatus === 'to contact' || lowerStatus === 'not assigned' || lowerStatus === 'reporté') {
        return <Badge className="bg-yellow-100 text-yellow-800 text-xs">En attente</Badge>;
      }
    }
    
    // Si le statut n'est pas reconnu, l'afficher tel quel avec un indicateur
    return (
      <Badge variant="outline" className="text-xs">
        {status} {!['confirmed', 'delivered', 'livré', 'confirmé'].includes(lowerStatus) && '⚠️'}
      </Badge>
    );
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50 dark:bg-gray-800">
            <TableHead className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase min-w-[100px]">Date</TableHead>
            <TableHead className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase min-w-[120px]">Canal de Vente</TableHead>
            <TableHead className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase min-w-[120px]">N° Suivi</TableHead>
            <TableHead className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase min-w-[150px]">Client</TableHead>
            <TableHead className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase min-w-[200px]">Produit(s)</TableHead>
            <TableHead className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase text-right min-w-[80px]">Prix</TableHead>
            <TableHead className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase text-right min-w-[80px]">Acompte</TableHead>
            <TableHead className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase min-w-[120px]">Expédition</TableHead>
            <TableHead className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase min-w-[120px]">Téléphone</TableHead>
            <TableHead className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase min-w-[200px]">Adresse</TableHead>
            <TableHead className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase min-w-[100px]">Ville</TableHead>
            <TableHead className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase min-w-[150px]">Notes</TableHead>
            <TableHead className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase text-center min-w-[120px]">Confirmation</TableHead>
            <TableHead className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase min-w-[150px]">Note Confirm.</TableHead>
            <TableHead className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase text-center min-w-[120px]">Livraison</TableHead>
            <TableHead className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase min-w-[150px]">Note Livr.</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sales.map((sale) => (
            <TableRow key={sale.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
              <TableCell className="text-sm text-gray-900 dark:text-gray-100">
                {new Date(sale.date).toLocaleDateString('fr-FR')}
              </TableCell>
              <TableCell className="text-sm text-gray-900 dark:text-gray-100">{sale.sales_channel || '-'}</TableCell>
              <TableCell className="text-sm font-mono text-gray-900 dark:text-gray-100">{sale.tracking_number || '-'}</TableCell>
              <TableCell className="text-sm text-gray-900 dark:text-gray-100">
                <div className="font-medium">{sale.customer || '-'}</div>
              </TableCell>
              <TableCell className="text-sm max-w-xs text-gray-900 dark:text-gray-100">
                <div className="truncate" title={sale.products}>
                  {sale.products || '-'}
                </div>
              </TableCell>
              <TableCell className="text-sm text-right font-semibold text-gray-900 dark:text-gray-100">
                ${sale.price.toFixed(2)}
              </TableCell>
              <TableCell className="text-sm text-right text-gray-900 dark:text-gray-100">
                ${sale.deposit.toFixed(2)}
              </TableCell>
              <TableCell className="text-sm text-gray-900 dark:text-gray-100">{sale.customer_shipping || '-'}</TableCell>
              <TableCell className="text-sm font-mono text-gray-900 dark:text-gray-100">{sale.phone || '-'}</TableCell>
              <TableCell className="text-sm max-w-xs text-gray-900 dark:text-gray-100">
                <div className="truncate" title={sale.address}>
                  {sale.address || '-'}
                </div>
              </TableCell>
              <TableCell className="text-sm text-gray-900 dark:text-gray-100">{sale.city || '-'}</TableCell>
              <TableCell className="text-sm max-w-xs text-gray-900 dark:text-gray-100">
                <div className="truncate" title={sale.notes}>
                  {sale.notes || '-'}
                </div>
              </TableCell>
              <TableCell className="text-center">
                {getStatusBadge(sale.confirmation_status, 'confirmation')}
              </TableCell>
              <TableCell className="text-sm max-w-xs text-gray-900 dark:text-gray-100">
                <div className="truncate" title={sale.confirmation_note}>
                  {sale.confirmation_note || '-'}
                </div>
              </TableCell>
              <TableCell className="text-center">
                {getStatusBadge(sale.delivery_status, 'delivery')}
              </TableCell>
              <TableCell className="text-sm max-w-xs text-gray-900 dark:text-gray-100">
                <div className="truncate" title={sale.delivery_note}>
                  {sale.delivery_note || '-'}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
