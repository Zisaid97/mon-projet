
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export default function MetaAdsCallback() {
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("Connexion en cours...");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      const error = params.get("error");
      const errorDescription = params.get("error_description");
      const state = params.get("state");

      console.log("🔄 Meta Callback - Paramètres reçus:", {
        code: code ? `${code.substring(0, 20)}...` : "absent",
        error: error || "aucune",
        errorDescription: errorDescription || "aucune",
        state: state || "absent",
        fullUrl: window.location.href
      });

      if (error) {
        console.error("❌ Erreur OAuth Meta:", { error, errorDescription });
        setMsg(`Erreur d'autorisation: ${errorDescription || error}`);
        setLoading(false);
        
        toast({
          title: "Erreur d'autorisation Meta",
          description: errorDescription || error,
          variant: "destructive",
        });
        
        setTimeout(() => navigate("/settings?tab=meta-ads"), 3000);
        return;
      }

      if (!code) {
        console.error("❌ Code d'autorisation manquant dans la callback");
        setMsg("Code d'autorisation manquant. Veuillez réessayer la connexion.");
        setLoading(false);
        
        toast({
          title: "Code manquant",
          description: "Le code d'autorisation est manquant. Veuillez réessayer.",
          variant: "destructive",
        });
        
        setTimeout(() => navigate("/settings?tab=meta-ads"), 3000);
        return;
      }

      setLoading(true);
      setMsg("Échange du code d'autorisation...");

      try {
        // Récupérer le token d'authentification Supabase
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.access_token) {
          throw new Error("Session non valide, veuillez vous reconnecter");
        }

        console.log("🔄 Appel de la fonction Edge Meta OAuth...");
        console.log("📊 Paramètres envoyés:", {
          codeLength: code.length,
          codePreview: code.substring(0, 50),
          hasSession: !!session?.access_token
        });
        
        // Appel de la fonction Edge avec le token d'authentification
        const response = await fetch(
          `https://uqqajzfkqushviwuayng.supabase.co/functions/v1/meta-ads-oauth?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state || '')}`,
          {
            method: "GET",
            headers: {
              'Authorization': `Bearer ${session.access_token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        console.log("📊 Réponse de la fonction Edge:", {
          status: response.status,
          ok: response.ok,
          statusText: response.statusText
        });

        const data = await response.json();
        console.log("📊 Données de réponse:", data);

        if (data.success) {
          setSuccess(true);
          setMsg(`✅ Connexion réussie ! Compte ${data.meta_account_name} connecté.`);
          
          toast({
            title: "Connexion Meta Ads réussie",
            description: `Votre compte ${data.meta_account_name} a été connecté avec succès`,
          });
          
          setTimeout(() => navigate("/settings?tab=meta-ads"), 2000);
        } else {
          throw new Error(data.error || 'Erreur inconnue lors de la connexion');
        }
      } catch (error: any) {
        console.error("💥 Erreur lors de la connexion Meta:", error);
        setMsg(`❌ Erreur: ${error.message}`);
        
        toast({
          title: "Erreur de connexion Meta",
          description: error.message,
          variant: "destructive",
        });
        
        setTimeout(() => navigate("/settings?tab=meta-ads"), 3000);
      } finally {
        setLoading(false);
      }
    })();
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-violet-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg px-8 py-10 flex flex-col gap-6 items-center max-w-md w-full mx-4">
        <div className="flex flex-col items-center gap-4">
          {loading ? (
            <Loader2 className="animate-spin h-12 w-12 text-blue-600" />
          ) : success ? (
            <CheckCircle className="h-12 w-12 text-green-600" />
          ) : (
            <AlertCircle className="h-12 w-12 text-red-600" />
          )}
          
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Connexion Meta Ads
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {msg}
            </p>
          </div>
        </div>
        
        {!loading && (
          <div className="text-center text-sm text-gray-500 dark:text-gray-400">
            Redirection automatique dans quelques secondes...
          </div>
        )}

        {/* Informations de debug */}
        <div className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-800 p-2 rounded max-w-full overflow-hidden">
          <div className="font-mono break-all">
            URL: {window.location.href.substring(0, 100)}...
          </div>
        </div>
      </div>
    </div>
  );
}
