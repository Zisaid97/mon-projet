
-- Table pour stocker les connexions Meta Ads OAuth
CREATE TABLE public.meta_ads_integrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  meta_account_id TEXT, -- id du compte publicitaire Facebook
  meta_account_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table pour stocker les campagnes Meta Ads suivies par l'utilisateur
CREATE TABLE public.meta_tracked_campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  meta_campaign_id TEXT NOT NULL,
  meta_campaign_name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, meta_campaign_id)
);

-- RLS pour que chaque utilisateur accède seulement à ses données
ALTER TABLE public.meta_ads_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meta_tracked_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "User can manage their Meta Ads integration"
  ON public.meta_ads_integrations
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "User can manage tracked Meta campaigns"
  ON public.meta_tracked_campaigns
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Trigger pour updated_at
CREATE TRIGGER update_meta_ads_integrations_updated_at
  BEFORE UPDATE ON public.meta_ads_integrations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_meta_tracked_campaigns_updated_at
  BEFORE UPDATE ON public.meta_tracked_campaigns
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
