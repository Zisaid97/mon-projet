
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Available integrations
const availableIntegrations = [
  {
    id: 'google-ads',
    name: 'Google Ads',
    description: 'Sync Google Ads campaign data and performance metrics',
    category: 'advertising',
    auth_type: 'oauth2',
    required_scopes: ['https://www.googleapis.com/auth/adwords'],
    webhook_events: ['campaign.created', 'campaign.updated', 'campaign.paused']
  },
  {
    id: 'facebook-ads',
    name: 'Facebook Ads', 
    description: 'Sync Facebook and Instagram ad performance data',
    category: 'advertising',
    auth_type: 'oauth2',
    required_scopes: ['ads_read', 'ads_management'],
    webhook_events: ['campaign.created', 'campaign.updated', 'adset.updated']
  },
  {
    id: 'tiktok-ads',
    name: 'TikTok Ads',
    description: 'Sync TikTok advertising campaign data', 
    category: 'advertising',
    auth_type: 'oauth2',
    required_scopes: ['advertiser.read', 'campaign.read'],
    webhook_events: ['campaign.status_changed']
  },
  {
    id: 'google-analytics',
    name: 'Google Analytics',
    description: 'Import website traffic and conversion data',
    category: 'analytics',
    auth_type: 'oauth2',
    required_scopes: ['https://www.googleapis.com/auth/analytics.readonly'],
    webhook_events: []
  },
  {
    id: 'shopify',
    name: 'Shopify',
    description: 'Sync e-commerce sales and customer data',
    category: 'ecommerce',
    auth_type: 'api_key',
    webhook_events: ['orders/create', 'orders/updated', 'customers/create']
  },
  {
    id: 'woocommerce', 
    name: 'WooCommerce',
    description: 'Sync WordPress e-commerce data',
    category: 'ecommerce',
    auth_type: 'api_key',
    webhook_events: ['order.created', 'order.updated', 'customer.created']
  },
  {
    id: 'hubspot',
    name: 'HubSpot',
    description: 'Sync CRM contacts, deals, and marketing data',
    category: 'crm',
    auth_type: 'oauth2',
    required_scopes: ['contacts', 'deals', 'marketing'],
    webhook_events: ['contact.creation', 'deal.creation', 'contact.propertyChange']
  },
  {
    id: 'salesforce',
    name: 'Salesforce',
    description: 'Sync CRM leads, opportunities, and accounts',
    category: 'crm',
    auth_type: 'oauth2',
    required_scopes: ['api', 'refresh_token'],
    webhook_events: ['lead.created', 'opportunity.updated']
  },
  {
    id: 'mailchimp',
    name: 'Mailchimp',
    description: 'Sync email marketing campaigns and subscriber data',
    category: 'email_marketing',
    auth_type: 'api_key',
    webhook_events: ['subscribe', 'unsubscribe', 'campaign.sent']
  },
  {
    id: 'klaviyo',
    name: 'Klaviyo',
    description: 'Sync email and SMS marketing data',
    category: 'email_marketing',
    auth_type: 'api_key',
    webhook_events: ['person.created', 'metric.created']
  }
]

serve(async (req) => {
  console.log('Integration service request:', req.method, req.url)

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        },
        global: {
          headers: {
            Authorization: authHeader
          }
        }
      }
    )

    const { data: { user } } = await supabaseClient.auth.getUser(token)

    if (!user) {
      throw new Error('User not authenticated')
    }

    console.log('Authenticated user:', user.id)

    const { action, integration_id, config } = await req.json()
    console.log('Integration service action:', action, 'integration_id:', integration_id)

    if (action === 'get_integrations_overview') {
      // Get user integrations
      const { data: userIntegrations, error: integrationsError } = await supabaseClient
        .from('user_integrations')
        .select('*')
        .eq('user_id', user.id)

      if (integrationsError) {
        console.error('Error fetching user integrations:', integrationsError)
        throw integrationsError
      }

      // Add status to available integrations
      const availableWithStatus = availableIntegrations.map(integration => ({
        ...integration,
        status: userIntegrations?.some(ui => ui.integration_id === integration.id && ui.active) 
          ? 'installed' : 'available'
      }))

      // Calculate stats
      const totalIntegrations = userIntegrations?.length || 0
      const activeIntegrations = userIntegrations?.filter(ui => ui.active).length || 0
      const failedSyncs = 0 // TODO: Calculate from logs
      const lastSyncTime = userIntegrations?.reduce((latest, ui) => 
        ui.last_sync_at && (!latest || ui.last_sync_at > latest) ? ui.last_sync_at : latest, null)

      const result = {
        success: true,
        data: {
          userIntegrations: userIntegrations || [],
          availableIntegrations: availableWithStatus,
          stats: {
            totalIntegrations,
            activeIntegrations,
            failedSyncs,
            lastSyncTime
          }
        }
      }

      console.log('Integration service result:', JSON.stringify(result, null, 2))
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (action === 'install_integration') {
      if (!integration_id) {
        throw new Error('Integration ID is required')
      }

      // Check if integration exists in available list
      const integration = availableIntegrations.find(i => i.id === integration_id)
      if (!integration) {
        throw new Error('Integration not found')
      }

      // Install or reactivate integration
      const { data, error } = await supabaseClient
        .from('user_integrations')
        .upsert({
          user_id: user.id,
          integration_id,
          config: config || {},
          active: true,
          installed_at: new Date().toISOString(),
          sync_status: 'never'
        }, {
          onConflict: 'user_id,integration_id'
        })
        .select()
        .single()

      if (error) {
        console.error('Error installing integration:', error)
        throw error
      }

      // Log the installation
      await supabaseClient
        .from('integration_logs')
        .insert({
          user_id: user.id,
          integration_id,
          action: 'install',
          status: 'success',
          metadata: { config }
        })

      return new Response(JSON.stringify({
        success: true,
        data
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (action === 'toggle_integration') {
      if (!integration_id) {
        throw new Error('Integration ID is required')
      }

      // Get current status
      const { data: current, error: fetchError } = await supabaseClient
        .from('user_integrations')
        .select('*')
        .eq('user_id', user.id)
        .eq('integration_id', integration_id)
        .single()

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError
      }

      let result
      if (current) {
        // Toggle existing integration
        const { data, error } = await supabaseClient
          .from('user_integrations')
          .update({ 
            active: !current.active,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id)
          .eq('integration_id', integration_id)
          .select()
          .single()

        if (error) throw error
        result = data
      } else {
        // Install new integration
        const { data, error } = await supabaseClient
          .from('user_integrations')
          .insert({
            user_id: user.id,
            integration_id,
            config: {},
            active: true,
            sync_status: 'never'
          })
          .select()
          .single()

        if (error) throw error
        result = data
      }

      // Log the action
      await supabaseClient
        .from('integration_logs')
        .insert({
          user_id: user.id,
          integration_id,
          action: result.active ? 'activate' : 'deactivate',
          status: 'success'
        })

      return new Response(JSON.stringify({
        success: true,
        data: result
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (action === 'sync_integration') {
      if (!integration_id) {
        throw new Error('Integration ID is required')
      }

      // Update sync status
      const { data, error } = await supabaseClient
        .from('user_integrations')
        .update({
          last_sync_at: new Date().toISOString(),
          sync_status: 'syncing',
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .eq('integration_id', integration_id)
        .select()
        .single()

      if (error) {
        throw error
      }

      // Log sync attempt
      await supabaseClient
        .from('integration_logs')
        .insert({
          user_id: user.id,
          integration_id,
          action: 'sync',
          status: 'started'
        })

      // Simulate sync completion after a delay
      setTimeout(async () => {
        await supabaseClient
          .from('user_integrations')
          .update({
            sync_status: 'completed',
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id)
          .eq('integration_id', integration_id)

        await supabaseClient
          .from('integration_logs')
          .insert({
            user_id: user.id,
            integration_id,
            action: 'sync',
            status: 'completed'
          })
      }, 2000)

      return new Response(JSON.stringify({
        success: true,
        data
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    throw new Error('Invalid action')

  } catch (error) {
    console.error('Integration service error:', error)
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
