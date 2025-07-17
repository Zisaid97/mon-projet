
-- Tables pour le service d'intégration
CREATE TABLE IF NOT EXISTS public.user_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  integration_id TEXT NOT NULL,
  config JSONB DEFAULT '{}',
  active BOOLEAN DEFAULT true,
  installed_at TIMESTAMPTZ DEFAULT now(),
  removed_at TIMESTAMPTZ,
  last_sync_at TIMESTAMPTZ,
  sync_status TEXT DEFAULT 'never',
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, integration_id)
);

CREATE TABLE IF NOT EXISTS public.integration_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  integration_id TEXT NOT NULL,
  action TEXT NOT NULL,
  status TEXT NOT NULL,
  metadata JSONB,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tables pour le service de notification
CREATE TABLE IF NOT EXISTS public.notification_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  variables TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.notification_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  channel TEXT NOT NULL,
  recipient TEXT NOT NULL,
  subject TEXT,
  status TEXT NOT NULL,
  error_message TEXT,
  sent_at TIMESTAMPTZ DEFAULT now()
);

-- Tables pour le service de facturation
CREATE TABLE IF NOT EXISTS public.billing_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  price_monthly DECIMAL(10,2),
  price_yearly DECIMAL(10,2),
  features TEXT[],
  max_users INTEGER,
  max_projects INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  plan_id UUID REFERENCES public.billing_plans(id),
  status TEXT NOT NULL DEFAULT 'active',
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  stripe_subscription_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.billing_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  metric_name TEXT NOT NULL,
  value INTEGER NOT NULL,
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Politiques RLS pour la sécurité
ALTER TABLE public.user_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_usage ENABLE ROW LEVEL SECURITY;

-- Politiques pour user_integrations
CREATE POLICY "Users can manage their own integrations" ON public.user_integrations
  FOR ALL USING (auth.uid() = user_id);

-- Politiques pour integration_logs
CREATE POLICY "Users can view their own integration logs" ON public.integration_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service can insert integration logs" ON public.integration_logs
  FOR INSERT WITH CHECK (true);

-- Politiques pour notification_templates
CREATE POLICY "Users can manage their own templates" ON public.notification_templates
  FOR ALL USING (auth.uid() = user_id);

-- Politiques pour notification_logs
CREATE POLICY "Users can view their own notification logs" ON public.notification_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service can insert notification logs" ON public.notification_logs
  FOR INSERT WITH CHECK (true);

-- Politiques pour billing_plans (lecture publique)
CREATE POLICY "Anyone can view billing plans" ON public.billing_plans
  FOR SELECT USING (true);

-- Politiques pour user_subscriptions
CREATE POLICY "Users can view their own subscriptions" ON public.user_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service can manage subscriptions" ON public.user_subscriptions
  FOR ALL USING (true);

-- Politiques pour billing_usage
CREATE POLICY "Users can view their own usage" ON public.billing_usage
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service can manage usage" ON public.billing_usage
  FOR ALL USING (true);

-- Insérer quelques plans de base
INSERT INTO public.billing_plans (name, price_monthly, price_yearly, features, max_users, max_projects)
VALUES 
  ('Free', 0.00, 0.00, ARRAY['Basic features', '1 user', '3 projects'], 1, 3),
  ('Pro', 29.99, 299.99, ARRAY['Advanced features', '5 users', 'Unlimited projects', 'Priority support'], 5, -1),
  ('Enterprise', 99.99, 999.99, ARRAY['All features', 'Unlimited users', 'Unlimited projects', '24/7 support', 'Custom integrations'], -1, -1)
ON CONFLICT DO NOTHING;
