
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertTriangle, Info, ExternalLink, Copy } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ConnectionGuideModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  errorType?: string;
  onRetryConnection: () => void;
}

export function ConnectionGuideModal({ 
  open, 
  onOpenChange, 
  errorType,
  onRetryConnection 
}: ConnectionGuideModalProps) {
  // Fonction pour déterminer l'URL de redirection correcte
  const getRedirectUri = () => {
    const currentOrigin = window.location.origin;
    
    // Si on est sur le domaine trackprofit, utiliser cette URL
    if (currentOrigin.includes('trackprofit')) {
      return `${currentOrigin}/google-auth-callback`;
    }
    
    // Si on est sur un domaine Lovable (*.lovable.app)
    if (currentOrigin.includes('lovable.app')) {
      return `${currentOrigin}/google-auth-callback`;
    }
    
    // Par défaut, utiliser l'origine actuelle
    return `${currentOrigin}/google-auth-callback`;
  };

  const currentRedirectUri = getRedirectUri();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copié",
      description: "URL copiée dans le presse-papiers",
    });
  };

  const steps = [
    {
      step: 1,
      title: "Accédez à Google Cloud Console",
      description: "Rendez-vous sur console.cloud.google.com et sélectionnez votre projet.",
      icon: <Info className="h-4 w-4" />
    },
    {
      step: 2,
      title: "Configurez les identifiants OAuth",
      description: "Allez dans 'APIs et services' > 'Identifiants' et sélectionnez votre ID client OAuth 2.0.",
      icon: <Info className="h-4 w-4" />
    },
    {
      step: 3,
      title: "Ajoutez l'URI de redirection autorisée",
      description: "Dans la section 'URI de redirection autorisées', ajoutez exactement l'URL ci-dessous :",
      icon: <CheckCircle className="h-4 w-4 text-green-600" />,
      action: (
        <div className="mt-2 p-3 bg-gray-100 rounded-lg">
          <div className="flex items-center justify-between">
            <code className="text-sm font-mono text-blue-600">{currentRedirectUri}</code>
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard(currentRedirectUri)}
              className="ml-2"
            >
              <Copy className="h-3 w-3" />
            </Button>
          </div>
        </div>
      )
    },
    {
      step: 4,
      title: "Sauvegardez et testez",
      description: "Cliquez sur 'Enregistrer' dans Google Cloud Console, puis réessayez la connexion.",
      icon: <CheckCircle className="h-4 w-4 text-green-600" />
    }
  ];

  const troubleshooting = [
    {
      problem: "Erreur 'redirect_uri_mismatch'",
      solution: `L'URL de redirection n'est pas configurée. Ajoutez exactement : ${currentRedirectUri}`,
      severity: "high" as const
    },
    {
      problem: "Domaine trackprofit vs Lovable",
      solution: `Pour trackprofit, utilisez: ${currentRedirectUri.includes('trackprofit') ? currentRedirectUri : currentRedirectUri.replace(window.location.origin, 'https://trackprofit.com')}`,
      severity: "high" as const
    },
    {
      problem: "Erreur 403 'That's an error'",
      solution: "Vérifiez que votre application est approuvée dans Google Cloud Console et que les scopes sont corrects.",
      severity: "high" as const
    },
    {
      problem: "Connexion réussie mais non visible",
      solution: "Actualisez la page après connexion. Si le problème persiste, vérifiez les logs de connexion.",
      severity: "medium" as const
    }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'secondary';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ExternalLink className="h-5 w-5" />
            Guide de configuration Google OAuth
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {errorType && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Erreur détectée :</strong> {errorType === 'redirect_uri_mismatch' ? 
                  `URL de redirection non configurée. Requis: ${currentRedirectUri}` : 
                  'Erreur de configuration OAuth'}
              </AlertDescription>
            </Alert>
          )}

          {/* Information sur le domaine actuel */}
          <Alert className="border-blue-200 bg-blue-50">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription>
              <strong>Domaine détecté :</strong> {window.location.origin}
              <br />
              <strong>URL de redirection requise :</strong> 
              <div className="mt-2 p-2 bg-white rounded border">
                <div className="flex items-center justify-between">
                  <code className="text-sm text-blue-600 font-mono">{currentRedirectUri}</code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(currentRedirectUri)}
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    Copier
                  </Button>
                </div>
              </div>
            </AlertDescription>
          </Alert>

          {/* Configuration requise */}
          <div>
            <h3 className="font-semibold text-lg mb-4 text-red-600">⚠️ Configuration requise</h3>
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription>
                <strong>Action requise :</strong> Vous devez configurer l'URL de redirection suivante dans Google Cloud Console :
                <div className="mt-2 p-2 bg-white rounded border">
                  <div className="flex items-center justify-between">
                    <code className="text-sm text-red-600 font-mono">{currentRedirectUri}</code>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(currentRedirectUri)}
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      Copier
                    </Button>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          </div>

          {/* Étapes de configuration */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Étapes de configuration</h3>
            <div className="space-y-4">
              {steps.map((step) => (
                <div key={step.step} className="flex gap-3 p-4 border rounded-lg">
                  <div className="flex-shrink-0">
                    <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
                      {step.step}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {step.icon}
                      <h4 className="font-medium">{step.title}</h4>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{step.description}</p>
                    {step.action}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dépannage */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Problèmes courants et solutions</h3>
            <div className="space-y-3">
              {troubleshooting.map((item, index) => (
                <div key={index} className="p-3 border rounded-lg">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="font-medium text-sm">{item.problem}</h4>
                    <Badge variant={getSeverityColor(item.severity)} className="text-xs">
                      {item.severity === 'high' ? 'Critique' : 
                       item.severity === 'medium' ? 'Moyen' : 'Faible'}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">{item.solution}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Lien vers Google Cloud Console */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Lien direct :</strong> 
              <a 
                href="https://console.cloud.google.com/apis/credentials" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline ml-2"
              >
                Ouvrir Google Cloud Console →
              </a>
            </AlertDescription>
          </Alert>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <Button onClick={onRetryConnection} className="flex-1">
              Réessayer la connexion
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Fermer
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
