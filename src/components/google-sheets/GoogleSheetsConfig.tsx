
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';
import { Settings, Save } from 'lucide-react';

export function GoogleSheetsConfig() {
  const [autoSyncEnabled, setAutoSyncEnabled] = useState<boolean>(false);
  const [syncFrequency, setSyncFrequency] = useState<string>('daily');
  const [defaultExportName, setDefaultExportName] = useState<string>('Export_Data');
  const [loading, setLoading] = useState<boolean>(false);

  const handleSaveConfig = async () => {
    try {
      setLoading(true);
      
      // Here you would save the configuration to your database
      // For now, just show a success message
      
      toast({
        title: "Configuration sauvegardée",
        description: "Vos préférences ont été mises à jour avec succès."
      });
      
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder la configuration",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          ⚙️ Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Synchronisation automatique</Label>
              <p className="text-sm text-gray-600">
                Synchroniser automatiquement les données avec Google Sheets
              </p>
            </div>
            <Switch
              checked={autoSyncEnabled}
              onCheckedChange={setAutoSyncEnabled}
            />
          </div>

          {autoSyncEnabled && (
            <div>
              <Label htmlFor="sync-frequency">Fréquence de synchronisation</Label>
              <select 
                id="sync-frequency"
                value={syncFrequency}
                onChange={(e) => setSyncFrequency(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="hourly">Toutes les heures</option>
                <option value="daily">Quotidienne</option>
                <option value="weekly">Hebdomadaire</option>
              </select>
            </div>
          )}

          <div>
            <Label htmlFor="default-export-name">Nom par défaut des exports</Label>
            <Input
              id="default-export-name"
              value={defaultExportName}
              onChange={(e) => setDefaultExportName(e.target.value)}
              placeholder="Export_Data"
            />
          </div>
        </div>

        <div className="border-t pt-4">
          <h4 className="font-medium mb-3">Mapping des colonnes</h4>
          <div className="text-sm text-gray-600 space-y-2">
            <p><strong>Marketing :</strong> Date, Dépenses USD/MAD, Leads, Livraisons, Taux, CPL, CPD, Revenus, Profit</p>
            <p><strong>Financier :</strong> Date, Taux de change, Montant USD, Montant MAD</p>
            <p><strong>Profits :</strong> Date, Catégorie CPD, Produit, Quantité, Commission</p>
          </div>
        </div>

        <Button 
          onClick={handleSaveConfig} 
          disabled={loading}
          className="w-full"
        >
          <Save className="h-4 w-4 mr-2" />
          {loading ? 'Sauvegarde...' : 'Sauvegarder la configuration'}
        </Button>
      </CardContent>
    </Card>
  );
}
