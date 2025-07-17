
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MetaAttribution } from '@/hooks/useMetaAttributions';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Calculator, Save, X } from 'lucide-react';

interface EditAttributionModalProps {
  isOpen: boolean;
  onClose: () => void;
  attribution: MetaAttribution;
  onSave: () => void;
}

export const EditAttributionModal: React.FC<EditAttributionModalProps> = ({
  isOpen,
  onClose,
  attribution,
  onSave
}) => {
  const [spendUsd, setSpendUsd] = useState(attribution.spend_usd.toString());
  const [spendDh, setSpendDh] = useState(attribution.spend_dh.toString());
  const [exchangeRate, setExchangeRate] = useState('10.5');
  const [autoCalculate, setAutoCalculate] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  // Auto-calculer le DH quand USD change
  const handleUsdChange = (value: string) => {
    setSpendUsd(value);
    if (autoCalculate && value && !isNaN(parseFloat(value))) {
      const usdAmount = parseFloat(value);
      const dhAmount = usdAmount * parseFloat(exchangeRate);
      setSpendDh(dhAmount.toFixed(2));
    }
  };

  // Auto-calculer le USD quand DH change
  const handleDhChange = (value: string) => {
    setSpendDh(value);
    if (autoCalculate && value && !isNaN(parseFloat(value))) {
      const dhAmount = parseFloat(value);
      const usdAmount = dhAmount / parseFloat(exchangeRate);
      setSpendUsd(usdAmount.toFixed(2));
    }
  };

  // Calculer automatiquement avec le taux de change
  const handleAutoCalculate = () => {
    if (spendUsd && !isNaN(parseFloat(spendUsd))) {
      const usdAmount = parseFloat(spendUsd);
      const dhAmount = usdAmount * parseFloat(exchangeRate);
      setSpendDh(dhAmount.toFixed(2));
    }
  };

  // Sauvegarder les modifications
  const handleSave = async () => {
    try {
      setSaving(true);

      const usdValue = parseFloat(spendUsd);
      const dhValue = parseFloat(spendDh);

      if (isNaN(usdValue) || isNaN(dhValue) || usdValue < 0 || dhValue < 0) {
        toast({
          title: "Erreur de validation",
          description: "Veuillez saisir des montants valides et positifs",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('attributions_meta')
        .update({
          spend_usd: usdValue,
          spend_dh: dhValue,
          updated_at: new Date().toISOString()
        })
        .eq('id', attribution.id);

      if (error) {
        throw error;
      }

      toast({
        title: "✅ Attribution modifiée",
        description: `${attribution.product} - ${attribution.country} mis à jour avec succès`,
      });

      onSave();
      onClose();

      // Déclencher un événement pour rafraîchir l'affichage
      window.dispatchEvent(new CustomEvent('meta-attributions-updated'));

    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast({
        title: "Erreur de sauvegarde",
        description: "Impossible de sauvegarder les modifications",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            ✏️ Modifier l'attribution
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Informations de l'attribution */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-sm font-medium text-gray-700 mb-1">
              🧴 {attribution.product} - 🌍 {attribution.country}
            </div>
            <div className="text-xs text-gray-500">
              Date : {new Date(attribution.date).toLocaleDateString('fr-FR', { 
                day: 'numeric',
                month: 'long', 
                year: 'numeric' 
              })}
            </div>
          </div>

          {/* Montant USD */}
          <div className="space-y-2">
            <Label htmlFor="spend-usd">Montant dépensé (USD)</Label>
            <Input
              id="spend-usd"
              type="number"
              step="0.01"
              min="0"
              value={spendUsd}
              onChange={(e) => handleUsdChange(e.target.value)}
              placeholder="Ex: 100.50"
            />
          </div>

          {/* Taux de change */}
          <div className="space-y-2">
            <Label htmlFor="exchange-rate">Taux de change (1$ = X DH)</Label>
            <div className="flex gap-2">
              <Input
                id="exchange-rate"
                type="number"
                step="0.1"
                min="0"
                value={exchangeRate}
                onChange={(e) => setExchangeRate(e.target.value)}
                placeholder="10.5"
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAutoCalculate}
                className="px-3"
              >
                <Calculator className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Montant DH */}
          <div className="space-y-2">
            <Label htmlFor="spend-dh">Montant dépensé (DH)</Label>
            <Input
              id="spend-dh"
              type="number"
              step="0.01"
              min="0"
              value={spendDh}
              onChange={(e) => handleDhChange(e.target.value)}
              placeholder="Ex: 1050.25"
            />
          </div>

          {/* Option de calcul automatique */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="auto-calculate"
              checked={autoCalculate}
              onChange={(e) => setAutoCalculate(e.target.checked)}
              className="rounded border-gray-300"
            />
            <Label htmlFor="auto-calculate" className="text-sm">
              Calculer automatiquement lors de la saisie
            </Label>
          </div>

          {/* Aperçu du calcul */}
          {spendUsd && spendDh && (
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <div className="text-sm font-medium text-blue-800 mb-1">
                📊 Aperçu du calcul
              </div>
              <div className="text-xs text-blue-600 space-y-1">
                <div>${parseFloat(spendUsd).toFixed(2)} × {exchangeRate} = {(parseFloat(spendUsd) * parseFloat(exchangeRate)).toFixed(2)} DH</div>
                <div>Montant saisi : {parseFloat(spendDh).toFixed(2)} DH</div>
                {Math.abs(parseFloat(spendDh) - (parseFloat(spendUsd) * parseFloat(exchangeRate))) > 0.01 && (
                  <div className="text-orange-600 font-medium">
                    ⚠️ Écart détecté avec le calcul automatique
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            <X className="h-4 w-4 mr-2" />
            Annuler
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Sauvegarde...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Sauvegarder
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
