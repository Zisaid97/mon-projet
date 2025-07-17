
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.42.6";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Rate limiting
const rateLimiter = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 10; // requests per minute
const RATE_WINDOW = 60 * 1000; // 1 minute

function checkRateLimit(identifier: string): boolean {
  const now = Date.now();
  const userLimit = rateLimiter.get(identifier);
  
  if (!userLimit || now > userLimit.resetTime) {
    rateLimiter.set(identifier, { count: 1, resetTime: now + RATE_WINDOW });
    return true;
  }
  
  if (userLimit.count >= RATE_LIMIT) {
    return false;
  }
  
  userLimit.count++;
  return true;
}

function validateCode(code: string): boolean {
  // Validation plus permissive pour les codes d'autorisation Facebook
  // Accepte tous les caractères alphanumériques, underscore, tiret, point, dièse et pourcentage
  return /^[a-zA-Z0-9_\-\.#%=&]+$/.test(code) && code.length > 5 && code.length < 2000;
}

serve(async (req) => {
  console.log("🚀 Meta Ads OAuth function called");
  console.log("📍 Request URL:", req.url);
  console.log("🌐 Request method:", req.method);
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse the query string
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const error = url.searchParams.get("error");
    const errorDescription = url.searchParams.get("error_description");

    console.log("📊 Paramètres reçus:", {
      code: code ? `${code.substring(0, 20)}...` : "absent",
      state: state ? "présent" : "absent",
      error: error || "aucune",
      errorDescription: errorDescription || "aucune"
    });

    // Vérifier s'il y a une erreur OAuth
    if (error) {
      console.error("❌ Erreur OAuth reçue:", { error, errorDescription });
      return new Response(JSON.stringify({ 
        error: `Erreur OAuth: ${errorDescription || error}` 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    if (!code) {
      console.error("❌ Code manquant dans la requête");
      return new Response(JSON.stringify({ error: "Code d'autorisation manquant" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    console.log("🔍 Code reçu (premiers 50 caractères):", code.substring(0, 50));
    console.log("📏 Longueur du code:", code.length);

    if (!validateCode(code)) {
      console.error("❌ Code invalide:", {
        code: code.substring(0, 50),
        length: code.length,
        pattern: /^[a-zA-Z0-9_\-\.#%=&]+$/.test(code)
      });
      return new Response(JSON.stringify({ 
        error: "Format du code d'autorisation invalide",
        debug: {
          codeLength: code.length,
          codePreview: code.substring(0, 50),
          patternMatch: /^[a-zA-Z0-9_\-\.#%=&]+$/.test(code)
        }
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Validate environment variables
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    console.log("🔧 Variables d'environnement:", {
      SUPABASE_URL: SUPABASE_URL ? "présente" : "MANQUANTE",
      SUPABASE_SERVICE_ROLE_KEY: SUPABASE_SERVICE_ROLE_KEY ? "présente" : "MANQUANTE"
    });

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error("❌ Variables d'environnement Supabase manquantes");
      return new Response(JSON.stringify({ 
        error: "Configuration serveur incomplète - variables Supabase manquantes"
      }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

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
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

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

    // Rate limiting
    if (!checkRateLimit(userData.user.id)) {
      console.error("⚠️ Rate limit dépassé pour:", userData.user.id);
      return new Response(JSON.stringify({ error: "Trop de tentatives, réessayez plus tard" }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("✅ Utilisateur authentifié:", userData.user.id);

    // Récupérer la configuration Meta Ads de l'utilisateur depuis la base de données
    console.log("🔍 Récupération de la configuration Meta Ads...");
    const { data: metaConfig, error: configError } = await supabase
      .from('meta_ads_config')
      .select('client_id, client_secret, redirect_uri')
      .eq('user_id', userData.user.id)
      .maybeSingle();

    if (configError) {
      console.error("❌ Erreur lors de la récupération de la config:", configError);
      return new Response(JSON.stringify({ 
        error: "Erreur lors de la récupération de la configuration Meta Ads"
      }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!metaConfig) {
      console.error("❌ Configuration Meta Ads manquante pour l'utilisateur");
      return new Response(JSON.stringify({ 
        error: "Configuration Meta Ads non trouvée. Veuillez d'abord configurer vos paramètres Meta Ads."
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { client_id: FB_CLIENT_ID, client_secret: FB_CLIENT_SECRET, redirect_uri: REDIRECT_URI } = metaConfig;

    console.log("🔧 Configuration Meta récupérée:", {
      FB_CLIENT_ID: FB_CLIENT_ID ? `${FB_CLIENT_ID.substring(0, 4)}...` : "MANQUANT",
      FB_CLIENT_SECRET: FB_CLIENT_SECRET ? "présent" : "MANQUANT",
      REDIRECT_URI: REDIRECT_URI || "MANQUANT"
    });

    // Exchange code for token with timeout
    console.log("🔄 Échange du code contre un token...");
    const tokenUrl = `https://graph.facebook.com/v19.0/oauth/access_token?client_id=${FB_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&client_secret=${FB_CLIENT_SECRET}&code=${encodeURIComponent(code)}`;
    
    console.log("🌐 URL d'échange de token:", tokenUrl.replace(FB_CLIENT_SECRET, "***"));
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

    try {
      const tokenRes = await fetch(tokenUrl, { 
        method: "GET",
        headers: {
          "Accept": "application/json"
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      const tokenData = await tokenRes.json();
      console.log("📊 Réponse d'échange de token:", {
        status: tokenRes.status,
        ok: tokenRes.ok,
        hasAccessToken: !!tokenData.access_token,
        error: tokenData.error?.message || "aucune"
      });
      
      if (!tokenRes.ok) {
        console.error("❌ Échec de l'échange de token:", tokenData);
        const errorMsg = tokenData.error?.message || tokenData.error_description || 'Échec de la connexion Meta';
        return new Response(JSON.stringify({ 
          error: `Erreur Meta API: ${errorMsg}`,
          details: tokenData
        }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (!tokenData.access_token) {
        console.error("❌ Token d'accès manquant:", tokenData);
        return new Response(JSON.stringify({ 
          error: "Token d'accès manquant dans la réponse Meta",
          response: tokenData
        }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Get user info with timeout
      console.log("👤 Récupération des informations du compte...");
      const meController = new AbortController();
      const meTimeoutId = setTimeout(() => meController.abort(), 15000);

      try {
        const meRes = await fetch(`https://graph.facebook.com/v19.0/me?fields=id,name,email&access_token=${encodeURIComponent(tokenData.access_token)}`, {
          method: "GET",
          headers: {
            "Accept": "application/json"
          },
          signal: meController.signal
        });
        
        clearTimeout(meTimeoutId);
        
        const meData = await meRes.json();
        console.log("👤 Données utilisateur récupérées:", {
          status: meRes.ok,
          hasId: !!meData.id,
          hasName: !!meData.name,
          error: meData.error?.message || "aucune"
        });

        if (!meRes.ok || !meData.id) {
          console.error("❌ Impossible de récupérer les infos utilisateur:", meData);
          return new Response(JSON.stringify({ 
            error: `Impossible de récupérer les informations utilisateur: ${meData.error?.message || 'Erreur inconnue'}`,
            details: meData
          }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Store in database
        console.log("💾 Stockage en base Supabase...");
        const { error: insertError } = await supabase
          .from("meta_ads_integrations")
          .upsert(
            [
              {
                user_id: userData.user.id,
                access_token: tokenData.access_token,
                refresh_token: tokenData.refresh_token || null,
                expires_at: tokenData.expires_in
                  ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
                  : null,
                meta_account_id: meData.id,
                meta_account_name: meData.name || meData.email || "Compte Meta",
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

        console.log("✅ Connexion Meta Ads réussie pour:", meData.name);
        return new Response(
          JSON.stringify({ 
            success: true, 
            meta_account_name: meData.name || meData.email || "Compte Meta",
            meta_account_id: meData.id
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );

      } catch (error) {
        clearTimeout(meTimeoutId);
        if (error.name === 'AbortError') {
          throw new Error('Timeout lors de la récupération des informations utilisateur');
        }
        throw error;
      }

    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('Timeout lors de l\'échange du token');
      }
      throw error;
    }

  } catch (error) {
    console.error("💥 Erreur générale:", error);
    
    // Don't expose internal errors but provide more context for debugging
    const sanitizedError = error instanceof Error ? error.message : 'Erreur interne du serveur';

    return new Response(JSON.stringify({ 
      error: sanitizedError,
      timestamp: new Date().toISOString(),
      debug: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
