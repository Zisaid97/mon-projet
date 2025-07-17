
-- Créer la table product_country_deliveries
CREATE TABLE public.product_country_deliveries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  product TEXT NOT NULL,
  country TEXT NOT NULL,
  date DATE NOT NULL,
  deliveries INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, product, country, date)
);

-- Activer RLS
ALTER TABLE public.product_country_deliveries ENABLE ROW LEVEL SECURITY;

-- Politiques RLS
CREATE POLICY "Users can view their own product country deliveries" 
  ON public.product_country_deliveries 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own product country deliveries" 
  ON public.product_country_deliveries 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own product country deliveries" 
  ON public.product_country_deliveries 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own product country deliveries" 
  ON public.product_country_deliveries 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Trigger pour updated_at
CREATE TRIGGER update_product_country_deliveries_updated_at
  BEFORE UPDATE ON public.product_country_deliveries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Index pour les performances
CREATE INDEX idx_product_country_deliveries_user_date 
  ON public.product_country_deliveries(user_id, date);
CREATE INDEX idx_product_country_deliveries_product_country 
  ON public.product_country_deliveries(product, country);
