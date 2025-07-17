
-- Table des campagnes marketing
CREATE TABLE public.campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  platform TEXT NOT NULL, -- (Meta Ads, Google Ads, etc)
  planned_budget NUMERIC NOT NULL,
  planned_budget_currency TEXT NOT NULL DEFAULT 'MAD',
  estimated_leads INTEGER,
  estimated_deliveries INTEGER,
  status TEXT NOT NULL DEFAULT 'planifiée', -- planifiée, en cours, terminée
  cpd_category NUMERIC, -- optionnel : liaison à CPD ou produit
  product_id UUID, -- optionnel
  date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index pour accélérer l'accès par utilisateur et par mois
CREATE INDEX idx_campaigns_user_date ON public.campaigns(user_id, date);

-- Foreign Key (optionnel) : Lié à un produit
ALTER TABLE public.campaigns
ADD CONSTRAINT campaigns_product_id_fkey
FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE SET NULL;

-- Sécurité RLS : chaque utilisateur ne peut accéder qu'à ses propres campagnes
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Les utilisateurs voient leurs campagnes"
  ON public.campaigns FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Les utilisateurs ajoutent leurs campagnes"
  ON public.campaigns FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Les utilisateurs modifient leurs campagnes"
  ON public.campaigns FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Les utilisateurs suppriment leurs campagnes"
  ON public.campaigns FOR DELETE
  USING (auth.uid() = user_id);

