
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { SalesData } from '@/types/sales';

interface SalesDetailModalProps {
  open: boolean;
  onClose: () => void;
  sale: SalesData | null;
}

export const SalesDetailModal = ({ open, onClose, sale }: SalesDetailModalProps) => {
  if (!sale) return null;

  const getStatusBadge = (status: string, type: 'confirmation' | 'delivery') => {
    const lowerStatus = status?.toLowerCase() || '';
    
    if (type === 'confirmation') {
      if (lowerStatus.includes('confirmé') || lowerStatus.includes('confirm')) {
        return <Badge className="bg-blue-100 text-blue-800">Confirmé</Badge>;
      }
      if (lowerStatus.includes('échec') || lowerStatus.includes('failed')) {
        return <Badge className="bg-red-100 text-red-800">Échec</Badge>;
      }
      if (lowerStatus.includes('attente') || lowerStatus.includes('pending')) {
        return <Badge className="bg-gray-100 text-gray-800">En attente</Badge>;
      }
    }
    
    if (type === 'delivery') {
      if (lowerStatus.includes('livré') || lowerStatus.includes('deliver')) {
        return <Badge className="bg-green-100 text-green-800">Livré</Badge>;
      }
      if (lowerStatus.includes('échec') || lowerStatus.includes('failed')) {
        return <Badge className="bg-red-100 text-red-800">Échec</Badge>;
      }
      if (lowerStatus.includes('attente') || lowerStatus.includes('pending')) {
        return <Badge className="bg-gray-100 text-gray-800">En attente</Badge>;
      }
    }
    
    return <Badge variant="outline">{status}</Badge>;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Détails de la vente - {sale.external_order_id}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Informations de commande */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Informations de commande</h3>
            
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">ID Externe</label>
                <p className="font-mono text-sm">{sale.external_order_id}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Date</label>
                <p>{new Date(sale.date).toLocaleDateString('fr-FR')}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Canal de vente</label>
                <p>{sale.sales_channel}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Numéro de suivi</label>
                <p className="font-mono text-sm">{sale.tracking_number}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Produit(s)</label>
                <p>{sale.products}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Prix</label>
                  <p className="font-semibold text-lg">{sale.price.toFixed(2)}€</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Acompte</label>
                  <p className="font-semibold">{sale.deposit.toFixed(2)}€</p>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Méthode de paiement</label>
                <p>{sale.payment_method}</p>
              </div>
            </div>
          </div>

          {/* Informations client */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Informations client</h3>
            
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">Client</label>
                <p className="font-medium">{sale.customer}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Téléphone</label>
                <p className="font-mono">{sale.phone}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Adresse</label>
                <p>{sale.address}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Ville</label>
                <p>{sale.city}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Expédition client</label>
                <p>{sale.customer_shipping}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Notes</label>
                <p className="text-sm text-gray-700">{sale.notes || 'Aucune note'}</p>
              </div>
            </div>
          </div>

          {/* Statuts de confirmation */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Confirmation</h3>
            
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">Statut</label>
                <div className="mt-1">
                  {getStatusBadge(sale.confirmation_status, 'confirmation')}
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Note de confirmation</label>
                <p className="text-sm text-gray-700">{sale.confirmation_note || 'Aucune note'}</p>
              </div>
            </div>
          </div>

          {/* Statuts de livraison */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Livraison</h3>
            
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">Statut</label>
                <div className="mt-1">
                  {getStatusBadge(sale.delivery_status, 'delivery')}
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Livreur</label>
                <p>{sale.delivery_agent || 'Non assigné'}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Note de livraison</label>
                <p className="text-sm text-gray-700">{sale.delivery_note || 'Aucune note'}</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
