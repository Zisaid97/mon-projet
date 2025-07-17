
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Settings } from "lucide-react";
import { useState } from "react";

interface UnrecognizedCampaignsAlertProps {
  unrecognizedCount: number;
  totalSpendUnrecognized: number;
  onConfigureMapping?: () => void;
}

export function UnrecognizedCampaignsAlert({ 
  unrecognizedCount, 
  totalSpendUnrecognized, 
  onConfigureMapping 
}: UnrecognizedCampaignsAlertProps) {
  const [isMinimized, setIsMinimized] = useState(false);

  if (unrecognizedCount === 0) return null;

  return (
    <Alert className="border-orange-200 bg-orange-50 dark:bg-orange-950 animate-fade-in">
      <AlertTriangle className="h-4 w-4 text-orange-600" />
      <div className="flex items-center justify-between w-full">
        <div className="flex-1">
          <AlertTitle className="text-orange-800 dark:text-orange-200 flex items-center gap-2">
            ⚠️ Campagnes non reconnues détectées
            <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300">
              {unrecognizedCount} campagne{unrecognizedCount > 1 ? 's' : ''}
            </Badge>
          </AlertTitle>
          {!isMinimized && (
            <AlertDescription className="text-orange-700 dark:text-orange-300 mt-2">
              <div className="space-y-1">
                <p>
                  Des campagnes avec des noms non reconnus ont été détectées. 
                  Elles sont comptabilisées dans les dépenses totales mais attribuées à "PRODUIT_NON_IDENTIFIE".
                </p>
                <p className="font-medium">
                  💰 Montant concerné : {totalSpendUnrecognized.toFixed(2)} USD
                </p>
              </div>
            </AlertDescription>
          )}
        </div>
        
        <div className="flex items-center gap-2 ml-4">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsMinimized(!isMinimized)}
            className="text-orange-600 border-orange-300 hover:bg-orange-100"
          >
            {isMinimized ? 'Afficher' : 'Réduire'}
          </Button>
          
          {onConfigureMapping && (
            <Button
              size="sm"
              onClick={onConfigureMapping}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              <Settings className="h-4 w-4 mr-1" />
              Configurer
            </Button>
          )}
        </div>
      </div>
    </Alert>
  );
}
