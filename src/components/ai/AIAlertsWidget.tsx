
import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAIAlerts, useMarkAlertAsRead } from "@/hooks/useAIInsights";
import { AlertTriangle, CheckCircle, TrendingDown, Bell, X } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export function AIAlertsWidget() {
  const { data: alerts = [] } = useAIAlerts();
  const markAsRead = useMarkAlertAsRead();

  const unreadCount = alerts.filter(alert => !alert.is_read).length;

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'medium':
        return <TrendingDown className="h-4 w-4 text-orange-500" />;
      default:
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'border-l-red-500 bg-red-50';
      case 'medium':
        return 'border-l-orange-500 bg-orange-50';
      default:
        return 'border-l-blue-500 bg-blue-50';
    }
  };

  if (unreadCount === 0) return null;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="relative">
          <Bell className="h-4 w-4" />
          <span className="ml-1">Alertes IA</span>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Alertes & Suggestions IA
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-96">
          <div className="space-y-4">
            {alerts.map((alert) => (
              <Card 
                key={alert.id} 
                className={`border-l-4 ${getSeverityColor(alert.severity)} ${!alert.is_read ? 'shadow-md' : 'opacity-75'}`}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getSeverityIcon(alert.severity)}
                      <CardTitle className="text-sm font-medium">
                        {alert.title}
                      </CardTitle>
                      {!alert.is_read && (
                        <Badge variant="secondary" className="text-xs">
                          Nouveau
                        </Badge>
                      )}
                    </div>
                    {!alert.is_read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => markAsRead.mutate(alert.id)}
                        className="h-6 w-6 p-0"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700 mb-3 leading-relaxed">
                    {alert.content}
                  </p>
                  
                  {alert.data?.metrics && (
                    <div className="grid grid-cols-2 gap-2 text-xs bg-white/50 p-2 rounded">
                      <div>ROI: {alert.data.metrics.roi?.toFixed(1)}%</div>
                      <div>CPL: {alert.data.metrics.cpl?.toFixed(1)} MAD</div>
                      <div>Taux livraison: {alert.data.metrics.deliveryRate?.toFixed(1)}%</div>
                      <div>CPD: {alert.data.metrics.cpd?.toFixed(1)} MAD</div>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center mt-3">
                    <span className="text-xs text-gray-500">
                      {format(new Date(alert.created_at), "dd MMM yyyy 'à' HH:mm", { locale: fr })}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {alert.type}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
