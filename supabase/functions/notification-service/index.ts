
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  console.log('Notification service request:', req.method, req.url)

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

    const { action, template, type, recipient, template_id, variables } = await req.json()
    console.log('Notification service action:', action)

    if (action === 'get_templates_and_stats') {
      // Get templates
      const { data: templates } = await supabaseClient
        .from('notification_templates')
        .select('*')
        .eq('user_id', user.id)

      // Get notification stats
      const { count: totalSent } = await supabaseClient
        .from('notification_logs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)

      const { count: delivered } = await supabaseClient
        .from('notification_logs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'delivered')

      const deliveryRate = totalSent > 0 ? (delivered / totalSent) * 100 : 0
      const openRate = 25.5 // Mock data
      const clickRate = 5.2 // Mock data

      return new Response(JSON.stringify({
        success: true,
        data: {
          templates: templates || [],
          stats: {
            totalSent: totalSent || 0,
            deliveryRate,
            openRate,
            clickRate
          }
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (action === 'create_template') {
      if (!template || !template.name || !template.subject || !template.body) {
        throw new Error('Template name, subject and body are required')
      }

      const { data, error } = await supabaseClient
        .from('notification_templates')
        .insert({
          user_id: user.id,
          name: template.name,
          subject: template.subject,
          body: template.body,
          variables: template.variables || []
        })
        .select()
        .single()

      if (error) {
        throw error
      }

      return new Response(JSON.stringify({
        success: true,
        data
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (action === 'send_notification') {
      if (!type || !recipient) {
        throw new Error('Type and recipient are required')
      }

      let subject = 'Notification'
      let body = 'Test notification'

      // If template_id provided, get template
      if (template_id) {
        const { data: template, error: templateError } = await supabaseClient
          .from('notification_templates')
          .select('*')
          .eq('id', template_id)
          .eq('user_id', user.id)
          .single()

        if (templateError) {
          throw new Error('Template not found')
        }

        subject = template.subject
        body = template.body

        // Replace variables in subject and body
        if (variables && typeof variables === 'object') {
          for (const [key, value] of Object.entries(variables)) {
            subject = subject.replace(new RegExp(`{{${key}}}`, 'g'), String(value))
            body = body.replace(new RegExp(`{{${key}}}`, 'g'), String(value))
          }
        }
      }

      // Log the notification
      const { data, error } = await supabaseClient
        .from('notification_logs')
        .insert({
          user_id: user.id,
          channel: type,
          recipient,
          subject,
          status: 'delivered' // Mock successful delivery
        })
        .select()
        .single()

      if (error) {
        throw error
      }

      return new Response(JSON.stringify({
        success: true,
        data: {
          id: data.id,
          status: 'sent',
          subject,
          body
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    throw new Error('Invalid action')

  } catch (error) {
    console.error('Notification service error:', error)
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
