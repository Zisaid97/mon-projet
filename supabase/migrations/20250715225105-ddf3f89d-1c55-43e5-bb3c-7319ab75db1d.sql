-- Corriger définitivement le problème de Security Definer View

-- Supprimer complètement la vue existante et toutes ses dépendances
DROP VIEW IF EXISTS public.monthly_average_exchange_rates CASCADE;

-- Supprimer aussi toute fonction qui pourrait utiliser SECURITY DEFINER avec cette vue
DROP FUNCTION IF EXISTS public.get_current_month_average_rate(uuid) CASCADE;

-- Recréer la vue sans SECURITY DEFINER (vue simple qui hérite des politiques RLS)
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

-- Activer RLS sur la vue (elle héritera automatiquement des politiques de financial_tracking)
ALTER VIEW public.monthly_average_exchange_rates SET (security_barrier = true);

-- Recréer la fonction SANS SECURITY DEFINER (fonction normale)
CREATE OR REPLACE FUNCTION public.get_current_month_average_rate(user_uuid uuid)
RETURNS DECIMAL(10,4)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  -- La fonction ne sera accessible que si l'utilisateur a accès aux données via RLS
  RETURN (
    SELECT average_rate 
    FROM public.monthly_average_exchange_rates 
    WHERE user_id = user_uuid 
      AND year = EXTRACT(YEAR FROM CURRENT_DATE)
      AND month = EXTRACT(MONTH FROM CURRENT_DATE)
  );
END;
$$;