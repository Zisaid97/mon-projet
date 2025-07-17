
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Monitor } from 'lucide-react';

export function DisplaySettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Monitor className="h-5 w-5" />
          Affichage
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Afficher les montants en double devise</Label>
            <p className="text-sm text-gray-600">
              Afficher USD et MAD simultanément
            </p>
          </div>
          <Switch />
        </div>
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Arrondir les nombres</Label>
            <p className="text-sm text-gray-600">
              Simplifier l'affichage des montants
            </p>
          </div>
          <Switch />
        </div>
      </CardContent>
    </Card>
  );
}
