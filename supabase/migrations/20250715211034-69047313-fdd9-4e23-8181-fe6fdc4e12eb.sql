-- Corriger les problèmes de sécurité détectés par Security Advisor

-- 1. Fixer les fonctions avec search_path mutable
CREATE OR REPLACE FUNCTION public.archive_product_keywords_before_delete()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    -- Fixer le search_path pour garantir un comportement sécurisé
    PERFORM set_config('search_path', 'public', false);
    
    -- Archiver le mot-clé avec les informations du produit
    INSERT INTO public.product_keywords_archive (
        original_keyword_id,
        product_id,
        product_name,
        keyword,
        note,
        user_id,
        deletion_reason,
        created_at,
        updated_at
    )
    SELECT 
        OLD.id,
        OLD.product_id,
        COALESCE(p.name, 'Produit supprimé'),
        OLD.keyword,
        OLD.note,
        OLD.user_id,
        CASE 
            WHEN TG_TAG = 'product_deleted' THEN 'product_deletion'
            ELSE 'manual_deletion'
        END,
        OLD.created_at,
        OLD.updated_at
    FROM public.products p
    WHERE p.id = OLD.product_id;
    
    RETURN OLD;
END;
$function$;

CREATE OR REPLACE FUNCTION public.archive_keywords_on_product_delete()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    -- Fixer le search_path pour garantir un comportement sécurisé
    PERFORM set_config('search_path', 'public', false);
    
    -- Archiver tous les mots-clés du produit supprimé
    INSERT INTO public.product_keywords_archive (
        original_keyword_id,
        product_id,
        product_name,
        keyword,
        note,
        user_id,
        deletion_reason,
        created_at,
        updated_at
    )
    SELECT 
        pk.id,
        pk.product_id,
        OLD.name,
        pk.keyword,
        pk.note,
        pk.user_id,
        'product_deletion',
        pk.created_at,
        pk.updated_at
    FROM public.product_keywords pk
    WHERE pk.product_id = OLD.id;
    
    RETURN OLD;
END;
$function$;

CREATE OR REPLACE FUNCTION public.move_to_archive(src_table text, dest_table text, month_label text, target_user_id uuid DEFAULT NULL::uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  sql_query text;
BEGIN
  -- Fixer le search_path pour garantir un comportement sécurisé
  PERFORM set_config('search_path', 'public', false);
  
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
$function$;

CREATE OR REPLACE FUNCTION public.get_data_with_archives(table_name text, start_date date, end_date date, target_user_id uuid)
 RETURNS TABLE(data jsonb)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  sql_query text;
  archive_table text;
BEGIN
  -- Fixer le search_path pour garantir un comportement sécurisé
  PERFORM set_config('search_path', 'public', false);
  
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
$function$;

CREATE OR REPLACE FUNCTION public.update_country_data()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    user_record RECORD;
    start_date date;
    end_date date;
BEGIN
    -- Fixer le search_path pour garantir un comportement sécurisé
    PERFORM set_config('search_path', 'public', false);
    
    start_date := CURRENT_DATE - INTERVAL '30 days';
    end_date := CURRENT_DATE;
    
    FOR user_record IN SELECT DISTINCT user_id FROM marketing_performance
    LOOP
        -- Insérer des données de pays simulées (Maroc par défaut)
        INSERT INTO country_data (
            user_id, country_code, country_name, 
            revenue_mad, spend_mad, profit_mad, roi_percent,
            delivery_rate, cpl_mad, cpd_mad,
            period_start, period_end
        )
        SELECT 
            user_record.user_id,
            'MA' as country_code,
            'Maroc' as country_name,
            COALESCE(SUM(mp.margin_per_order * mp.deliveries), 0) as revenue_mad,
            COALESCE(SUM(mp.spend_usd * 10.5), 0) as spend_mad,
            COALESCE(SUM(mp.margin_per_order * mp.deliveries) - SUM(mp.spend_usd * 10.5), 0) as profit_mad,
            CASE 
                WHEN SUM(mp.spend_usd * 10.5) > 0 
                THEN ((SUM(mp.margin_per_order * mp.deliveries) - SUM(mp.spend_usd * 10.5)) / SUM(mp.spend_usd * 10.5)) * 100
                ELSE 0 
            END as roi_percent,
            CASE 
                WHEN SUM(mp.leads) > 0 
                THEN (SUM(mp.deliveries)::numeric / SUM(mp.leads)) * 100
                ELSE 0 
            END as delivery_rate,
            CASE WHEN SUM(mp.leads) > 0 THEN SUM(mp.spend_usd * 10.5) / SUM(mp.leads) ELSE 0 END as cpl_mad,
            CASE WHEN SUM(mp.deliveries) > 0 THEN SUM(mp.spend_usd * 10.5) / SUM(mp.deliveries) ELSE 0 END as cpd_mad,
            start_date,
            end_date
        FROM marketing_performance mp
        WHERE mp.user_id = user_record.user_id
        AND mp.date BETWEEN start_date AND end_date
        GROUP BY user_record.user_id
        ON CONFLICT (user_id, country_code, period_start, period_end) 
        DO UPDATE SET 
            revenue_mad = EXCLUDED.revenue_mad,
            spend_mad = EXCLUDED.spend_mad,
            profit_mad = EXCLUDED.profit_mad,
            roi_percent = EXCLUDED.roi_percent,
            delivery_rate = EXCLUDED.delivery_rate,
            cpl_mad = EXCLUDED.cpl_mad,
            cpd_mad = EXCLUDED.cpd_mad,
            updated_at = now();
    END LOOP;
END;
$function$;

CREATE OR REPLACE FUNCTION public.clean_expired_insights()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  -- Fixer le search_path pour garantir un comportement sécurisé
  PERFORM set_config('search_path', 'public', false);
  
  DELETE FROM public.insights_cache WHERE expires_at < now();
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  -- Fixer le search_path pour garantir un comportement sécurisé
  PERFORM set_config('search_path', 'public', false);
  
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- 2. Déplacer l'extension pg_net du schéma public vers le schéma extensions
-- Cette extension ne devrait pas être dans le schéma public pour des raisons de sécurité
DROP EXTENSION IF EXISTS pg_net;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;