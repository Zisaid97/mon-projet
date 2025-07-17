
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  console.log('Billing service request:', req.method, req.url)

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

    const { action, email, plan_id, subscription_id } = await req.json()
    console.log('Billing service action:', action)

    if (action === 'get_overview') {
      // Get user subscription
      const { data: subscription } = await supabaseClient
        .from('user_subscriptions')
        .select(`
          *,
          billing_plans(*)
        `)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single()

      // Get all active subscriptions count (for demo)
      const { count: activeSubscriptions } = await supabaseClient
        .from('user_subscriptions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active')

      // Get billing usage for current month
      const currentMonth = new Date()
      currentMonth.setDate(1)
      currentMonth.setHours(0, 0, 0, 0)

      const { data: usage } = await supabaseClient
        .from('billing_usage')
        .select('*')
        .eq('user_id', user.id)
        .gte('period_start', currentMonth.toISOString())

      // Calculate mock metrics
      const totalRevenue = 1250.50
      const monthlyRecurringRevenue = 450.00
      const churnRate = 3.2

      return new Response(JSON.stringify({
        success: true,
        data: {
          overview: {
            totalRevenue,
            activeSubscriptions: activeSubscriptions || 0,
            churnRate,
            monthlyRecurringRevenue
          },
          subscription,
          usage: usage || [],
          subscriptions: subscription ? [subscription] : []
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (action === 'create_subscription') {
      if (!email || !plan_id) {
        throw new Error('Email and plan_id are required')
      }

      // Get the plan
      const { data: plan, error: planError } = await supabaseClient
        .from('billing_plans')
        .select('*')
        .eq('name', plan_id)
        .single()

      if (planError || !plan) {
        throw new Error('Plan not found')
      }

      // Create subscription
      const { data: subscription, error } = await supabaseClient
        .from('user_subscriptions')
        .insert({
          user_id: user.id,
          plan_id: plan.id,
          status: 'active',
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        })
        .select()
        .single()

      if (error) {
        throw error
      }

      // Log billing event
      await supabaseClient
        .from('billing_events')
        .insert({
          user_id: user.id,
          event_type: 'subscription_created',
          metadata: { plan_id, email }
        })

      return new Response(JSON.stringify({
        success: true,
        data: subscription
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (action === 'cancel_subscription') {
      if (!subscription_id) {
        throw new Error('Subscription ID is required')
      }

      // Cancel subscription
      const { data, error } = await supabaseClient
        .from('user_subscriptions')
        .update({ status: 'cancelled' })
        .eq('id', subscription_id)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) {
        throw error
      }

      // Log billing event
      await supabaseClient
        .from('billing_events')
        .insert({
          user_id: user.id,
          event_type: 'subscription_cancelled',
          metadata: { subscription_id }
        })

      return new Response(JSON.stringify({
        success: true,
        data
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    throw new Error('Invalid action')

  } catch (error) {
    console.error('Billing service error:', error)
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
