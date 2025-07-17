
-- Créer la table pour l'attribution des dépenses par produit
CREATE TABLE public.product_spend_attribution (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  amount_spent_mad NUMERIC(10,2) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  platform TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Activer Row Level Security
ALTER TABLE public.product_spend_attribution ENABLE ROW LEVEL SECURITY;

-- Créer les politiques pour l'accès aux données utilisateur
CREATE POLICY "Users can view their own product spend attributions"
  ON public.product_spend_attribution
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own product spend attributions"
  ON public.product_spend_attribution
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own product spend attributions"
  ON public.product_spend_attribution
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own product spend attributions"
  ON public.product_spend_attribution
  FOR DELETE
  USING (auth.uid() = user_id);

-- Créer un trigger pour mettre à jour automatiquement la colonne updated_at
CREATE TRIGGER update_product_spend_attribution_updated_at
  BEFORE UPDATE ON public.product_spend_attribution
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
