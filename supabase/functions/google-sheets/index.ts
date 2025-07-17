
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Rate limiting
const rateLimiter = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 30; // requests per minute
const RATE_WINDOW = 60 * 1000; // 1 minute

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const userLimit = rateLimiter.get(userId);
  
  if (!userLimit || now > userLimit.resetTime) {
    rateLimiter.set(userId, { count: 1, resetTime: now + RATE_WINDOW });
    return true;
  }
  
  if (userLimit.count >= RATE_LIMIT) {
    return false;
  }
  
  userLimit.count++;
  return true;
}

// Input validation
function validateSpreadsheetId(id: string): boolean {
  return /^[a-zA-Z0-9-_]{44}$/.test(id);
}

function validateRange(range: string): boolean {
  return /^[A-Z]+[0-9]+:[A-Z]+[0-9]+$/.test(range) || /^.+![A-Z]+[0-9]+:[A-Z]+[0-9]+$/.test(range);
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

    const authHeader = req.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('Missing or invalid authorization header')
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token)

    if (userError) {
      console.error('Auth error:', userError)
      throw new Error('Authentication failed')
    }
    if (!user) {
      throw new Error('User not authenticated')
    }

    // Rate limiting
    if (!checkRateLimit(user.id)) {
      return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Create admin client to bypass RLS and fetch integration data
    const supabaseAdmin = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get Google integration for user
    const { data: integration, error: integrationError } = await supabaseAdmin
      .from('google_integrations')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()

    if (integrationError) {
      console.error('Integration error:', integrationError)
      throw new Error('Failed to fetch integration data')
    }

    if (!integration) {
      return new Response(JSON.stringify({ error: 'Google Sheets not connected' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    let accessToken = integration.access_token

    // Check if token needs refresh
    if (new Date(integration.expires_at) <= new Date()) {
      if (!integration.refresh_token) {
        throw new Error('No refresh token available')
      }

      supabaseClient.functions.setAuth(token)
      
      const { data: refreshData, error: refreshError } = await supabaseClient.functions.invoke(
        'google-auth', 
        {
          body: {
            action: 'refresh_token',
            refresh_token: integration.refresh_token,
          }
        }
      )

      if (refreshError) {
        console.error('Token refresh invocation error:', refreshError)
        throw new Error('Failed to refresh Google token.')
      }

      if (refreshData.success) {
        accessToken = refreshData.access_token
      } else {
        console.error('Token refresh failed:', refreshData.error)
        throw new Error(refreshData.error || 'Failed to refresh Google token')
      }
    }

    const requestBody = await req.json()
    const { action, spreadsheetId, range, values, sheetName } = requestBody

    // Validate inputs
    if (spreadsheetId && !validateSpreadsheetId(spreadsheetId)) {
      throw new Error('Invalid spreadsheet ID format')
    }

    if (range && !validateRange(range)) {
      throw new Error('Invalid range format')
    }

    if (action === 'list_spreadsheets') {
      const response = await fetch(
        'https://www.googleapis.com/drive/v3/files?q=mimeType="application/vnd.google-apps.spreadsheet"&fields=files(id,name,modifiedTime)',
        {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        }
      )
      if (!response.ok) {
        const errorData = await response.json()
        console.error("Google Drive API error:", errorData)
        throw new Error(errorData.error?.message || 'Failed to list spreadsheets from Google')
      }
      const data = await response.json()
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (action === 'get_sheet_info') {
      if (!spreadsheetId) throw new Error("spreadsheetId is required for get_sheet_info")
      const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`,
        {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        }
      )
      if (!response.ok) {
        const errorData = await response.json()
        console.error("Google Sheets API error (get_sheet_info):", errorData)
        throw new Error(errorData.error?.message || 'Failed to get sheet info from Google')
      }
      const data = await response.json()
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (action === 'read_range') {
      if (!spreadsheetId || !range) throw new Error("spreadsheetId and range are required for read_range")
      const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}`,
        {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        }
      )
      if (!response.ok) {
        const errorData = await response.json()
        console.error("Google Sheets API error (read_range):", errorData)
        throw new Error(errorData.error?.message || 'Failed to read sheet data from Google')
      }
      const data = await response.json()
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (action === 'write_data') {
      if (!spreadsheetId || !range || !values) throw new Error("spreadsheetId, range, and values are required for write_data")
      
      // Validate values array
      if (!Array.isArray(values) || values.length === 0) {
        throw new Error('Invalid values format')
      }

      const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}?valueInputOption=RAW`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ values })
        }
      )
      if (!response.ok) {
        const errorData = await response.json()
        console.error("Google Sheets API error (write_data):", errorData)
        throw new Error(errorData.error?.message || 'Failed to write sheet data to Google')
      }
      const data = await response.json()
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (action === 'create_spreadsheet') {
      const response = await fetch(
        'https://sheets.googleapis.com/v4/spreadsheets',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            properties: { title: sheetName || 'Export Data' },
            sheets: [
              { properties: { title: 'Marketing' } },
              { properties: { title: 'Financial' } },
              { properties: { title: 'Profits' } }
            ]
          })
        }
      )
      if (!response.ok) {
        const errorData = await response.json()
        console.error("Google Sheets API error (create_spreadsheet):", errorData)
        throw new Error(errorData.error?.message || 'Failed to create spreadsheet in Google')
      }
      const data = await response.json()
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Google Sheets Error:', error)
    
    // Don't expose internal errors to client
    const sanitizedError = error instanceof Error ? 
      (error.message.includes('rate limit') || error.message.includes('Invalid') || error.message.includes('required') ? 
        error.message : 'Internal server error') : 
      'Internal server error';

    return new Response(
      JSON.stringify({ error: sanitizedError }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
