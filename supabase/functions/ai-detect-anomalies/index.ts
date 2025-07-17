
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
    
    console.log('Running AI anomaly detection...');

    // Get all active users
    const { data: users } = await supabase
      .from('marketing_performance')
      .select('user_id')
      .gte('date', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

    if (!users) return new Response('No users found', { status: 200 });

    const uniqueUsers = [...new Set(users.map(u => u.user_id))];

    for (const userId of uniqueUsers) {
      // Get yesterday's performance data
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      const { data: dailyData } = await supabase
        .from('marketing_performance')
        .select('*')
        .eq('user_id', userId)
        .eq('date', yesterday);

      if (!dailyData || dailyData.length === 0) continue;

      // Calculate daily metrics
      const totalSpend = dailyData.reduce((sum, item) => sum + (item.spend_usd * 10.5), 0);
      const totalLeads = dailyData.reduce((sum, item) => sum + item.leads, 0);
      const totalDeliveries = dailyData.reduce((sum, item) => sum + item.deliveries, 0);
      const totalRevenue = dailyData.reduce((sum, item) => sum + (item.margin_per_order * item.deliveries), 0);
      
      const roi = totalSpend > 0 ? ((totalRevenue - totalSpend) / totalSpend) * 100 : 0;
      const deliveryRate = totalLeads > 0 ? (totalDeliveries / totalLeads) * 100 : 0;
      const cpl = totalLeads > 0 ? totalSpend / totalLeads : 0;
      const cpd = totalDeliveries > 0 ? totalSpend / totalDeliveries : 0;

      const anomalies = [];

      // Detect anomalies
      if (cpl > 25) {
        anomalies.push(`CPL élevé: ${cpl.toFixed(1)} MAD`);
      }
      if (roi < 10) {
        anomalies.push(`ROI faible: ${roi.toFixed(1)}%`);
      }
      if (deliveryRate < 8) {
        anomalies.push(`Taux livraison bas: ${deliveryRate.toFixed(1)}%`);
      }
      if (cpd > 200) {
        anomalies.push(`CPD élevé: ${cpd.toFixed(1)} MAD`);
      }

      if (anomalies.length > 0) {
        // Generate AI suggestion
        const prompt = `Anomalies détectées hier: ${anomalies.join(', ')}.
        Dépenses: ${totalSpend.toFixed(0)} MAD, CA: ${totalRevenue.toFixed(0)} MAD.
        
        Donne 3 actions correctives concrètes (max 120 mots total):`;

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { 
                role: 'system', 
                content: 'Tu es un expert marketing e-commerce. Réponds en français avec des actions précises et chiffrées.' 
              },
              { role: 'user', content: prompt }
            ],
            temperature: 0.5,
            max_tokens: 200,
          }),
        });

        const aiResponse = await response.json();
        const suggestion = aiResponse.choices[0].message.content;

        // Save alert
        await supabase.from('alerts_ai').insert({
          user_id: userId,
          type: 'anomaly',
          title: `Anomalies détectées - ${yesterday}`,
          content: suggestion,
          severity: roi < 0 ? 'high' : cpl > 30 ? 'high' : 'medium',
          data: {
            date: yesterday,
            metrics: { roi, deliveryRate, cpl, cpd, totalSpend, totalRevenue },
            anomalies
          }
        });

        console.log(`Created anomaly alert for user ${userId}`);
      }
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Anomaly detection completed' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in ai-detect-anomalies:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
