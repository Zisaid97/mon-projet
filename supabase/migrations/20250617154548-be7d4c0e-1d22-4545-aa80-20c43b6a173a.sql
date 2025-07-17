
-- Créer une vue pour calculer le taux de change moyen mensuel
CREATE OR REPLACE VIEW public.monthly_average_exchange_rates AS
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

-- Créer une fonction pour obtenir le taux moyen du mois courant
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

-- Enable RLS pour la vue
ALTER VIEW public.monthly_average_exchange_rates SET (security_barrier = true);
