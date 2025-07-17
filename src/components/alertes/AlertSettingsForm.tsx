
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAlertSettings, useUpdateAlertSettings } from "@/hooks/useAlertSettings";
import { useAuth } from "@/hooks/useAuth";

export default function AlertSettingsForm() {
  const { user } = useAuth();
  const { data: alertSettings, isLoading } = useAlertSettings();
  const { toast } = useToast();
  const updateAlertSettings = useUpdateAlertSettings();

  const [sendEmail, setSendEmail] = useState(false);
  const [dailySpendThreshold, setDailySpendThreshold] = useState(50);
  const [daysWithoutDelivery, setDaysWithoutDelivery] = useState(2);
  const [roiMinPercent, setRoiMinPercent] = useState(10);
  const [deliveryRateMinPercent, setDeliveryRateMinPercent] = useState(8);
  const [cpdThresholdUsd, setCpdThresholdUsd] = useState(150);
  const [cplThresholdUsd, setCplThresholdUsd] = useState(1.5);
  const [alertScope, setAlertScope] = useState<'campaign' | 'account'>('campaign');

  useEffect(() => {
    if (alertSettings) {
      setSendEmail(alertSettings.send_email);
      setDailySpendThreshold(alertSettings.alert_daily_spend_threshold);
      setDaysWithoutDelivery(alertSettings.alert_days_without_delivery);
      setRoiMinPercent(alertSettings.roi_min_percent);
      setDeliveryRateMinPercent(alertSettings.delivery_rate_min_percent);
      setCpdThresholdUsd(alertSettings.cpd_threshold_usd);
      setCplThresholdUsd(alertSettings.cpl_threshold_usd);
      setAlertScope(alertSettings.alert_scope as 'campaign' | 'account');
    }
  }, [alertSettings]);

  const defaultSettings = {
    send_email: false,
    alert_daily_spend_threshold: 50,
    alert_days_without_delivery: 2,
    roi_min_percent: 10,
    delivery_rate_min_percent: 8,
    cpd_threshold_usd: 150, // Changed from 15 to 150
    cpl_threshold_usd: 1.5,
    currency: 'USD',
    alert_scope: 'campaign' as const,
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: "Erreur",
        description: "Utilisateur non authentifié.",
        variant: "destructive",
      });
      return;
    }

    try {
      await updateAlertSettings.mutateAsync({
        user_id: user.id,
        send_email: sendEmail,
        alert_daily_spend_threshold: dailySpendThreshold,
        alert_days_without_delivery: daysWithoutDelivery,
        roi_min_percent: roiMinPercent,
        delivery_rate_min_percent: deliveryRateMinPercent,
        cpd_threshold_usd: cpdThresholdUsd,
        cpl_threshold_usd: cplThresholdUsd,
        alert_scope: alertScope,
      });

      toast({
        title: "Succès",
        description: "Paramètres d'alerte mis à jour avec succès.",
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error?.message || "Erreur lors de la mise à jour des paramètres d'alerte.",
        variant: "destructive",
      });
    }
  };

  const handleReset = () => {
    setSendEmail(defaultSettings.send_email);
    setDailySpendThreshold(defaultSettings.alert_daily_spend_threshold);
    setDaysWithoutDelivery(defaultSettings.alert_days_without_delivery);
    setRoiMinPercent(defaultSettings.roi_min_percent);
    setDeliveryRateMinPercent(defaultSettings.delivery_rate_min_percent);
    setCpdThresholdUsd(defaultSettings.cpd_threshold_usd);
    setCplThresholdUsd(defaultSettings.cpl_threshold_usd);
    setAlertScope(defaultSettings.alert_scope);
  };

  if (isLoading) {
    return <div>Chargement des paramètres d'alerte...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Paramètres des Alertes</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Activer/Désactiver les alertes par e-mail */}
          <div className="flex items-center justify-between">
            <Label htmlFor="sendEmail">Activer les alertes par e-mail</Label>
            <Switch
              id="sendEmail"
              checked={sendEmail}
              onCheckedChange={(checked) => setSendEmail(checked)}
            />
          </div>

          {/* Seuil de dépense quotidienne */}
          <div>
            <Label htmlFor="dailySpendThreshold">Seuil de dépense quotidienne (€)</Label>
            <Input
              type="number"
              id="dailySpendThreshold"
              value={dailySpendThreshold}
              onChange={(e) => setDailySpendThreshold(Number(e.target.value))}
            />
          </div>

          {/* Nombre de jours sans livraison */}
          <div>
            <Label htmlFor="daysWithoutDelivery">Nombre de jours sans livraison</Label>
            <Input
              type="number"
              id="daysWithoutDelivery"
              value={daysWithoutDelivery}
              onChange={(e) => setDaysWithoutDelivery(Number(e.target.value))}
            />
          </div>

          {/* ROI minimum en pourcentage */}
          <div>
            <Label htmlFor="roiMinPercent">ROI minimum (%)</Label>
            <Input
              type="number"
              id="roiMinPercent"
              value={roiMinPercent}
              onChange={(e) => setRoiMinPercent(Number(e.target.value))}
            />
          </div>

          {/* Taux de livraison minimum en pourcentage */}
          <div>
            <Label htmlFor="deliveryRateMinPercent">Taux de livraison minimum (%)</Label>
            <Input
              type="number"
              id="deliveryRateMinPercent"
              value={deliveryRateMinPercent}
              onChange={(e) => setDeliveryRateMinPercent(Number(e.target.value))}
            />
          </div>

          {/* Seuil CPD en USD */}
          <div>
            <Label htmlFor="cpdThresholdUsd">Seuil CPD (€)</Label>
            <Input
              type="number"
              id="cpdThresholdUsd"
              value={cpdThresholdUsd}
              onChange={(e) => setCpdThresholdUsd(Number(e.target.value))}
            />
          </div>

          {/* Seuil CPL en USD */}
          <div>
            <Label htmlFor="cplThresholdUsd">Seuil CPL (€)</Label>
            <Input
              type="number"
              id="cplThresholdUsd"
              value={cplThresholdUsd}
              onChange={(e) => setCplThresholdUsd(Number(e.target.value))}
            />
          </div>

          {/* Scope des alertes */}
          <div>
            <Label>Scope des alertes</Label>
            <Select value={alertScope} onValueChange={(value: 'campaign' | 'account') => setAlertScope(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner le scope" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="campaign">Campagne</SelectItem>
                <SelectItem value="account">Compte</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Boutons de soumission et de réinitialisation */}
          <div className="flex justify-between">
            <Button type="button" variant="outline" onClick={handleReset}>
              Réinitialiser
            </Button>
            <Button type="submit">
              Enregistrer
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
