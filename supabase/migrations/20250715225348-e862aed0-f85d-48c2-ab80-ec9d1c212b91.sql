-- Force la suppression complète et recréation de la vue avec approche alternative

-- Supprimer complètement la vue 
DROP VIEW IF EXISTS public.monthly_average_exchange_rates CASCADE;

-- Attendre un moment et recréer avec une approche différente
-- Utiliser une vue matérialisée au lieu d'une vue normale
CREATE MATERIALIZED VIEW public.monthly_average_exchange_rates AS
SELECT 
  user_id,
  EXTRACT(YEAR FROM date) as year,
  EXTRACT(MONTH FROM date) as month,
  DATE_TRUNC('month', date) as month_start,
  SUM(amount_received_mad) / NULLIF(SUM(amount_received_usd), 0) as average_rate,
  COUNT(*) as entries_count,
  SUM(amount_received_usd) as total_usd,
  SUM(amount_received_mad) as total_mad
FROM public.financial_tracking 
WHERE amount_received_usd > 0
GROUP BY user_id, EXTRACT(YEAR FROM date), EXTRACT(MONTH FROM date), DATE_TRUNC('month', date);

-- Créer un index sur user_id pour les performances
CREATE INDEX idx_monthly_avg_rates_user_year_month ON public.monthly_average_exchange_rates(user_id, year, month);

-- Activer RLS sur la vue matérialisée
ALTER MATERIALIZED VIEW public.monthly_average_exchange_rates ENABLE ROW LEVEL SECURITY;

-- Créer une politique RLS pour la vue matérialisée
CREATE POLICY "Users can view their own monthly averages" 
ON public.monthly_average_exchange_rates 
FOR SELECT 
USING (user_id = auth.uid());

-- Recréer la fonction qui utilise maintenant la vue matérialisée
CREATE OR REPLACE FUNCTION public.get_current_month_average_rate(user_uuid uuid)
RETURNS DECIMAL(10,4)
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT average_rate 
  FROM public.monthly_average_exchange_rates 
  WHERE user_id = user_uuid 
    AND year = EXTRACT(YEAR FROM CURRENT_DATE)
    AND month = EXTRACT(MONTH FROM CURRENT_DATE);
$$;

-- Fonction pour rafraîchir la vue matérialisée
CREATE OR REPLACE FUNCTION public.refresh_monthly_average_rates()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.monthly_average_exchange_rates;
$$;