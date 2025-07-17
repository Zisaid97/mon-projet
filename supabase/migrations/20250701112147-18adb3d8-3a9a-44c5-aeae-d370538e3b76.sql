
-- Créer les tables d'archives avec la même structure que les tables principales
CREATE TABLE public.archive_profit_tracking (LIKE public.profit_tracking INCLUDING ALL);
ALTER TABLE public.archive_profit_tracking ADD COLUMN month_label text NOT NULL;

CREATE TABLE public.archive_marketing_performance (LIKE public.marketing_performance INCLUDING ALL);
ALTER TABLE public.archive_marketing_performance ADD COLUMN month_label text NOT NULL;

CREATE TABLE public.archive_sales_data (LIKE public.sales_data INCLUDING ALL);
ALTER TABLE public.archive_sales_data ADD COLUMN month_label text NOT NULL;

CREATE TABLE public.archive_financial_tracking (LIKE public.financial_tracking INCLUDING ALL);
ALTER TABLE public.archive_financial_tracking ADD COLUMN month_label text NOT NULL;

CREATE TABLE public.archive_ad_spending_data (LIKE public.ad_spending_data INCLUDING ALL);
ALTER TABLE public.archive_ad_spending_data ADD COLUMN month_label text NOT NULL;

-- Table pour les logs système
CREATE TABLE public.system_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  user_id UUID REFERENCES auth.users
);

-- Activer RLS sur les tables d'archives
ALTER TABLE public.archive_profit_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.archive_marketing_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.archive_sales_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.archive_financial_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.archive_ad_spending_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;

-- Créer les politiques RLS pour les archives
CREATE POLICY "Users can view their own archived profit data" 
  ON public.archive_profit_tracking 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own archived marketing data" 
  ON public.archive_marketing_performance 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own archived sales data" 
  ON public.archive_sales_data 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own archived financial data" 
  ON public.archive_financial_tracking 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own archived ad spending data" 
  ON public.archive_ad_spending_data 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view system logs" 
  ON public.system_logs 
  FOR SELECT 
  USING (true);

-- Fonction pour déplacer les données vers les archives
CREATE OR REPLACE FUNCTION public.move_to_archive(
  src_table text,
  dest_table text,
  month_label text,
  target_user_id uuid DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  sql_query text;
BEGIN
  -- Construction de la requête dynamique pour déplacer les données
  sql_query := format(
    'INSERT INTO public.%I SELECT *, %L FROM public.%I WHERE EXTRACT(YEAR FROM date) = EXTRACT(YEAR FROM %L::date) AND EXTRACT(MONTH FROM date) = EXTRACT(MONTH FROM %L::date)',
    dest_table,
    month_label,
    src_table,
    month_label || '-01',
    month_label || '-01'
  );
  
  -- Si un utilisateur spécifique est ciblé, ajouter la condition
  IF target_user_id IS NOT NULL THEN
    sql_query := sql_query || format(' AND user_id = %L', target_user_id);
  END IF;
  
  -- Exécuter l'insertion
  EXECUTE sql_query;
  
  -- Supprimer les données de la table source
  sql_query := format(
    'DELETE FROM public.%I WHERE EXTRACT(YEAR FROM date) = EXTRACT(YEAR FROM %L::date) AND EXTRACT(MONTH FROM date) = EXTRACT(MONTH FROM %L::date)',
    src_table,
    month_label || '-01',
    month_label || '-01'
  );
  
  -- Si un utilisateur spécifique est ciblé, ajouter la condition
  IF target_user_id IS NOT NULL THEN
    sql_query := sql_query || format(' AND user_id = %L', target_user_id);
  END IF;
  
  -- Exécuter la suppression
  EXECUTE sql_query;
END;
$$;

-- Fonction pour récupérer les données (actuelles ou archivées)
CREATE OR REPLACE FUNCTION public.get_data_with_archives(
  table_name text,
  start_date date,
  end_date date,
  target_user_id uuid
)
RETURNS TABLE(data jsonb)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  sql_query text;
  archive_table text;
BEGIN
  archive_table := 'archive_' || table_name;
  
  -- Construire la requête pour récupérer les données des deux tables
  sql_query := format(
    'SELECT to_jsonb(t.*) FROM (
      SELECT * FROM public.%I 
      WHERE user_id = %L AND date BETWEEN %L AND %L
      UNION ALL
      SELECT * FROM public.%I 
      WHERE user_id = %L AND date BETWEEN %L AND %L
    ) t ORDER BY date DESC',
    table_name, target_user_id, start_date, end_date,
    archive_table, target_user_id, start_date, end_date
  );
  
  RETURN QUERY EXECUTE sql_query;
END;
$$;
