
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { user_id } = await req.json();

    if (!user_id) {
      throw new Error('User ID is required');
    }

    // Fetch user's marketing and profit data
    const { data: marketingData, error: marketingError } = await supabase
      .from('marketing_performance')
      .select('*')
      .eq('user_id', user_id)
      .gte('date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

    if (marketingError) throw marketingError;

    const { data: profitData, error: profitError } = await supabase
      .from('profit_tracking')
      .select('*')
      .eq('user_id', user_id)
      .gte('date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

    if (profitError) throw profitError;

    // Analyze the data and generate insights
    const insights = await generateInsights(marketingData || [], profitData || []);

    // Store the insights in the database
    const { data: savedInsight, error: saveError } = await supabase
      .from('ai_insights')
      .insert({
        user_id,
        content: insights,
        insights_type: 'general',
        generated_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      })
      .select()
      .single();

    if (saveError) throw saveError;

    return new Response(
      JSON.stringify({ success: true, insight: savedInsight }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Error generating insights:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});

async function generateInsights(marketingData: any[], profitData: any[]): Promise<string> {
  // Analyze marketing performance
  const totalSpend = marketingData.reduce((sum, item) => sum + item.spend_usd * 10.5, 0);
  const totalLeads = marketingData.reduce((sum, item) => sum + item.leads, 0);
  const totalDeliveries = marketingData.reduce((sum, item) => sum + item.deliveries, 0);
  const totalRevenue = marketingData.reduce((sum, item) => sum + item.margin_per_order * item.deliveries, 0);
  
  const roi = totalSpend > 0 ? ((totalRevenue - totalSpend) / totalSpend) * 100 : 0;
  const deliveryRate = totalLeads > 0 ? (totalDeliveries / totalLeads) * 100 : 0;
  const cpl = totalLeads > 0 ? totalSpend / totalLeads : 0;
  const cpd = totalDeliveries > 0 ? totalSpend / totalDeliveries : 0;

  // Analyze products
  const productPerformance = profitData.reduce((acc, item) => {
    if (!acc[item.product_name]) {
      acc[item.product_name] = {
        revenue: 0,
        quantity: 0,
        margin: 0
      };
    }
    acc[item.product_name].revenue += item.commission_total;
    acc[item.product_name].quantity += item.quantity;
    acc[item.product_name].margin += item.commission_total / item.quantity;
    return acc;
  }, {});

  const topProducts = Object.entries(productPerformance)
    .sort(([,a], [,b]) => (b as any).revenue - (a as any).revenue)
    .slice(0, 3);

  // Generate insights
  let insights = `**📊 Analyse de Performance - ${new Date().toLocaleDateString('fr-FR')}**\n\n`;
  
  insights += `**🎯 KPIs Globaux**\n`;
  insights += `• ROI: ${roi.toFixed(1)}% ${roi >= 30 ? '✅ Excellent' : roi >= 15 ? '⚠️ Acceptable' : '❌ À améliorer'}\n`;
  insights += `• Taux de livraison: ${deliveryRate.toFixed(1)}% ${deliveryRate >= 15 ? '✅ Bon' : deliveryRate >= 10 ? '⚠️ Moyen' : '❌ Faible'}\n`;
  insights += `• CPL: ${cpl.toFixed(2)} MAD ${cpl <= 15 ? '✅ Optimal' : cpl <= 25 ? '⚠️ Acceptable' : '❌ Élevé'}\n`;
  insights += `• CPD: ${cpd.toFixed(2)} MAD ${cpd <= 150 ? '✅ Optimal' : cpd <= 250 ? '⚠️ Acceptable' : '❌ Élevé'}\n\n`;

  insights += `**🚀 Recommandations Stratégiques**\n`;
  
  if (roi < 15) {
    insights += `• ❌ **ROI Critique**: Réduisez immédiatement les dépenses publicitaires et concentrez-vous sur les campagnes les plus performantes\n`;
  } else if (roi >= 30) {
    insights += `• ✅ **ROI Excellent**: Augmentez les budgets sur les campagnes performantes pour scaler\n`;
  }

  if (deliveryRate < 10) {
    insights += `• ❌ **Taux de livraison faible**: Vérifiez la qualité des leads et optimisez le processus de qualification\n`;
  }

  if (cpd > 250) {
    insights += `• ❌ **CPD élevé**: Optimisez le ciblage publicitaire et testez de nouveaux créatifs\n`;
  }

  insights += `\n**🏆 Top Produits Performants**\n`;
  topProducts.forEach(([productName, performance], index) => {
    const perf = performance as any;
    insights += `${index + 1}. **${productName}**: ${perf.revenue.toFixed(0)} MAD de CA (${perf.quantity} ventes)\n`;
  });

  insights += `\n**💡 Actions Prioritaires**\n`;
  insights += `• Augmentez le budget sur les 2 meilleurs produits\n`;
  insights += `• Testez 3 nouveaux créatifs cette semaine\n`;
  insights += `• Analysez les données par ville pour identifier les marchés sous-exploités\n`;
  insights += `• Mettez en pause les campagnes avec ROI < 10%\n`;

  return insights;
}
