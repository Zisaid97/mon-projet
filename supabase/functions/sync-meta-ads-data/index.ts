import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface MetaAdsInsight {
  campaign_id: string;
  campaign_name: string;
  date_start: string;
  spend: string;
  impressions: string;
  clicks: string;
  actions?: Array<{
    action_type: string;
    value: string;
  }>;
}

interface MetaAdsResponse {
  data: MetaAdsInsight[];
  paging?: {
    next?: string;
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    console.log('🔄 Début de la synchronisation Meta Ads...');

    // Récupérer tous les utilisateurs ayant une intégration Meta active
    const { data: integrations, error: integrationsError } = await supabase
      .from('meta_ads_integrations')
      .select('*')
      .not('access_token', 'is', null);

    if (integrationsError) {
      throw new Error(`Erreur récupération intégrations: ${integrationsError.message}`);
    }

    console.log(`📊 ${integrations?.length || 0} intégrations Meta trouvées`);

    const results = [];
    
    for (const integration of integrations || []) {
      try {
        console.log(`🔄 Synchronisation pour l'utilisateur ${integration.user_id}`);
        
        // Calculer la date d'hier pour récupérer les données les plus récentes
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const dateStr = yesterday.toISOString().split('T')[0];

        // Appel à l'API Meta Ads pour récupérer les insights
        const metaUrl = `https://graph.facebook.com/v18.0/${integration.meta_account_id}/insights`;
        const params = new URLSearchParams({
          access_token: integration.access_token,
          time_range: JSON.stringify({
            since: dateStr,
            until: dateStr
          }),
          fields: 'campaign_id,campaign_name,spend,impressions,clicks,actions',
          level: 'campaign',
          limit: '1000'
        });

        console.log(`📡 Appel API Meta: ${metaUrl}?${params.toString()}`);
        
        const metaResponse = await fetch(`${metaUrl}?${params.toString()}`);
        
        if (!metaResponse.ok) {
          const errorText = await metaResponse.text();
          console.error(`❌ Erreur API Meta pour ${integration.user_id}:`, errorText);
          
          // Si le token a expiré, marquer l'intégration comme inactive
          if (metaResponse.status === 401) {
            await supabase
              .from('meta_ads_integrations')
              .update({ expires_at: new Date().toISOString() })
              .eq('user_id', integration.user_id);
          }
          
          continue;
        }

        const metaData: MetaAdsResponse = await metaResponse.json();
        console.log(`📈 ${metaData.data?.length || 0} campagnes trouvées pour ${integration.user_id}`);

        if (!metaData.data || metaData.data.length === 0) {
          console.log(`ℹ️ Aucune donnée pour ${integration.user_id} le ${dateStr}`);
          continue;
        }

        // Récupérer le taux de change actuel (ou utiliser 10.5 par défaut)
        const { data: exchangeRateData } = await supabase
          .from('monthly_average_exchange_rates')
          .select('average_rate')
          .eq('user_id', integration.user_id)
          .eq('year', yesterday.getFullYear())
          .eq('month', yesterday.getMonth() + 1)
          .single();

        const exchangeRate = exchangeRateData?.average_rate || 10.5;

        // Préparer les données pour insertion
        const spendData = metaData.data.map(insight => {
          const spendUsd = parseFloat(insight.spend) || 0;
          const leads = insight.actions?.find(action => action.action_type === 'lead')?.value || '0';
          
          return {
            user_id: integration.user_id,
            campaign_id: insight.campaign_id,
            campaign_name: insight.campaign_name,
            date: dateStr,
            spend_usd: spendUsd,
            spend_mad: spendUsd * exchangeRate,
            impressions: parseInt(insight.impressions) || 0,
            clicks: parseInt(insight.clicks) || 0,
            leads: parseInt(leads) || 0,
            exchange_rate: exchangeRate,
            synced_at: new Date().toISOString()
          };
        });

        // Insérer ou mettre à jour les données (upsert)
        const { error: upsertError } = await supabase
          .from('meta_spend_daily')
          .upsert(
            spendData,
            { 
              onConflict: 'user_id,campaign_id,date',
              ignoreDuplicates: false 
            }
          );

        if (upsertError) {
          console.error(`❌ Erreur upsert pour ${integration.user_id}:`, upsertError);
          continue;
        }

        console.log(`✅ ${spendData.length} enregistrements synchronisés pour ${integration.user_id}`);
        
        results.push({
          user_id: integration.user_id,
          campaigns_synced: spendData.length,
          date: dateStr,
          total_spend_usd: spendData.reduce((sum, item) => sum + item.spend_usd, 0)
        });

      } catch (userError) {
        console.error(`❌ Erreur pour l'utilisateur ${integration.user_id}:`, userError);
        results.push({
          user_id: integration.user_id,
          error: userError.message
        });
      }
    }

    console.log('✅ Synchronisation Meta Ads terminée');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Synchronisation Meta Ads terminée',
        results,
        total_integrations: integrations?.length || 0,
        successful_syncs: results.filter(r => !r.error).length
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('❌ Erreur générale synchronisation Meta:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});