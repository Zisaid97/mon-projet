
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

    const { message, sessionId, context } = await req.json();

    console.log(`AI Chat for user ${user.id}, session: ${sessionId}`);

    // Get recent chat history (last 6 messages to limit context)
    const { data: chatHistory } = await supabase
      .from('ai_chat_history')
      .select('*')
      .eq('user_id', user.id)
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false })
      .limit(6);

    // Build conversation context
    const messages = [
      {
        role: 'system',
        content: `Tu es un assistant IA spécialisé dans TrackProfit, une plateforme d'analyse marketing pour l'e-commerce COD en Afrique.

Contexte utilisateur: ${context?.page || 'Dashboard'} 
Filtres actifs: ${JSON.stringify(context?.filters || {})}

Réponds en français, sois concis et actionnable. 
Focus sur l'analyse des données marketing (ROI, CPL, CPD, taux de livraison).
Propose des recommandations concrètes pour optimiser les performances.`
      }
    ];

    // Add chat history (reverse to get chronological order)
    if (chatHistory) {
      chatHistory.reverse().forEach(msg => {
        messages.push({
          role: msg.role as 'user' | 'assistant',
          content: msg.content
        });
      });
    }

    // Add current user message
    messages.push({
      role: 'user',
      content: message
    });

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: messages,
        temperature: 0.7,
        max_tokens: 500,
        stream: false
      }),
    });

    const aiResponse = await response.json();
    const assistantMessage = aiResponse.choices[0].message.content;

    // Save user message to history
    await supabase.from('ai_chat_history').insert({
      user_id: user.id,
      session_id: sessionId,
      role: 'user',
      content: message,
      context_data: context
    });

    // Save assistant response to history
    await supabase.from('ai_chat_history').insert({
      user_id: user.id,
      session_id: sessionId,
      role: 'assistant',
      content: assistantMessage,
      context_data: context
    });

    return new Response(
      JSON.stringify({ success: true, message: assistantMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in ai-chat:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
