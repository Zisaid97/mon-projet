
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AdSpendingData } from '@/hooks/useAdSpendingData';
import { Save, X } from 'lucide-react';

interface AdSpendingEditModalProps {
  open: boolean;
  onClose: () => void;
  date: string;
  data: AdSpendingData[];
  onSave: (updatedData: AdSpendingData[]) => void;
}

export const AdSpendingEditModal = ({ open, onClose, date, data, onSave }: AdSpendingEditModalProps) => {
  const [editedData, setEditedData] = useState<AdSpendingData[]>([]);

  useEffect(() => {
    setEditedData([...data]);
  }, [data]);

  const updateField = (index: number, field: keyof AdSpendingData, value: string | number) => {
    const updated = [...editedData];
    updated[index] = { ...updated[index], [field]: value };
    setEditedData(updated);
  };

  const handleSave = () => {
    onSave(editedData);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>
              Modifier les données du {new Date(date).toLocaleDateString('fr-FR')}
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {editedData.map((item, index) => (
            <div key={`edit-${item.id || index}`} className="p-4 border rounded-lg">
              <h4 className="font-medium mb-4 text-sm text-gray-700">
                {item.account_name} - {item.campaign_name}
              </h4>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Label className="text-xs">Impressions</Label>
                  <Input
                    type="number"
                    value={item.impressions}
                    onChange={(e) => updateField(index, 'impressions', parseFloat(e.target.value) || 0)}
                    className="h-8"
                  />
                </div>
                
                <div>
                  <Label className="text-xs">Clics</Label>
                  <Input
                    type="number"
                    value={item.link_clicks}
                    onChange={(e) => updateField(index, 'link_clicks', parseFloat(e.target.value) || 0)}
                    className="h-8"
                  />
                </div>
                
                <div>
                  <Label className="text-xs">CPC ($)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={item.cpc}
                    onChange={(e) => updateField(index, 'cpc', parseFloat(e.target.value) || 0)}
                    className="h-8"
                  />
                </div>
                
                <div>
                  <Label className="text-xs">Dépensé ($)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={item.amount_spent}
                    onChange={(e) => updateField(index, 'amount_spent', parseFloat(e.target.value) || 0)}
                    className="h-8"
                  />
                </div>
                
                <div>
                  <Label className="text-xs">Prospects</Label>
                  <Input
                    type="number"
                    value={item.leads}
                    onChange={(e) => updateField(index, 'leads', parseFloat(e.target.value) || 0)}
                    className="h-8"
                  />
                </div>
                
                <div>
                  <Label className="text-xs">Couverture</Label>
                  <Input
                    type="number"
                    value={item.reach}
                    onChange={(e) => updateField(index, 'reach', parseFloat(e.target.value) || 0)}
                    className="h-8"
                  />
                </div>
                
                <div>
                  <Label className="text-xs">CPM ($)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={item.cpm}
                    onChange={(e) => updateField(index, 'cpm', parseFloat(e.target.value) || 0)}
                    className="h-8"
                  />
                </div>
                
                <div>
                  <Label className="text-xs">Vues LP</Label>
                  <Input
                    type="number"
                    value={item.landing_page_views}
                    onChange={(e) => updateField(index, 'landing_page_views', parseFloat(e.target.value) || 0)}
                    className="h-8"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button onClick={handleSave} className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            Enregistrer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
