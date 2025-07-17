
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.42.6";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  console.log("🚀 Save Meta Config function called");
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authentication verification
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.error("❌ Header d'autorisation manquant ou invalide");
      return new Response(JSON.stringify({ 
        error: "Non authentifié, veuillez vous connecter"
      }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const jwt = authHeader.replace("Bearer ", "");
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: userData, error: userError } = await supabase.auth.getUser(jwt);

    if (userError || !userData?.user) {
      console.error("❌ Erreur d'authentification:", userError);
      return new Response(JSON.stringify({ 
        error: "Non authentifié, veuillez vous connecter"
      }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Parse request body
    const { clientId, clientSecret, redirectUri } = await req.json();

    if (!clientId || !clientSecret || !redirectUri) {
      return new Response(JSON.stringify({ 
        error: "Tous les champs sont requis" 
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("💾 Sauvegarde de la configuration Meta pour:", userData.user.id);

    // Stocker la configuration dans une table dédiée
    const { error: insertError } = await supabase
      .from("meta_ads_config")
      .upsert(
        [
          {
            user_id: userData.user.id,
            client_id: clientId,
            client_secret: clientSecret,
            redirect_uri: redirectUri,
            updated_at: new Date().toISOString()
          },
        ],
        { onConflict: "user_id" }
      );

    if (insertError) {
      console.error("❌ Erreur lors de l'insertion en base:", insertError);
      return new Response(JSON.stringify({ 
        error: "Erreur lors de la sauvegarde en base de données",
        details: insertError
      }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("✅ Configuration Meta sauvegardée avec succès");
    return new Response(
      JSON.stringify({ 
        success: true,
        message: "Configuration Meta Ads sauvegardée avec succès"
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("💥 Erreur générale:", error);
    
    const sanitizedError = error instanceof Error ? error.message : 'Erreur interne du serveur';

    return new Response(JSON.stringify({ 
      error: sanitizedError,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
