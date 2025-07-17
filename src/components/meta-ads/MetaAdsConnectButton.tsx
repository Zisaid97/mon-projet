
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useMetaAdsConfig } from "@/hooks/useMetaAdsConfig";

const SCOPES = [
  "ads_read",
  "business_management", 
  "pages_show_list",
  "read_insights",
].join(",");

export default function MetaAdsConnectButton() {
  const [isConnecting, setIsConnecting] = useState(false);
  const { config, isLoading } = useMetaAdsConfig();

  const handleConnect = () => {
    if (!config) {
      toast({
        title: "Configuration manquante",
        description: "Veuillez d'abord configurer vos paramètres Meta Ads dans l'onglet Configuration.",
        variant: "destructive",
      });
      return;
    }

    setIsConnecting(true);
    
    try {
      // Générer un state unique pour cette session
      const stateValue = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const fbOauthUrl = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${config.client_id}&redirect_uri=${encodeURIComponent(
        config.redirect_uri
      )}&scope=${SCOPES}&state=${stateValue}&response_type=code&auth_type=rerequest`;
      
      console.log("🔗 URL de redirection Meta OAuth:", fbOauthUrl);
      console.log("🌐 Origin actuel:", window.location.origin);
      console.log("📍 Callback configuré:", config.redirect_uri);
      console.log("🔑 Client ID utilisé:", config.client_id);
      console.log("🎯 State généré:", stateValue);
      
      // Vérifier que l'URL de callback correspond à l'origin actuel
      const callbackUrl = new URL(config.redirect_uri);
      const currentOrigin = window.location.origin;
      
      if (callbackUrl.origin !== currentOrigin) {
        console.warn("⚠️ ATTENTION: L'URL de callback ne correspond pas à l'origin actuel!");
        console.warn("Callback configuré:", callbackUrl.origin);
        console.warn("Origin actuel:", currentOrigin);
        
        toast({
          title: "Problème de configuration",
          description: `L'URL de callback (${callbackUrl.origin}) ne correspond pas au domaine actuel (${currentOrigin}). Veuillez mettre à jour la configuration.`,
          variant: "destructive",
        });
        setIsConnecting(false);
        return;
      }
      
      // Afficher un message informatif
      toast({
        title: "Redirection vers Meta",
        description: "Vous allez être redirigé vers Facebook pour autoriser l'accès...",
      });
      
      // Redirection après un court délai pour que l'utilisateur voie le message
      setTimeout(() => {
        console.log("🚀 Redirection vers Facebook...");
        window.location.href = fbOauthUrl;
      }, 1500);
      
    } catch (error) {
      console.error("❌ Erreur lors de la connexion Meta:", error);
      toast({
        title: "Erreur de connexion",
        description: "Impossible de se connecter à Meta. Veuillez réessayer.",
        variant: "destructive",
      });
      setIsConnecting(false);
    }
  };

  if (isLoading) {
    return (
      <Button variant="outline" className="w-full" disabled>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Chargement de la configuration...
      </Button>
    );
  }

  if (!config) {
    return (
      <div className="space-y-3">
        <Button 
          variant="outline" 
          className="w-full border-orange-200 hover:border-orange-300 hover:bg-orange-50 dark:border-orange-600 dark:hover:bg-orange-900/20" 
          disabled
        >
          <AlertCircle className="mr-2 h-4 w-4" />
          Configuration requise
        </Button>
        
        <div className="text-xs text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg border border-orange-200 dark:border-orange-600">
          <div className="flex items-start gap-2">
            <div className="text-orange-600 mt-0.5">⚠️</div>
            <div>
              <div className="font-medium text-orange-800 dark:text-orange-300 mb-1">Configuration manquante</div>
              <div>Veuillez d'abord configurer vos paramètres Meta Ads dans l'onglet "Configuration" ci-dessus.</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <Button 
        variant="outline" 
        className="w-full border-blue-200 hover:border-blue-300 hover:bg-blue-50 dark:border-blue-600 dark:hover:bg-blue-900/20" 
        onClick={handleConnect}
        disabled={isConnecting}
      >
        {isConnecting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Redirection en cours...
          </>
        ) : (
          <>
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            Connecter mon compte Meta Ads
          </>
        )}
      </Button>
      
      {/* Information de sécurité améliorée */}
      <div className="text-xs text-gray-500 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-600">
        <div className="flex items-start gap-2">
          <div className="text-blue-600 mt-0.5">🔐</div>
          <div>
            <div className="font-medium text-blue-800 dark:text-blue-300 mb-1">Connexion sécurisée OAuth</div>
            <div className="space-y-1">
              <div>• Vos identifiants ne sont jamais stockés</div>
              <div>• Accès en lecture seule à vos données publicitaires</div>
              <div>• Révocable à tout moment depuis Facebook</div>
            </div>
          </div>
        </div>
      </div>

      {/* Informations de debug améliorées */}
      <div className="text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 p-2 rounded border border-blue-200 dark:border-blue-600">
        <div className="flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          <span className="font-medium">Configuration actuelle:</span> 
        </div>
        <div className="mt-1 space-y-1">
          <div>Client ID: {config.client_id}</div>
          <div>Callback: {config.redirect_uri}</div>
          <div>Origin: {window.location.origin}</div>
          <div className={`font-medium ${
            new URL(config.redirect_uri).origin === window.location.origin 
              ? 'text-green-600' 
              : 'text-red-600'
          }`}>
            {new URL(config.redirect_uri).origin === window.location.origin 
              ? '✅ URLs correspondent' 
              : '❌ URLs ne correspondent pas!'
            }
          </div>
        </div>
      </div>

      {/* Guide de dépannage */}
      <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20 p-2 rounded border">
        <div className="font-medium mb-1">🔧 En cas de problème:</div>
        <div className="space-y-1">
          <div>1. Vérifiez que l'URL de callback est correcte dans Facebook Developers</div>
          <div>2. Assurez-vous d'avoir activé "Connexion Facebook" dans votre app</div>
          <div>3. Vérifiez les permissions: ads_read, business_management</div>
          <div>4. L'app doit être en mode "Live" ou vous devez être ajouté comme testeur</div>
        </div>
      </div>
    </div>
  );
}
