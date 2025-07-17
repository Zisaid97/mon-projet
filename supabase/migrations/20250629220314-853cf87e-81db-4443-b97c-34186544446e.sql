
-- Créer la table pour le calendrier des campagnes (déjà créée mais améliorons-la)
ALTER TABLE public.campaigns 
ADD COLUMN IF NOT EXISTS objective text,
ADD COLUMN IF NOT EXISTS actual_spend numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS actual_leads integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS actual_deliveries integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS roi_color text DEFAULT 'gray';

-- Créer la table pour les données de pays
CREATE TABLE IF NOT EXISTS public.country_data (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) NOT NULL,
    country_code text NOT NULL,
    country_name text NOT NULL,
    city text,
    revenue_mad numeric DEFAULT 0,
    spend_mad numeric DEFAULT 0,
    profit_mad numeric DEFAULT 0,
    roi_percent numeric DEFAULT 0,
    delivery_rate numeric DEFAULT 0,
    cpl_mad numeric DEFAULT 0,
    cpd_mad numeric DEFAULT 0,
    period_start date NOT NULL,
    period_end date NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    UNIQUE(user_id, country_code, period_start, period_end)
);

-- Activer RLS sur country_data
ALTER TABLE public.country_data ENABLE ROW LEVEL SECURITY;

-- Politique RLS pour country_data
CREATE POLICY "Users can manage their own country data"
ON public.country_data
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Créer la table pour les dépenses Meta Ads synchronisées
CREATE TABLE IF NOT EXISTS public.meta_spend_daily (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) NOT NULL,
    campaign_id text NOT NULL,
    campaign_name text NOT NULL,
    date date NOT NULL,
    spend_usd numeric DEFAULT 0,
    spend_mad numeric DEFAULT 0,
    impressions bigint DEFAULT 0,
    clicks bigint DEFAULT 0,
    leads bigint DEFAULT 0,
    exchange_rate numeric DEFAULT 10.5,
    synced_at timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    UNIQUE(user_id, campaign_id, date)
);

-- Activer RLS sur meta_spend_daily
ALTER TABLE public.meta_spend_daily ENABLE ROW LEVEL SECURITY;

-- Politique RLS pour meta_spend_daily
CREATE POLICY "Users can manage their own meta spend data"
ON public.meta_spend_daily
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Créer la table pour les insights AI
CREATE TABLE IF NOT EXISTS public.ai_insights (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) NOT NULL,
    content text NOT NULL,
    insights_type text DEFAULT 'general',
    generated_at timestamp with time zone DEFAULT now(),
    expires_at timestamp with time zone DEFAULT (now() + interval '24 hours'),
    created_at timestamp with time zone DEFAULT now()
);

-- Activer RLS sur ai_insights
ALTER TABLE public.ai_insights ENABLE ROW LEVEL SECURITY;

-- Politique RLS pour ai_insights
CREATE POLICY "Users can manage their own AI insights"
ON public.ai_insights
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Vue pour l'analyse comparative
CREATE OR REPLACE VIEW public.comparative_analysis AS
SELECT 
    user_id,
    date,
    'marketing' as data_source,
    spend_usd * 10.5 as spend_mad,
    leads,
    deliveries,
    margin_per_order * deliveries as revenue_mad,
    (margin_per_order * deliveries) - (spend_usd * 10.5) as profit_mad,
    CASE 
        WHEN (spend_usd * 10.5) > 0 
        THEN (((margin_per_order * deliveries) - (spend_usd * 10.5)) / (spend_usd * 10.5)) * 100
        ELSE 0 
    END as roi_percent,
    CASE WHEN leads > 0 THEN (spend_usd * 10.5) / leads ELSE 0 END as cpl_mad,
    CASE WHEN deliveries > 0 THEN (spend_usd * 10.5) / deliveries ELSE 0 END as cpd_mad
FROM marketing_performance
UNION ALL
SELECT 
    user_id,
    date,
    'profits' as data_source,
    0 as spend_mad,
    0 as leads,
    quantity as deliveries,
    commission_total as revenue_mad,
    commission_total as profit_mad,
    0 as roi_percent,
    0 as cpl_mad,
    0 as cpd_mad
FROM profit_tracking;

-- Fonction pour mettre à jour les données de pays
CREATE OR REPLACE FUNCTION public.update_country_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_record RECORD;
    start_date date;
    end_date date;
BEGIN
    start_date := CURRENT_DATE - INTERVAL '30 days';
    end_date := CURRENT_DATE;
    
    FOR user_record IN SELECT DISTINCT user_id FROM marketing_performance
    LOOP
        -- Insérer des données de pays simulées (Maroc par défaut)
        INSERT INTO country_data (
            user_id, country_code, country_name, 
            revenue_mad, spend_mad, profit_mad, roi_percent,
            delivery_rate, cpl_mad, cpd_mad,
            period_start, period_end
        )
        SELECT 
            user_record.user_id,
            'MA' as country_code,
            'Maroc' as country_name,
            COALESCE(SUM(mp.margin_per_order * mp.deliveries), 0) as revenue_mad,
            COALESCE(SUM(mp.spend_usd * 10.5), 0) as spend_mad,
            COALESCE(SUM(mp.margin_per_order * mp.deliveries) - SUM(mp.spend_usd * 10.5), 0) as profit_mad,
            CASE 
                WHEN SUM(mp.spend_usd * 10.5) > 0 
                THEN ((SUM(mp.margin_per_order * mp.deliveries) - SUM(mp.spend_usd * 10.5)) / SUM(mp.spend_usd * 10.5)) * 100
                ELSE 0 
            END as roi_percent,
            CASE 
                WHEN SUM(mp.leads) > 0 
                THEN (SUM(mp.deliveries)::numeric / SUM(mp.leads)) * 100
                ELSE 0 
            END as delivery_rate,
            CASE WHEN SUM(mp.leads) > 0 THEN SUM(mp.spend_usd * 10.5) / SUM(mp.leads) ELSE 0 END as cpl_mad,
            CASE WHEN SUM(mp.deliveries) > 0 THEN SUM(mp.spend_usd * 10.5) / SUM(mp.deliveries) ELSE 0 END as cpd_mad,
            start_date,
            end_date
        FROM marketing_performance mp
        WHERE mp.user_id = user_record.user_id
        AND mp.date BETWEEN start_date AND end_date
        GROUP BY user_record.user_id
        ON CONFLICT (user_id, country_code, period_start, period_end) 
        DO UPDATE SET 
            revenue_mad = EXCLUDED.revenue_mad,
            spend_mad = EXCLUDED.spend_mad,
            profit_mad = EXCLUDED.profit_mad,
            roi_percent = EXCLUDED.roi_percent,
            delivery_rate = EXCLUDED.delivery_rate,
            cpl_mad = EXCLUDED.cpl_mad,
            cpd_mad = EXCLUDED.cpd_mad,
            updated_at = now();
    END LOOP;
END;
$$;

-- Créer les index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_campaigns_user_date ON public.campaigns(user_id, date);
CREATE INDEX IF NOT EXISTS idx_country_data_user_country ON public.country_data(user_id, country_code);
CREATE INDEX IF NOT EXISTS idx_meta_spend_user_date ON public.meta_spend_daily(user_id, date);
CREATE INDEX IF NOT EXISTS idx_ai_insights_user_expires ON public.ai_insights(user_id, expires_at);
