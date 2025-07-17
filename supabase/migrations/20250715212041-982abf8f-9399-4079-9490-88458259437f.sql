-- Corriger les vues avec SECURITY DEFINER

-- Supprimer et recréer la vue monthly_average_exchange_rates sans SECURITY DEFINER
DROP VIEW IF EXISTS public.monthly_average_exchange_rates;

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

-- Supprimer la vue comparative_analysis si elle existe (elle semble être une vue temporaire sans utilité)
DROP VIEW IF EXISTS public.comparative_analysis;

-- Si nécessaire, recréer la table comparative_analysis comme une vraie table avec RLS
-- Mais d'abord, vérifier si elle est utilisée dans l'application
-- Pour l'instant, on la supprime car elle ne semble pas avoir de structure définie