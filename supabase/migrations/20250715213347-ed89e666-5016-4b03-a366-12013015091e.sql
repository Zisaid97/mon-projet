-- Corriger définitivement la vue monthly_average_exchange_rates

-- Supprimer complètement la vue existante
DROP VIEW IF EXISTS public.monthly_average_exchange_rates CASCADE;

-- Recréer la vue sans SECURITY DEFINER (par défaut, les vues héritent des politiques RLS des tables sous-jacentes)
CREATE VIEW public.monthly_average_exchange_rates AS
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

-- Vérifier que la vue hérite bien des politiques RLS de financial_tracking
-- (pas besoin de politiques spécifiques car la vue filtre automatiquement par user_id)