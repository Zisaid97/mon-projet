
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { data: { user } } = await supabaseClient.auth.getUser(token)

    if (!user) {
      throw new Error('Unauthorized')
    }

    const { action, code, redirectUri, refresh_token } = await req.json()

    const clientId = Deno.env.get('GOOGLE_CLIENT_ID')
    const clientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET')

    console.log('Google OAuth request:', { action, redirectUri, userId: user.id })

    if (action === 'get_auth_url') {
      if (!redirectUri) {
        throw new Error('Missing redirectUri parameter');
      }
      
      const scopes = [
        'https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/drive.readonly'
      ].join(' ')

      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${clientId}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `scope=${encodeURIComponent(scopes)}&` +
        `response_type=code&` +
        `access_type=offline&` +
        `prompt=consent&` +
        `state=${user.id}`

      console.log('Generated auth URL for user:', user.id)
      
      return new Response(
        JSON.stringify({ auth_url: authUrl }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'exchange_code') {
      if (!code || !redirectUri) {
        throw new Error('Missing code or redirectUri parameter');
      }
      
      console.log('Exchanging code for user:', user.id, 'with redirectUri:', redirectUri)
      
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: clientId!,
          client_secret: clientSecret!,
          code,
          grant_type: 'authorization_code',
          redirect_uri: redirectUri,
        }),
      })

      const tokens = await tokenResponse.json()
      console.log('Token exchange response status:', tokenResponse.status)

      if (tokens.error) {
        console.error('Token exchange error:', tokens)
        throw new Error(`Token exchange failed: ${tokens.error_description || tokens.error}`)
      }

      // Get user info from Google
      const userInfoResponse = await fetch(
        `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${tokens.access_token}`
      )
      const userInfo = await userInfoResponse.json()
      console.log('Google user info retrieved for:', userInfo.email)

      // Create admin client to bypass RLS
      const supabaseAdmin = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      )

      // Prepare integration data for upsert
      const integrationData: { [key: string]: any } = {
        user_id: user.id,
        access_token: tokens.access_token,
        expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
        google_email: userInfo.email,
        google_name: userInfo.name,
      };

      // Only include refresh_token if it's provided by Google.
      if (tokens.refresh_token) {
        integrationData.refresh_token = tokens.refresh_token;
      }

      // Check if an integration already exists for this user
      const { data: existingIntegration } = await supabaseAdmin
        .from('google_integrations')
        .select('user_id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!existingIntegration) {
        integrationData.connected_at = new Date().toISOString();
      }

      console.log('Upserting integration for user:', user.id)

      // Store tokens in database
      const { error } = await supabaseAdmin
        .from('google_integrations')
        .upsert(integrationData, { onConflict: 'user_id' });

      if (error) {
        console.error('Database upsert error:', error)
        throw error
      }

      console.log('Google integration successful for user:', user.id)

      return new Response(
        JSON.stringify({ 
          success: true, 
          user_info: { 
            email: userInfo.email, 
            name: userInfo.name 
          } 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'refresh_token') {
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: clientId!,
          client_secret: clientSecret!,
          refresh_token,
          grant_type: 'refresh_token',
        }),
      })

      const tokens = await tokenResponse.json()

      if (tokens.error) {
        throw new Error(`Token refresh failed: ${tokens.error}`)
      }

      // Create admin client to bypass RLS
      const supabaseAdmin = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      )

      // Update tokens in database
      const { error } = await supabaseAdmin
        .from('google_integrations')
        .update({
          access_token: tokens.access_token,
          expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
        })
        .eq('user_id', user.id)

      if (error) throw error

      return new Response(
        JSON.stringify({ success: true, access_token: tokens.access_token }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Google Auth Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
