
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  console.log('Auth service request:', req.method, req.url)

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { data: { user } } = await supabaseClient.auth.getUser(token)

    if (!user) {
      throw new Error('User not authenticated')
    }

    console.log('Authenticated user:', user.id)

    const { action, settings, identifier } = await req.json()
    console.log('Auth service action:', action)

    if (action === 'update_settings') {
      // For demo purposes, just return success
      // In a real implementation, you would update auth settings in your configuration
      
      return new Response(JSON.stringify({
        success: true,
        message: 'Auth settings updated successfully'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (action === 'test_rate_limit') {
      if (!identifier) {
        throw new Error('Identifier is required')
      }

      // Check current rate limit attempts
      const { count } = await supabaseClient
        .from('auth_rate_limits')
        .select('*', { count: 'exact', head: true })
        .eq('identifier', identifier)
        .eq('action', 'login')
        .gte('created_at', new Date(Date.now() - 15 * 60 * 1000).toISOString()) // Last 15 minutes

      const maxAttempts = 5
      const allowed = (count || 0) < maxAttempts

      // Log this test attempt
      await supabaseClient
        .from('auth_rate_limits')
        .insert({
          identifier,
          action: 'test_login',
          success: allowed
        })

      return new Response(JSON.stringify({
        success: true,
        data: {
          allowed,
          attempts: count || 0,
          maxAttempts,
          resetTime: new Date(Date.now() + 15 * 60 * 1000).toISOString()
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    throw new Error('Invalid action')

  } catch (error) {
    console.error('Auth service error:', error)
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
