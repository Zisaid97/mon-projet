
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get user from auth header
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Invalid authentication');
    }

    const { month, year } = await req.json();
    const currentMonth = month || new Date().getMonth() + 1;
    const currentYear = year || new Date().getFullYear();

    console.log(`Generating insights for user ${user.id}, month: ${currentMonth}, year: ${currentYear}`);

    // Check if we have cached insights
    const { data: cachedInsights } = await supabase
      .from('insights_cache')
      .select('*')
      .eq('user_id', user.id)
      .eq('insights_type', 'monthly')
      .gte('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1);

    if (cachedInsights && cachedInsights.length > 0) {
      console.log('Returning cached insights');
      return new Response(
        JSON.stringify({ success: true, insights: cachedInsights[0] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Aggregate KPIs data
    const startDate = `${currentYear}-${currentMonth.toString().padStart(2, '0')}-01`;
    const endDate = new Date(currentYear, currentMonth, 0).toISOString().split('T')[0];

    // Get marketing performance data
    const { data: marketingData } = await supabase
      .from('marketing_performance')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', startDate)
      .lte('date', endDate);

    // Get profit tracking data
    const { data: profitData } = await supabase
      .from('profit_tracking')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', startDate)
      .lte('date', endDate);

    // Get country data
    const { data: countryData } = await supabase
      .from('country_data')
      .select('*')
      .eq('user_id', user.id);

    // Calculate aggregated metrics
    const totalSpend = marketingData?.reduce((sum, item) => sum + (item.spend_usd * 10.5), 0) || 0;
    const totalLeads = marketingData?.reduce((sum, item) => sum + item.leads, 0) || 0;
    const totalDeliveries = marketingData?.reduce((sum, item) => sum + item.deliveries, 0) || 0;
    const totalRevenue = profitData?.reduce((sum, item) => sum + item.commission_total, 0) || 0;
    
    const roi = totalSpend > 0 ? ((totalRevenue - totalSpend) / totalSpend) * 100 : 0;
    const deliveryRate = totalLeads > 0 ? (totalDeliveries / totalLeads) * 100 : 0;
    const cpl = totalLeads > 0 ? totalSpend / totalLeads : 0;
    const cpd = totalDeliveries > 0 ? totalSpend / totalDeliveries : 0;

    // Top products by revenue
    const productPerformance = profitData?.reduce((acc, item) => {
      if (!acc[item.product_name]) {
        acc[item.product_name] = { revenue: 0, quantity: 0, profit: 0 };
      }
      acc[item.product_name].revenue += item.commission_total;
      acc[item.product_name].quantity += item.quantity;
      acc[item.product_name].profit += item.commission_total;
      return acc;
    }, {} as Record<string, any>) || {};

    const topProducts = Object.entries(productPerformance)
      .sort(([,a], [,b]) => (b as any).revenue - (a as any).revenue)
      .slice(0, 5);

    // Build data context for AI
    const dataContext = {
      period: { month: currentMonth, year: currentYear },
      metrics: {
        totalSpend: Math.round(totalSpend),
        totalRevenue: Math.round(totalRevenue),
        roi: Math.round(roi * 10) / 10,
        deliveryRate: Math.round(deliveryRate * 10) / 10,
        cpl: Math.round(cpl * 10) / 10,
        cpd: Math.round(cpd * 10) / 10,
        totalLeads,
        totalDeliveries
      },
      topProducts: topProducts.map(([name, data]) => ({
        name,
        revenue: Math.round((data as any).revenue),
        quantity: (data as any).quantity
      })),
      countries: countryData?.map(country => ({
        name: country.country_name,
        roi: Math.round(country.roi_percent * 10) / 10,
        revenue: Math.round(country.revenue_mad)
      })) || []
    };

    // Generate AI insights
    const systemPrompt = `Tu es un analyste marketing spécialisé dans l'e-commerce COD (Cash on Delivery) en Afrique.
Génère des insights stratégiques concis et actionnables basés sur les données fournies.
Réponds en français, avec des recommandations spécifiques et chiffrées.
Format : titre + bullets courts (≤ 140 caractères par bullet).
Focus sur : produits à scaler, campagnes à optimiser, anomalies à corriger.`;

    const userPrompt = `Analyse ces données pour ${currentMonth}/${currentYear}:

MÉTRIQUES GLOBALES:
- Dépenses: ${dataContext.metrics.totalSpend} MAD
- CA: ${dataContext.metrics.totalRevenue} MAD  
- ROI: ${dataContext.metrics.roi}%
- Taux livraison: ${dataContext.metrics.deliveryRate}%
- CPL: ${dataContext.metrics.cpl} MAD
- CPD: ${dataContext.metrics.cpd} MAD

TOP PRODUITS:
${dataContext.topProducts.map(p => `- ${p.name}: ${p.revenue} MAD (${p.quantity} ventes)`).join('\n')}

PAYS:
${dataContext.countries.map(c => `- ${c.name}: ${c.roi}% ROI, ${c.revenue} MAD`).join('\n')}

Génère:
1. Top 3 produits à scaler
2. 2 optimisations urgentes 
3. 1 alerte critique si applicable`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.6,
        max_tokens: 1000,
      }),
    });

    const aiResponse = await response.json();
    const generatedInsights = aiResponse.choices[0].message.content;

    // Store insights in cache
    const { data: savedInsight, error: saveError } = await supabase
      .from('insights_cache')
      .insert({
        user_id: user.id,
        content: generatedInsights,
        insights_type: 'monthly',
        generated_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      })
      .select()
      .single();

    if (saveError) {
      console.error('Error saving insights:', saveError);
    }

    console.log('Generated and cached new insights');
    return new Response(
      JSON.stringify({ success: true, insights: savedInsight || { content: generatedInsights } }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in ai-generate-insights:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
