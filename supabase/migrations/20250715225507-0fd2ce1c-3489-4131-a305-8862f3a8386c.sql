-- Nettoyage complet de tous les éléments liés aux taux de change moyens

-- Supprimer toutes les vues/tables existantes
DROP VIEW IF EXISTS public.monthly_average_exchange_rates CASCADE;
DROP TABLE IF EXISTS public.monthly_average_exchange_rates CASCADE;

-- Supprimer les fonctions existantes
DROP FUNCTION IF EXISTS public.get_current_month_average_rate(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.update_monthly_average_rates(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.refresh_monthly_average_rates() CASCADE;

-- Créer une nouvelle table propre pour les taux de change moyens
CREATE TABLE public.monthly_average_exchange_rates (
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

-- Activer RLS sur la nouvelle table
ALTER TABLE public.monthly_average_exchange_rates ENABLE ROW LEVEL SECURITY;

-- Créer une politique RLS simple
CREATE POLICY "Users can view their own monthly averages" 
ON public.monthly_average_exchange_rates 
FOR ALL
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Fonction simple pour obtenir le taux moyen du mois courant (sans SECURITY DEFINER)
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