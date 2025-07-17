
-- Créer la table pour stocker les données publicitaires Meta Ads
CREATE TABLE public.ad_spending_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  account_name TEXT NOT NULL,
  campaign_name TEXT NOT NULL,
  reach NUMERIC DEFAULT 0,
  impressions NUMERIC DEFAULT 0,
  frequency NUMERIC DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  cpm NUMERIC DEFAULT 0,
  hold_rate NUMERIC DEFAULT 0,
  lp_rate NUMERIC DEFAULT 0,
  link_clicks NUMERIC DEFAULT 0,
  hook_rate NUMERIC DEFAULT 0,
  cpc NUMERIC DEFAULT 0,
  amount_spent NUMERIC DEFAULT 0,
  leads NUMERIC DEFAULT 0,
  cost_per_lead NUMERIC DEFAULT 0,
  landing_page_views NUMERIC DEFAULT 0,
  cost_per_landing_page_view NUMERIC DEFAULT 0,
  ad_set_delivery TEXT DEFAULT '',
  report_start TEXT DEFAULT '',
  report_end TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Ajouter Row Level Security (RLS)
ALTER TABLE public.ad_spending_data ENABLE ROW LEVEL SECURITY;

-- Politique pour que les utilisateurs voient uniquement leurs données
CREATE POLICY "Users can view their own ad spending data" 
  ON public.ad_spending_data 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Politique pour que les utilisateurs puissent insérer leurs données
CREATE POLICY "Users can insert their own ad spending data" 
  ON public.ad_spending_data 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Politique pour que les utilisateurs puissent modifier leurs données
CREATE POLICY "Users can update their own ad spending data" 
  ON public.ad_spending_data 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Politique pour que les utilisateurs puissent supprimer leurs données
CREATE POLICY "Users can delete their own ad spending data" 
  ON public.ad_spending_data 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Créer un index pour améliorer les performances
CREATE INDEX idx_ad_spending_data_user_date ON public.ad_spending_data(user_id, date DESC);
