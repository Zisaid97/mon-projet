
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAlerts, useMarkAlertAsRead } from "@/hooks/useAlerts";
import { AlertTriangle, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface AlertsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AlertsModal({ open, onOpenChange }: AlertsModalProps) {
  const { data: alerts, isLoading } = useAlerts();
  const markAsReadMutation = useMarkAlertAsRead();

  const unreadAlerts = alerts?.filter(alert => !alert.is_read) || [];

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'cpd_high':
      case 'roi_low':
      case 'delivery_low':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
    }
  };

  const getAlertMessage = (alert: any) => {
    switch (alert.type) {
      case 'cpd_high':
        return `CPD élevé: ${alert.value.toFixed(2)}$ (seuil: ${alert.threshold}$)`;
      case 'roi_low':
        return `ROI faible: ${alert.value.toFixed(1)}% (seuil: ${alert.threshold}%)`;
      case 'delivery_low':
        return `Taux de livraison faible: ${alert.value.toFixed(1)}% (seuil: ${alert.threshold}%)`;
      default:
        return `Alerte ${alert.kpi}: ${alert.value}`;
    }
  };

  const handleMarkAsRead = (alertId: string) => {
    markAsReadMutation.mutate(alertId);
  };

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>🔔 Alertes intelligentes</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            🔔 Alertes intelligentes
            {unreadAlerts.length > 0 && (
              <Badge variant="destructive">{unreadAlerts.length}</Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {alerts?.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <p className="text-gray-600">Aucune alerte pour le moment</p>
              <p className="text-sm text-gray-500">Toutes vos performances sont dans les seuils acceptables</p>
            </div>
          ) : (
            alerts?.map((alert) => (
              <div
                key={alert.id}
                className={`border rounded-lg p-4 ${
                  alert.is_read ? 'bg-gray-50' : 'bg-white border-red-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    {getAlertIcon(alert.type)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={alert.is_read ? "secondary" : "destructive"}>
                          {alert.is_read ? "Lu" : "Non lu"}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {format(new Date(alert.date), "dd MMM yyyy", { locale: fr })}
                        </span>
                      </div>
                      <p className="font-medium">{getAlertMessage(alert)}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        Détecté le {format(new Date(alert.created_at), "dd/MM/yyyy à HH:mm", { locale: fr })}
                      </p>
                    </div>
                  </div>
                  {!alert.is_read && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleMarkAsRead(alert.id)}
                      disabled={markAsReadMutation.isPending}
                    >
                      Marquer comme lu
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
