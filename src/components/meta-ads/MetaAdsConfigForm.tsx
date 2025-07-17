
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SecureInput } from "@/components/security/SecureInput";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Save, Eye, EyeOff, ExternalLink, AlertTriangle, CheckCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useMetaAdsConfig } from "@/hooks/useMetaAdsConfig";

interface MetaAdsConfigData {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

export default function MetaAdsConfigForm() {
  const { config, isLoading, saveConfig, isSaving } = useMetaAdsConfig();
  const [formData, setFormData] = useState<MetaAdsConfigData>({
    clientId: "995914722642624",
    clientSecret: "",
    redirectUri: `${window.location.origin}/meta-ads/callback`
  });
  const [showSecret, setShowSecret] = useState(false);

  // Charger la configuration existante
  useEffect(() => {
    if (config) {
      setFormData({
        clientId: config.client_id,
        clientSecret: '••••••••••••••••', // Mask the secret for security
        // 🔧 FIX: Corriger automatiquement l'URL de callback si elle pointe vers le mauvais domaine
        redirectUri: config.redirect_uri.includes('trackprofit.online') || !config.redirect_uri.includes(window.location.origin)
          ? `${window.location.origin}/meta-ads/callback`
          : config.redirect_uri
      });
    }
  }, [config]);

  const handleSave = async () => {
    if (!formData.clientId || !formData.clientSecret) {
      toast({
        title: "Champs requis",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      });
      return;
    }

    // Vérifier que l'URL de redirection est valide
    try {
      const redirectUrl = new URL(formData.redirectUri);
      const currentOrigin = window.location.origin;
      
      if (redirectUrl.origin !== currentOrigin) {
        toast({
          title: "URL de redirection incorrecte",
          description: `L'URL doit commencer par ${currentOrigin}`,
          variant: "destructive",
        });
        return;
      }
    } catch (error) {
      toast({
        title: "URL invalide",
        description: "L'URL de redirection n'est pas valide",
        variant: "destructive",
      });
      return;
    }

    console.log("💾 Sauvegarde de la configuration:", {
      clientId: formData.clientId,
      redirectUri: formData.redirectUri,
      hasSecret: !!formData.clientSecret
    });

    saveConfig({
      clientId: formData.clientId,
      clientSecret: formData.clientSecret,
      redirectUri: formData.redirectUri
    });
  };

  // 🔧 FIX: Corriger automatiquement l'URL de callback
  const handleAutoFix = () => {
    const correctRedirectUri = `${window.location.origin}/meta-ads/callback`;
    setFormData(prev => ({
      ...prev,
      redirectUri: correctRedirectUri
    }));
    
    toast({
      title: "URL corrigée",
      description: `URL mise à jour vers ${correctRedirectUri}`,
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Chargement de la configuration...</span>
        </CardContent>
      </Card>
    );
  }

  const isUrlValid = (() => {
    try {
      const redirectUrl = new URL(formData.redirectUri);
      return redirectUrl.origin === window.location.origin;
    } catch {
      return false;
    }
  })();

  const needsUrlFix = (formData.redirectUri.includes('trackprofit.online') || !formData.redirectUri.includes(window.location.origin)) && !isUrlValid;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🔧 Configuration Meta Ads
          {config && <CheckCircle className="h-5 w-5 text-green-600" />}
        </CardTitle>
        <CardDescription>
          Configurez vos paramètres Meta Ads pour permettre la connexion automatique
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {needsUrlFix && (
          <Alert className="border-orange-200 bg-orange-50">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <div className="flex items-center justify-between">
                <div>
                  <strong>URL de callback incorrecte détectée</strong>
                  <p className="text-sm mt-1">L'URL pointe vers trackprofit.online au lieu du domaine actuel</p>
                </div>
                <Button onClick={handleAutoFix} size="sm" variant="outline">
                  Corriger automatiquement
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <Alert className="border-blue-200 bg-blue-50">
          <AlertDescription>
            <div className="space-y-2">
              <div className="font-medium">📋 Comment obtenir vos paramètres Meta :</div>
              <div className="text-sm space-y-1">
                <div>1. Rendez-vous sur <a href="https://developers.facebook.com/apps" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline inline-flex items-center gap-1">Facebook Developers <ExternalLink className="h-3 w-3" /></a></div>
                <div>2. Sélectionnez votre application ou créez-en une nouvelle</div>
                <div>3. Dans "Paramètres de base", copiez l'ID de l'application et la Clé secrète</div>
                <div>4. Dans "Produits", ajoutez "Connexion Facebook" si pas déjà fait</div>
                <div>5. Dans "Connexion Facebook" → "Paramètres", ajoutez l'URI de redirection</div>
              </div>
            </div>
          </AlertDescription>
        </Alert>

        <div className="grid gap-4">
          <div>
            <Label htmlFor="clientId">ID de l'application Meta *</Label>
            <Input
              id="clientId"
              type="text"
              value={formData.clientId}
              onChange={(e) => setFormData({...formData, clientId: e.target.value})}
              placeholder="Votre App ID Meta"
              className="font-mono"
            />
            <p className="text-xs text-gray-500 mt-1">
              Trouvable dans Facebook Developers → Votre App → Paramètres de base
            </p>
          </div>

          <div>
            <Label htmlFor="clientSecret" className="flex items-center gap-2">
              Clé secrète de l'application *
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowSecret(!showSecret)}
                className="h-6 w-6 p-0"
              >
                {showSecret ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
              </Button>
            </Label>
            <SecureInput
              id="clientSecret"
              type={showSecret ? "text" : "password"}
              value={formData.clientSecret}
              onSecureChange={(value) => setFormData({...formData, clientSecret: value})}
              placeholder="Votre App Secret Meta"
              className="font-mono"
              maxLength={255}
              name="clientSecret"
              sanitize={true}
            />
            <p className="text-xs text-gray-500 mt-1">
              Trouvable dans Facebook Developers → Votre App → Paramètres de base
            </p>
          </div>

          <div>
            <Label htmlFor="redirectUri" className="flex items-center gap-2">
              URI de redirection
              {isUrlValid ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-red-600" />
              )}
            </Label>
            <Input
              id="redirectUri"
              type="url"
              value={formData.redirectUri}
              onChange={(e) => setFormData({...formData, redirectUri: e.target.value})}
              className={`font-mono ${!isUrlValid ? 'border-red-300 focus:border-red-500' : ''}`}
            />
            <p className="text-xs text-gray-500 mt-1">
              Cette URL doit être configurée dans votre application Facebook
            </p>
            {!isUrlValid && (
              <p className="text-xs text-red-600 mt-1">
                ⚠️ L'URL doit commencer par {window.location.origin}
              </p>
            )}
          </div>
        </div>

        <Alert className={`${isUrlValid ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'}`}>
          <AlertDescription>
            <div className="space-y-2">
              <div className="font-medium flex items-center gap-2">
                {isUrlValid ? <CheckCircle className="h-4 w-4 text-green-600" /> : <AlertTriangle className="h-4 w-4 text-yellow-600" />}
                Configuration Facebook requise :
              </div>
              <div className="text-sm space-y-1">
                <div>• Dans Facebook Developers, allez dans "Connexion Facebook" → "Paramètres"</div>
                <div>• Ajoutez cette URL de redirection : <code className="bg-gray-100 px-1 rounded text-xs">{formData.redirectUri}</code></div>
                <div>• Activez les permissions : ads_read, business_management, pages_show_list, read_insights</div>
                <div>• Si votre app est en mode "Développement", ajoutez-vous comme testeur</div>
                <div>• Votre clé secrète sera stockée de manière sécurisée dans Supabase</div>
              </div>
            </div>
          </AlertDescription>
        </Alert>

        <Button 
          onClick={handleSave}
          disabled={isSaving || !formData.clientId || !formData.clientSecret || !isUrlValid}
          className="w-full"
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sauvegarde en cours...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Sauvegarder la configuration
            </>
          )}
        </Button>

        {config && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              ✅ Configuration sauvegardée avec succès ! Vous pouvez maintenant essayer de connecter votre compte dans l'onglet "Connexion".
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
