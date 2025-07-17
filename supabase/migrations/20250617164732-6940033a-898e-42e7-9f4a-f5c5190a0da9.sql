
-- Supprimer la vue actuelle avec SECURITY DEFINER
DROP VIEW IF EXISTS public.monthly_average_exchange_rates;

-- Recréer la vue sans SECURITY DEFINER (les vues héritent automatiquement des politiques RLS des tables sous-jacentes)
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

-- Mettre à jour la fonction pour utiliser la vue corrigée (garde SECURITY DEFINER pour l'accès sécurisé)
CREATE OR REPLACE FUNCTION public.get_current_month_average_rate(user_uuid uuid)
RETURNS DECIMAL(10,4)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
AS $$
BEGIN
  RETURN (
    SELECT average_rate 
    FROM public.monthly_average_exchange_rates 
    WHERE user_id = user_uuid 
      AND year = EXTRACT(YEAR FROM CURRENT_DATE)
      AND month = EXTRACT(MONTH FROM CURRENT_DATE)
  );
END;
$$;
