-- Supprimer la vue matérialisée 
DROP MATERIALIZED VIEW IF EXISTS public.monthly_average_exchange_rates CASCADE;

-- Créer une table normale au lieu d'une vue
CREATE TABLE IF NOT EXISTS public.monthly_average_exchange_rates (
  user_id uuid NOT NULL,
  year numeric NOT NULL,
  month numeric NOT NULL,
  month_start timestamp with time zone,
  average_rate numeric,
  entries_count bigint,
  total_usd numeric,
  total_mad numeric,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (user_id, year, month)
);

-- Activer RLS sur la table
ALTER TABLE public.monthly_average_exchange_rates ENABLE ROW LEVEL SECURITY;

-- Créer une politique RLS
CREATE POLICY "Users can view their own monthly averages" 
ON public.monthly_average_exchange_rates 
FOR ALL
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Créer une fonction pour calculer et mettre à jour les moyennes mensuelles
CREATE OR REPLACE FUNCTION public.update_monthly_average_rates(target_user_id uuid DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Supprimer les données existantes pour l'utilisateur ou tous si target_user_id est NULL
  IF target_user_id IS NOT NULL THEN
    DELETE FROM monthly_average_exchange_rates WHERE user_id = target_user_id;
  ELSE
    TRUNCATE monthly_average_exchange_rates;
  END IF;
  
  -- Insérer les nouvelles données calculées
  INSERT INTO monthly_average_exchange_rates (
    user_id, year, month, month_start, average_rate, entries_count, total_usd, total_mad
  )
  SELECT 
    ft.user_id,
    EXTRACT(YEAR FROM ft.date) as year,
    EXTRACT(MONTH FROM ft.date) as month,
    DATE_TRUNC('month', ft.date) as month_start,
    SUM(ft.amount_received_mad) / NULLIF(SUM(ft.amount_received_usd), 0) as average_rate,
    COUNT(*) as entries_count,
    SUM(ft.amount_received_usd) as total_usd,
    SUM(ft.amount_received_mad) as total_mad
  FROM financial_tracking ft
  WHERE ft.amount_received_usd > 0
    AND (target_user_id IS NULL OR ft.user_id = target_user_id)
  GROUP BY ft.user_id, EXTRACT(YEAR FROM ft.date), EXTRACT(MONTH FROM ft.date), DATE_TRUNC('month', ft.date);
END;
$$;

-- Fonction pour obtenir le taux moyen du mois courant
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

-- Initialiser les données pour tous les utilisateurs existants
SELECT public.update_monthly_average_rates();