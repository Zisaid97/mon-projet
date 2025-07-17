
import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { logGoogleSheetsEvent } from "@/utils/googleSheetsLogger";

export default function GoogleAuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Fonction pour déterminer l'URL de redirection correcte (même logique que dans useGoogleSheets)
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

  useEffect(() => {
    async function exchangeCode() {
      const code = searchParams.get("code");
      const error = searchParams.get("error");
      const errorDescription = searchParams.get("error_description");
      
      if (error) {
        console.error("OAuth error:", error, errorDescription);
        let userFriendlyMessage = "Erreur lors de la connexion à Google.";
        
        if (error === "access_denied") {
          userFriendlyMessage = "Vous avez refusé l'autorisation. Veuillez réessayer et accepter les permissions.";
        } else if (error === "redirect_uri_mismatch") {
          userFriendlyMessage = `Erreur de configuration OAuth. Vous devez ajouter cette URL dans Google Cloud Console : ${getRedirectUri()}`;
        }

        toast({
          title: "Erreur de connexion Google",
          description: userFriendlyMessage,
          variant: "destructive",
        });
        navigate("/google-sheets");
        return;
      }
      
      if (!code) {
        toast({
          title: "Erreur Google OAuth",
          description: "Aucun code de connexion reçu. Veuillez réessayer.",
          variant: "destructive",
        });
        navigate("/google-sheets");
        return;
      }
      
      try {
        const REDIRECT_URI = getRedirectUri();
        
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) {
          throw new Error("Non authentifié - veuillez vous connecter à l'application");
        }
        
        const response = await fetch("https://uqqajzfkqushviwuayng.supabase.co/functions/v1/google-auth", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${session.access_token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            action: "exchange_code",
            code,
            redirectUri: REDIRECT_URI
          })
        });

        const resData = await response.json();
        
        if (!response.ok) {
          console.error("Exchange code error:", resData);
          throw new Error(resData?.error || "Échec de l'échange du code Google");
        }

        toast({
          title: "Connexion Google réussie",
          description: `Bienvenue ${resData.user_info?.name || ""}! Votre compte Google Sheets est maintenant connecté.`,
        });

        // Rediriger vers la page Google Sheets avec un délai
        setTimeout(() => {
          window.location.href = "/google-sheets";
        }, 1000);
        
      } catch (e: any) {
        console.error("Google auth callback error:", e);

        toast({
          title: "Erreur lors de la connexion à Google",
          description: e?.message || "Erreur inconnue. Veuillez réessayer ou contacter le support.",
          variant: "destructive",
        });
        navigate("/google-sheets");
      }
    }
    exchangeCode();
  }, []);

  const currentRedirectUri = getRedirectUri();

  return (
    <div className="flex items-center justify-center min-h-screen text-gray-700 dark:text-gray-200">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p>Connexion à Google en cours…</p>
        <p className="text-sm text-gray-500 mt-2">
          Traitement de votre connexion Google Sheets...
        </p>
        <p className="text-xs text-gray-400 mt-4">
          URL de redirection utilisée : {currentRedirectUri}
        </p>
        <p className="text-xs text-gray-300 mt-2">
          Domaine actuel : {window.location.origin}
        </p>
      </div>
    </div>
  );
}
