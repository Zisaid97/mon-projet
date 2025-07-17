-- Tables pour l'architecture microservices

-- Table pour les limites de taux d'authentification
CREATE TABLE IF NOT EXISTS public.auth_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier TEXT NOT NULL, -- email ou IP
  action TEXT NOT NULL, -- login, register, etc.
  success BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table pour les abonnements utilisateurs
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  plan_id TEXT,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Table pour les événements de facturation
CREATE TABLE IF NOT EXISTS public.billing_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table pour les enregistrements d'utilisation
CREATE TABLE IF NOT EXISTS public.usage_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id TEXT NOT NULL,
  metric TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  stripe_usage_record_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table pour les logs de notifications
CREATE TABLE IF NOT EXISTS public.notification_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  channel TEXT NOT NULL, -- email, sms, push, webhook
  recipient TEXT NOT NULL,
  subject TEXT,
  status TEXT NOT NULL, -- sent, failed, pending
  error_message TEXT,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table pour les templates de notifications
CREATE TABLE IF NOT EXISTS public.notification_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  variables TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table pour les intégrations utilisateurs
CREATE TABLE IF NOT EXISTS public.user_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  integration_id TEXT NOT NULL,
  config JSONB NOT NULL DEFAULT '{}',
  active BOOLEAN NOT NULL DEFAULT true,
  installed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  removed_at TIMESTAMPTZ,
  last_sync_at TIMESTAMPTZ,
  sync_status TEXT DEFAULT 'never',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, integration_id)
);

-- Table pour les logs d'intégrations
CREATE TABLE IF NOT EXISTS public.integration_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  integration_id TEXT NOT NULL,
  action TEXT NOT NULL, -- installed, removed, sync, error
  status TEXT NOT NULL, -- success, failed, pending
  metadata JSONB,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table pour les événements webhook
CREATE TABLE IF NOT EXISTS public.webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'received'
);

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_auth_rate_limits_identifier_action ON public.auth_rate_limits(identifier, action);
CREATE INDEX IF NOT EXISTS idx_auth_rate_limits_created_at ON public.auth_rate_limits(created_at);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON public.user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_stripe_subscription_id ON public.user_subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_billing_events_user_id ON public.billing_events(user_id);
CREATE INDEX IF NOT EXISTS idx_billing_events_created_at ON public.billing_events(created_at);
CREATE INDEX IF NOT EXISTS idx_usage_records_user_id ON public.usage_records(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_records_timestamp ON public.usage_records(timestamp);
CREATE INDEX IF NOT EXISTS idx_notification_logs_user_id ON public.notification_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_logs_sent_at ON public.notification_logs(sent_at);
CREATE INDEX IF NOT EXISTS idx_user_integrations_user_id ON public.user_integrations(user_id);
CREATE INDEX IF NOT EXISTS idx_integration_logs_user_id ON public.integration_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_integration_logs_created_at ON public.integration_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_webhook_events_integration_id ON public.webhook_events(integration_id);
CREATE INDEX IF NOT EXISTS idx_webhook_events_processed_at ON public.webhook_events(processed_at);

-- Activer RLS sur toutes les tables
ALTER TABLE public.auth_rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour les utilisateurs authentifiés
CREATE POLICY "Users can view their own subscriptions" ON public.user_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own billing events" ON public.billing_events
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own usage records" ON public.usage_records
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own notification logs" ON public.notification_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own notification templates" ON public.notification_templates
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own integrations" ON public.user_integrations
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own integration logs" ON public.integration_logs
  FOR SELECT USING (auth.uid() = user_id);

-- Politiques pour les services (utilisant la clé de service)
CREATE POLICY "Service can manage auth rate limits" ON public.auth_rate_limits
  FOR ALL USING (true);

CREATE POLICY "Service can manage user subscriptions" ON public.user_subscriptions
  FOR ALL USING (true);

CREATE POLICY "Service can manage billing events" ON public.billing_events
  FOR ALL USING (true);

CREATE POLICY "Service can manage usage records" ON public.usage_records
  FOR ALL USING (true);

CREATE POLICY "Service can manage notification logs" ON public.notification_logs
  FOR ALL USING (true);

CREATE POLICY "Service can manage integration logs" ON public.integration_logs
  FOR ALL USING (true);

CREATE POLICY "Service can manage webhook events" ON public.webhook_events
  FOR ALL USING (true);

-- Trigger pour les timestamps automatiques
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_subscriptions_updated_at
  BEFORE UPDATE ON public.user_subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_templates_updated_at
  BEFORE UPDATE ON public.notification_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_integrations_updated_at
  BEFORE UPDATE ON public.user_integrations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();