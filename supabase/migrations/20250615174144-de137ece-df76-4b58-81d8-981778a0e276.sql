
-- Table des paramètres d'alertes par utilisateur
CREATE TABLE public.alert_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  cpl_threshold_usd NUMERIC DEFAULT 1.5,
  cpd_threshold_usd NUMERIC DEFAULT 15,
  delivery_rate_min_percent NUMERIC DEFAULT 8,
  roi_min_percent NUMERIC DEFAULT 10,
  alert_days_without_delivery INTEGER DEFAULT 2,
  alert_daily_spend_threshold NUMERIC DEFAULT 50,
  currency TEXT NOT NULL DEFAULT 'USD',
  alert_scope TEXT NOT NULL DEFAULT 'campaign', -- "campaign" ou "product"
  send_email BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index pour accès rapide par utilisateur
CREATE INDEX idx_alert_settings_user_id ON public.alert_settings (user_id);

-- RLS pour limiter l'accès à chaque utilisateur à ses propres paramètres
ALTER TABLE public.alert_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Utilisateurs voient leurs alertes" 
  ON public.alert_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Utilisateurs modifient leurs alertes"
  ON public.alert_settings FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Utilisateurs mettent à jour leurs alertes"
  ON public.alert_settings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Utilisateurs suppriment leurs alertes"
  ON public.alert_settings FOR DELETE
  USING (auth.uid() = user_id);
