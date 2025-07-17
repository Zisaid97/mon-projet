export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      activity_log: {
        Row: {
          action: string
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          new_values: Json | null
          old_values: Json | null
          organization_id: string
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          organization_id: string
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          organization_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_log_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      ad_spending_data: {
        Row: {
          account_name: string
          ad_set_delivery: string | null
          amount_spent: number | null
          campaign_name: string
          cost_per_landing_page_view: number | null
          cost_per_lead: number | null
          cpc: number | null
          cpm: number | null
          created_at: string
          currency: string | null
          date: string
          frequency: number | null
          hold_rate: number | null
          hook_rate: number | null
          id: string
          impressions: number | null
          landing_page_views: number | null
          leads: number | null
          link_clicks: number | null
          lp_rate: number | null
          reach: number | null
          report_end: string | null
          report_start: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          account_name: string
          ad_set_delivery?: string | null
          amount_spent?: number | null
          campaign_name: string
          cost_per_landing_page_view?: number | null
          cost_per_lead?: number | null
          cpc?: number | null
          cpm?: number | null
          created_at?: string
          currency?: string | null
          date: string
          frequency?: number | null
          hold_rate?: number | null
          hook_rate?: number | null
          id?: string
          impressions?: number | null
          landing_page_views?: number | null
          leads?: number | null
          link_clicks?: number | null
          lp_rate?: number | null
          reach?: number | null
          report_end?: string | null
          report_start?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          account_name?: string
          ad_set_delivery?: string | null
          amount_spent?: number | null
          campaign_name?: string
          cost_per_landing_page_view?: number | null
          cost_per_lead?: number | null
          cpc?: number | null
          cpm?: number | null
          created_at?: string
          currency?: string | null
          date?: string
          frequency?: number | null
          hold_rate?: number | null
          hook_rate?: number | null
          id?: string
          impressions?: number | null
          landing_page_views?: number | null
          leads?: number | null
          link_clicks?: number | null
          lp_rate?: number | null
          reach?: number | null
          report_end?: string | null
          report_start?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_chat_history: {
        Row: {
          content: string
          context_data: Json | null
          created_at: string | null
          id: string
          role: string
          session_id: string
          user_id: string
        }
        Insert: {
          content: string
          context_data?: Json | null
          created_at?: string | null
          id?: string
          role: string
          session_id: string
          user_id: string
        }
        Update: {
          content?: string
          context_data?: Json | null
          created_at?: string | null
          id?: string
          role?: string
          session_id?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_insights: {
        Row: {
          content: string
          created_at: string | null
          expires_at: string | null
          generated_at: string | null
          id: string
          insights_type: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          expires_at?: string | null
          generated_at?: string | null
          id?: string
          insights_type?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          expires_at?: string | null
          generated_at?: string | null
          id?: string
          insights_type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      alert_settings: {
        Row: {
          alert_daily_spend_threshold: number | null
          alert_days_without_delivery: number | null
          alert_scope: string
          cpd_threshold_usd: number | null
          cpl_threshold_usd: number | null
          created_at: string
          currency: string
          delivery_rate_min_percent: number | null
          id: string
          roi_min_percent: number | null
          send_email: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          alert_daily_spend_threshold?: number | null
          alert_days_without_delivery?: number | null
          alert_scope?: string
          cpd_threshold_usd?: number | null
          cpl_threshold_usd?: number | null
          created_at?: string
          currency?: string
          delivery_rate_min_percent?: number | null
          id?: string
          roi_min_percent?: number | null
          send_email?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          alert_daily_spend_threshold?: number | null
          alert_days_without_delivery?: number | null
          alert_scope?: string
          cpd_threshold_usd?: number | null
          cpl_threshold_usd?: number | null
          created_at?: string
          currency?: string
          delivery_rate_min_percent?: number | null
          id?: string
          roi_min_percent?: number | null
          send_email?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      alerts_ai: {
        Row: {
          content: string
          created_at: string | null
          data: Json | null
          id: string
          is_read: boolean | null
          severity: string | null
          title: string
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          data?: Json | null
          id?: string
          is_read?: boolean | null
          severity?: string | null
          title: string
          type?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          data?: Json | null
          id?: string
          is_read?: boolean | null
          severity?: string | null
          title?: string
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      archive_ad_spending_data: {
        Row: {
          account_name: string
          ad_set_delivery: string | null
          amount_spent: number | null
          campaign_name: string
          cost_per_landing_page_view: number | null
          cost_per_lead: number | null
          cpc: number | null
          cpm: number | null
          created_at: string
          currency: string | null
          date: string
          frequency: number | null
          hold_rate: number | null
          hook_rate: number | null
          id: string
          impressions: number | null
          landing_page_views: number | null
          leads: number | null
          link_clicks: number | null
          lp_rate: number | null
          month_label: string
          reach: number | null
          report_end: string | null
          report_start: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          account_name: string
          ad_set_delivery?: string | null
          amount_spent?: number | null
          campaign_name: string
          cost_per_landing_page_view?: number | null
          cost_per_lead?: number | null
          cpc?: number | null
          cpm?: number | null
          created_at?: string
          currency?: string | null
          date: string
          frequency?: number | null
          hold_rate?: number | null
          hook_rate?: number | null
          id?: string
          impressions?: number | null
          landing_page_views?: number | null
          leads?: number | null
          link_clicks?: number | null
          lp_rate?: number | null
          month_label: string
          reach?: number | null
          report_end?: string | null
          report_start?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          account_name?: string
          ad_set_delivery?: string | null
          amount_spent?: number | null
          campaign_name?: string
          cost_per_landing_page_view?: number | null
          cost_per_lead?: number | null
          cpc?: number | null
          cpm?: number | null
          created_at?: string
          currency?: string | null
          date?: string
          frequency?: number | null
          hold_rate?: number | null
          hook_rate?: number | null
          id?: string
          impressions?: number | null
          landing_page_views?: number | null
          leads?: number | null
          link_clicks?: number | null
          lp_rate?: number | null
          month_label?: string
          reach?: number | null
          report_end?: string | null
          report_start?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      archive_financial_tracking: {
        Row: {
          amount_received_mad: number
          amount_received_usd: number
          created_at: string
          date: string
          exchange_rate: number
          id: string
          month_label: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount_received_mad?: number
          amount_received_usd?: number
          created_at?: string
          date: string
          exchange_rate?: number
          id?: string
          month_label: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount_received_mad?: number
          amount_received_usd?: number
          created_at?: string
          date?: string
          exchange_rate?: number
          id?: string
          month_label?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      archive_marketing_performance: {
        Row: {
          created_at: string
          date: string
          deliveries: number
          id: string
          leads: number
          margin_per_order: number
          month_label: string
          spend_usd: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date: string
          deliveries?: number
          id?: string
          leads?: number
          margin_per_order?: number
          month_label: string
          spend_usd?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          deliveries?: number
          id?: string
          leads?: number
          margin_per_order?: number
          month_label?: string
          spend_usd?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      archive_profit_tracking: {
        Row: {
          commission_total: number
          cpd_category: number
          created_at: string
          date: string
          id: string
          month_label: string
          product_id: string | null
          product_name: string
          quantity: number
          source_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          commission_total?: number
          cpd_category: number
          created_at?: string
          date: string
          id?: string
          month_label: string
          product_id?: string | null
          product_name: string
          quantity?: number
          source_type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          commission_total?: number
          cpd_category?: number
          created_at?: string
          date?: string
          id?: string
          month_label?: string
          product_id?: string | null
          product_name?: string
          quantity?: number
          source_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      archive_sales_data: {
        Row: {
          address: string
          city: string
          confirmation_note: string
          confirmation_status: string
          created_at: string
          customer: string
          customer_shipping: string
          date: string
          delivery_agent: string
          delivery_note: string
          delivery_status: string
          deposit: number
          external_order_id: string
          id: string
          month_label: string
          notes: string
          payment_method: string
          phone: string
          price: number
          products: string
          sales_channel: string
          tracking_number: string
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string
          city?: string
          confirmation_note?: string
          confirmation_status?: string
          created_at?: string
          customer?: string
          customer_shipping?: string
          date: string
          delivery_agent?: string
          delivery_note?: string
          delivery_status?: string
          deposit?: number
          external_order_id?: string
          id?: string
          month_label: string
          notes?: string
          payment_method?: string
          phone?: string
          price?: number
          products?: string
          sales_channel?: string
          tracking_number?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string
          city?: string
          confirmation_note?: string
          confirmation_status?: string
          created_at?: string
          customer?: string
          customer_shipping?: string
          date?: string
          delivery_agent?: string
          delivery_note?: string
          delivery_status?: string
          deposit?: number
          external_order_id?: string
          id?: string
          month_label?: string
          notes?: string
          payment_method?: string
          phone?: string
          price?: number
          products?: string
          sales_channel?: string
          tracking_number?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      attributions_meta: {
        Row: {
          country: string
          created_at: string
          date: string
          id: string
          product: string
          spend_dh: number
          spend_usd: number
          updated_at: string
          user_id: string
        }
        Insert: {
          country: string
          created_at?: string
          date: string
          id?: string
          product: string
          spend_dh?: number
          spend_usd?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          country?: string
          created_at?: string
          date?: string
          id?: string
          product?: string
          spend_dh?: number
          spend_usd?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      auth_rate_limits: {
        Row: {
          action: string
          created_at: string
          id: string
          identifier: string
          success: boolean
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          identifier: string
          success?: boolean
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          identifier?: string
          success?: boolean
        }
        Relationships: []
      }
      billing_events: {
        Row: {
          created_at: string
          event_type: string
          id: string
          metadata: Json | null
          user_id: string
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          metadata?: Json | null
          user_id: string
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          metadata?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      campaigns: {
        Row: {
          actual_deliveries: number | null
          actual_leads: number | null
          actual_spend: number | null
          cpd_category: number | null
          created_at: string
          date: string
          estimated_deliveries: number | null
          estimated_leads: number | null
          id: string
          name: string
          objective: string | null
          planned_budget: number
          planned_budget_currency: string
          platform: string
          product_id: string | null
          roi_color: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          actual_deliveries?: number | null
          actual_leads?: number | null
          actual_spend?: number | null
          cpd_category?: number | null
          created_at?: string
          date: string
          estimated_deliveries?: number | null
          estimated_leads?: number | null
          id?: string
          name: string
          objective?: string | null
          planned_budget: number
          planned_budget_currency?: string
          platform: string
          product_id?: string | null
          roi_color?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          actual_deliveries?: number | null
          actual_leads?: number | null
          actual_spend?: number | null
          cpd_category?: number | null
          created_at?: string
          date?: string
          estimated_deliveries?: number | null
          estimated_leads?: number | null
          id?: string
          name?: string
          objective?: string | null
          planned_budget?: number
          planned_budget_currency?: string
          platform?: string
          product_id?: string | null
          roi_color?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      country_data: {
        Row: {
          city: string | null
          country_code: string
          country_name: string
          cpd_mad: number | null
          cpl_mad: number | null
          created_at: string | null
          delivery_rate: number | null
          id: string
          period_end: string
          period_start: string
          profit_mad: number | null
          revenue_mad: number | null
          roi_percent: number | null
          spend_mad: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          city?: string | null
          country_code: string
          country_name: string
          cpd_mad?: number | null
          cpl_mad?: number | null
          created_at?: string | null
          delivery_rate?: number | null
          id?: string
          period_end: string
          period_start: string
          profit_mad?: number | null
          revenue_mad?: number | null
          roi_percent?: number | null
          spend_mad?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          city?: string | null
          country_code?: string
          country_name?: string
          cpd_mad?: number | null
          cpl_mad?: number | null
          created_at?: string | null
          delivery_rate?: number | null
          id?: string
          period_end?: string
          period_start?: string
          profit_mad?: number | null
          revenue_mad?: number | null
          roi_percent?: number | null
          spend_mad?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      financial_tracking: {
        Row: {
          amount_received_mad: number
          amount_received_usd: number
          created_at: string
          date: string
          exchange_rate: number
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount_received_mad?: number
          amount_received_usd?: number
          created_at?: string
          date: string
          exchange_rate?: number
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount_received_mad?: number
          amount_received_usd?: number
          created_at?: string
          date?: string
          exchange_rate?: number
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      google_integrations: {
        Row: {
          access_token: string
          connected_at: string
          created_at: string
          expires_at: string
          google_email: string
          google_name: string
          id: string
          refresh_token: string
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token: string
          connected_at?: string
          created_at?: string
          expires_at: string
          google_email: string
          google_name: string
          id?: string
          refresh_token: string
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token?: string
          connected_at?: string
          created_at?: string
          expires_at?: string
          google_email?: string
          google_name?: string
          id?: string
          refresh_token?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      google_sheets_logs: {
        Row: {
          created_at: string
          error_details: Json | null
          event_type: string
          id: string
          message: string
          redirect_uri: string | null
          timestamp: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          error_details?: Json | null
          event_type: string
          id?: string
          message: string
          redirect_uri?: string | null
          timestamp?: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          error_details?: Json | null
          event_type?: string
          id?: string
          message?: string
          redirect_uri?: string | null
          timestamp?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      insights_cache: {
        Row: {
          content: string
          created_at: string | null
          expires_at: string | null
          generated_at: string | null
          id: string
          insights_type: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          expires_at?: string | null
          generated_at?: string | null
          id?: string
          insights_type?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          expires_at?: string | null
          generated_at?: string | null
          id?: string
          insights_type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      integration_logs: {
        Row: {
          action: string
          created_at: string
          error_message: string | null
          id: string
          integration_id: string
          metadata: Json | null
          status: string
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          error_message?: string | null
          id?: string
          integration_id: string
          metadata?: Json | null
          status: string
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          error_message?: string | null
          id?: string
          integration_id?: string
          metadata?: Json | null
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      marketing_performance: {
        Row: {
          created_at: string
          date: string
          deliveries: number
          id: string
          leads: number
          margin_per_order: number
          spend_usd: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date: string
          deliveries?: number
          id?: string
          leads?: number
          margin_per_order?: number
          spend_usd?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          deliveries?: number
          id?: string
          leads?: number
          margin_per_order?: number
          spend_usd?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      marketing_spend_attrib: {
        Row: {
          country: string
          created_at: string
          date: string
          id: string
          product: string
          source: string
          spend_dh: number
          spend_usd: number
          updated_at: string
          user_id: string
        }
        Insert: {
          country: string
          created_at?: string
          date: string
          id?: string
          product: string
          source?: string
          spend_dh?: number
          spend_usd?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          country?: string
          created_at?: string
          date?: string
          id?: string
          product?: string
          source?: string
          spend_dh?: number
          spend_usd?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      meta_ads_config: {
        Row: {
          client_id: string
          client_secret: string
          created_at: string
          id: string
          redirect_uri: string
          updated_at: string
          user_id: string
        }
        Insert: {
          client_id: string
          client_secret: string
          created_at?: string
          id?: string
          redirect_uri: string
          updated_at?: string
          user_id: string
        }
        Update: {
          client_id?: string
          client_secret?: string
          created_at?: string
          id?: string
          redirect_uri?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      meta_ads_integrations: {
        Row: {
          access_token: string
          created_at: string | null
          expires_at: string | null
          id: string
          meta_account_id: string | null
          meta_account_name: string | null
          refresh_token: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          access_token: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          meta_account_id?: string | null
          meta_account_name?: string | null
          refresh_token?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          access_token?: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          meta_account_id?: string | null
          meta_account_name?: string | null
          refresh_token?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      meta_spend_daily: {
        Row: {
          campaign_id: string
          campaign_name: string
          clicks: number | null
          created_at: string | null
          date: string
          exchange_rate: number | null
          id: string
          impressions: number | null
          leads: number | null
          spend_mad: number | null
          spend_usd: number | null
          synced_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          campaign_id: string
          campaign_name: string
          clicks?: number | null
          created_at?: string | null
          date: string
          exchange_rate?: number | null
          id?: string
          impressions?: number | null
          leads?: number | null
          spend_mad?: number | null
          spend_usd?: number | null
          synced_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          campaign_id?: string
          campaign_name?: string
          clicks?: number | null
          created_at?: string | null
          date?: string
          exchange_rate?: number | null
          id?: string
          impressions?: number | null
          leads?: number | null
          spend_mad?: number | null
          spend_usd?: number | null
          synced_at?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      meta_tracked_campaigns: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          meta_campaign_id: string
          meta_campaign_name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          meta_campaign_id: string
          meta_campaign_name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          meta_campaign_id?: string
          meta_campaign_name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      monthly_average_exchange_rates: {
        Row: {
          average_rate: number | null
          created_at: string | null
          entries_count: number | null
          month: number
          month_start: string | null
          total_mad: number | null
          total_usd: number | null
          updated_at: string | null
          user_id: string
          year: number
        }
        Insert: {
          average_rate?: number | null
          created_at?: string | null
          entries_count?: number | null
          month: number
          month_start?: string | null
          total_mad?: number | null
          total_usd?: number | null
          updated_at?: string | null
          user_id: string
          year: number
        }
        Update: {
          average_rate?: number | null
          created_at?: string | null
          entries_count?: number | null
          month?: number
          month_start?: string | null
          total_mad?: number | null
          total_usd?: number | null
          updated_at?: string | null
          user_id?: string
          year?: number
        }
        Relationships: []
      }
      monthly_bonus: {
        Row: {
          amount_dh: number
          created_at: string
          id: string
          month: number
          updated_at: string
          user_id: string
          year: number
        }
        Insert: {
          amount_dh?: number
          created_at?: string
          id?: string
          month: number
          updated_at?: string
          user_id: string
          year: number
        }
        Update: {
          amount_dh?: number
          created_at?: string
          id?: string
          month?: number
          updated_at?: string
          user_id?: string
          year?: number
        }
        Relationships: []
      }
      notification_logs: {
        Row: {
          channel: string
          error_message: string | null
          id: string
          recipient: string
          sent_at: string
          status: string
          subject: string | null
          user_id: string
        }
        Insert: {
          channel: string
          error_message?: string | null
          id?: string
          recipient: string
          sent_at?: string
          status: string
          subject?: string | null
          user_id: string
        }
        Update: {
          channel?: string
          error_message?: string | null
          id?: string
          recipient?: string
          sent_at?: string
          status?: string
          subject?: string | null
          user_id?: string
        }
        Relationships: []
      }
      notification_settings: {
        Row: {
          channels: string[]
          created_at: string
          email_signature: string | null
          email_summary_frequency: string
          enable_notifications: boolean
          id: string
          types: string[]
          updated_at: string
          user_id: string
        }
        Insert: {
          channels?: string[]
          created_at?: string
          email_signature?: string | null
          email_summary_frequency?: string
          enable_notifications?: boolean
          id?: string
          types?: string[]
          updated_at?: string
          user_id: string
        }
        Update: {
          channels?: string[]
          created_at?: string
          email_signature?: string | null
          email_summary_frequency?: string
          enable_notifications?: boolean
          id?: string
          types?: string[]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notification_templates: {
        Row: {
          body: string
          created_at: string
          id: string
          name: string
          subject: string
          updated_at: string
          user_id: string
          variables: string[] | null
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          name: string
          subject: string
          updated_at?: string
          user_id: string
          variables?: string[] | null
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          name?: string
          subject?: string
          updated_at?: string
          user_id?: string
          variables?: string[] | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          channel: string
          created_at: string
          data: Json | null
          id: string
          message: string
          status: string
          title: string
          type: string
          user_id: string
        }
        Insert: {
          channel?: string
          created_at?: string
          data?: Json | null
          id?: string
          message: string
          status?: string
          title: string
          type: string
          user_id: string
        }
        Update: {
          channel?: string
          created_at?: string
          data?: Json | null
          id?: string
          message?: string
          status?: string
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      organization_invitations: {
        Row: {
          accepted_at: string | null
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string
          organization_id: string
          role: Database["public"]["Enums"]["user_role"]
          token: string
          updated_at: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          invited_by: string
          organization_id: string
          role?: Database["public"]["Enums"]["user_role"]
          token: string
          updated_at?: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string
          organization_id?: string
          role?: Database["public"]["Enums"]["user_role"]
          token?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_invitations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_members: {
        Row: {
          created_at: string
          deactivated: boolean
          id: string
          invited_by: string | null
          joined_at: string
          organization_id: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          deactivated?: boolean
          id?: string
          invited_by?: string | null
          joined_at?: string
          organization_id: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          deactivated?: boolean
          id?: string
          invited_by?: string | null
          joined_at?: string
          organization_id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          description: string | null
          id: string
          logo_url: string | null
          name: string
          owner_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          logo_url?: string | null
          name: string
          owner_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          owner_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      permissions: {
        Row: {
          can_delete: boolean
          can_read: boolean
          can_write: boolean
          created_at: string
          id: string
          module: string
          organization_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          can_delete?: boolean
          can_read?: boolean
          can_write?: boolean
          created_at?: string
          id?: string
          module: string
          organization_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          can_delete?: boolean
          can_read?: boolean
          can_write?: boolean
          created_at?: string
          id?: string
          module?: string
          organization_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "permissions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      product_country_deliveries: {
        Row: {
          country: string
          created_at: string
          date: string
          deliveries: number
          id: string
          product: string
          updated_at: string
          user_id: string
        }
        Insert: {
          country: string
          created_at?: string
          date: string
          deliveries?: number
          id?: string
          product: string
          updated_at?: string
          user_id: string
        }
        Update: {
          country?: string
          created_at?: string
          date?: string
          deliveries?: number
          id?: string
          product?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      product_keywords: {
        Row: {
          created_at: string
          id: string
          keyword: string
          note: string | null
          product_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          keyword: string
          note?: string | null
          product_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          keyword?: string
          note?: string | null
          product_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_keywords_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_keywords_archive: {
        Row: {
          created_at: string
          deleted_at: string
          deletion_reason: string
          id: string
          keyword: string
          note: string | null
          original_keyword_id: string
          product_id: string
          product_name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at: string
          deleted_at?: string
          deletion_reason?: string
          id?: string
          keyword: string
          note?: string | null
          original_keyword_id: string
          product_id: string
          product_name: string
          updated_at: string
          user_id: string
        }
        Update: {
          created_at?: string
          deleted_at?: string
          deletion_reason?: string
          id?: string
          keyword?: string
          note?: string | null
          original_keyword_id?: string
          product_id?: string
          product_name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      product_spend_attribution: {
        Row: {
          amount_spent_mad: number
          created_at: string
          end_date: string
          id: string
          notes: string | null
          platform: string
          product_id: string | null
          product_name: string
          start_date: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount_spent_mad: number
          created_at?: string
          end_date: string
          id?: string
          notes?: string | null
          platform: string
          product_id?: string | null
          product_name: string
          start_date: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount_spent_mad?: number
          created_at?: string
          end_date?: string
          id?: string
          notes?: string | null
          platform?: string
          product_id?: string | null
          product_name?: string
          start_date?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_spend_attribution_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          cpd_category: number
          created_at: string
          external_links: string[] | null
          facebook_keywords: string[]
          id: string
          image_url: string | null
          name: string
          product_link: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          cpd_category: number
          created_at?: string
          external_links?: string[] | null
          facebook_keywords?: string[]
          id?: string
          image_url?: string | null
          name: string
          product_link?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          cpd_category?: number
          created_at?: string
          external_links?: string[] | null
          facebook_keywords?: string[]
          id?: string
          image_url?: string | null
          name?: string
          product_link?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profit_tracking: {
        Row: {
          commission_total: number
          cpd_category: number
          created_at: string
          date: string
          id: string
          product_id: string | null
          product_name: string
          quantity: number
          source_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          commission_total?: number
          cpd_category: number
          created_at?: string
          date: string
          id?: string
          product_id?: string | null
          product_name: string
          quantity?: number
          source_type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          commission_total?: number
          cpd_category?: number
          created_at?: string
          date?: string
          id?: string
          product_id?: string | null
          product_name?: string
          quantity?: number
          source_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profit_tracking_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      sales_data: {
        Row: {
          address: string
          city: string
          confirmation_note: string
          confirmation_status: string
          created_at: string
          customer: string
          customer_shipping: string
          date: string
          delivery_agent: string
          delivery_note: string
          delivery_status: string
          deposit: number
          external_order_id: string
          id: string
          notes: string
          payment_method: string
          phone: string
          price: number
          products: string
          sales_channel: string
          tracking_number: string
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string
          city?: string
          confirmation_note?: string
          confirmation_status?: string
          created_at?: string
          customer?: string
          customer_shipping?: string
          date: string
          delivery_agent?: string
          delivery_note?: string
          delivery_status?: string
          deposit?: number
          external_order_id?: string
          id?: string
          notes?: string
          payment_method?: string
          phone?: string
          price?: number
          products?: string
          sales_channel?: string
          tracking_number?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string
          city?: string
          confirmation_note?: string
          confirmation_status?: string
          created_at?: string
          customer?: string
          customer_shipping?: string
          date?: string
          delivery_agent?: string
          delivery_note?: string
          delivery_status?: string
          deposit?: number
          external_order_id?: string
          id?: string
          notes?: string
          payment_method?: string
          phone?: string
          price?: number
          products?: string
          sales_channel?: string
          tracking_number?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      security_events: {
        Row: {
          additional_data: Json | null
          created_at: string
          description: string
          event_type: string
          id: string
          ip_address: string | null
          severity: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          additional_data?: Json | null
          created_at?: string
          description: string
          event_type: string
          id?: string
          ip_address?: string | null
          severity: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          additional_data?: Json | null
          created_at?: string
          description?: string
          event_type?: string
          id?: string
          ip_address?: string | null
          severity?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          stripe_customer_id: string | null
          subscribed: boolean
          subscription_end: string | null
          subscription_tier: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      sync_logs: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          last_sync_at: string
          status: string
          sync_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          last_sync_at?: string
          status: string
          sync_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          last_sync_at?: string
          status?: string
          sync_type?: string
          user_id?: string
        }
        Relationships: []
      }
      system_logs: {
        Row: {
          created_at: string
          data: Json | null
          id: string
          message: string
          type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          data?: Json | null
          id?: string
          message: string
          type: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          data?: Json | null
          id?: string
          message?: string
          type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      usage_records: {
        Row: {
          created_at: string
          id: string
          metric: string
          quantity: number
          stripe_usage_record_id: string | null
          subscription_id: string
          timestamp: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          metric: string
          quantity?: number
          stripe_usage_record_id?: string | null
          subscription_id: string
          timestamp?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          metric?: string
          quantity?: number
          stripe_usage_record_id?: string | null
          subscription_id?: string
          timestamp?: string
          user_id?: string
        }
        Relationships: []
      }
      user_integrations: {
        Row: {
          active: boolean
          config: Json
          id: string
          installed_at: string
          integration_id: string
          last_sync_at: string | null
          removed_at: string | null
          sync_status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          active?: boolean
          config?: Json
          id?: string
          installed_at?: string
          integration_id: string
          last_sync_at?: string | null
          removed_at?: string | null
          sync_status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          active?: boolean
          config?: Json
          id?: string
          installed_at?: string
          integration_id?: string
          last_sync_at?: string | null
          removed_at?: string | null
          sync_status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_notes: {
        Row: {
          content: string
          created_at: string
          id: string
          page_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          page_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          page_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          created_at: string
          currency: string | null
          decimal_places: number | null
          id: string
          language: string | null
          round_numbers: boolean | null
          show_dual_amounts: boolean | null
          show_margin_percentages: boolean | null
          theme: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          currency?: string | null
          decimal_places?: number | null
          id?: string
          language?: string | null
          round_numbers?: boolean | null
          show_dual_amounts?: boolean | null
          show_margin_percentages?: boolean | null
          theme?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          currency?: string | null
          decimal_places?: number | null
          id?: string
          language?: string | null
          round_numbers?: boolean | null
          show_dual_amounts?: boolean | null
          show_margin_percentages?: boolean | null
          theme?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          plan_id: string | null
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_id?: string | null
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_id?: string | null
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      webhook_events: {
        Row: {
          event_type: string
          id: string
          integration_id: string
          payload: Json
          processed_at: string
          status: string
        }
        Insert: {
          event_type: string
          id?: string
          integration_id: string
          payload: Json
          processed_at?: string
          status?: string
        }
        Update: {
          event_type?: string
          id?: string
          integration_id?: string
          payload?: Json
          processed_at?: string
          status?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      clean_expired_insights: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_current_month_average_rate: {
        Args: { user_uuid: string }
        Returns: number
      }
      get_data_with_archives: {
        Args: {
          table_name: string
          start_date: string
          end_date: string
          target_user_id: string
        }
        Returns: {
          data: Json
        }[]
      }
      get_organization_members: {
        Args: { org_id: string }
        Returns: {
          id: string
          user_id: string
          email: string
          role: Database["public"]["Enums"]["user_role"]
          joined_at: string
          deactivated: boolean
        }[]
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
      is_a_member: {
        Args: { _organization_id: string; _user_id: string }
        Returns: boolean
      }
      is_org_admin: {
        Args: { _organization_id: string; _user_id: string }
        Returns: boolean
      }
      move_to_archive: {
        Args: {
          src_table: string
          dest_table: string
          month_label: string
          target_user_id?: string
        }
        Returns: undefined
      }
      update_country_data: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "user"
      user_role: "admin" | "manager" | "collaborator" | "owner"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
      user_role: ["admin", "manager", "collaborator", "owner"],
    },
  },
} as const
