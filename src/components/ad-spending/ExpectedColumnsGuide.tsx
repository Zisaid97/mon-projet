
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const expectedColumns = [
  'Nom du compte',
  'Nom de la campagne', 
  'Couverture',
  'Impressions',
  'Répétition',
  'Devise',
  'CPM (Coût pour 1 000 impressions)',
  'Hold Rate (réel)',
  'LP-Rate',
  'Clics sur un lien',
  'Hock rate',
  'CPC (coût par clic sur un lien)',
  'Montant dépensé (USD)',
  'Prospects',
  'Coût par prospect',
  'Vues de page de destination',
  'Coût par vue de page de destination',
  'Diffusion de l\'ensemble de publicités',
  'Début des rapports',
  'Fin des rapports'
];

export const ExpectedColumnsGuide: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Colonnes attendues (dans l'ordre recommandé)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {expectedColumns.map((column, index) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-mono">
                {index + 1}
              </span>
              <span>{column}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
