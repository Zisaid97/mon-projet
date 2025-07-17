-- Activer les extensions nécessaires pour les tâches cron
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Créer un cron job pour synchroniser les données Meta Ads chaque jour à minuit (UTC)
SELECT cron.schedule(
  'sync-meta-ads-daily',
  '0 0 * * *', -- Chaque jour à minuit UTC
  $$
  SELECT
    net.http_post(
        url:='https://uqqajzfkqushviwuayng.supabase.co/functions/v1/sync-meta-ads-data',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVxcWFqemZrcXVzaHZpd3VheW5nIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTg5MzcwOCwiZXhwIjoyMDY1NDY5NzA4fQ.MeTBWTvN6FdH1WbV9TFrcQw2lIhFZLEGqOEktGlvCyo"}'::jsonb,
        body:='{"triggered_by": "cron", "timestamp": "'||now()||'"}'::jsonb
    ) as request_id;
  $$
);

-- Ajouter une contrainte unique pour éviter les doublons dans meta_spend_daily
ALTER TABLE public.meta_spend_daily 
ADD CONSTRAINT meta_spend_daily_unique_entry 
UNIQUE (user_id, campaign_id, date);

-- Créer un index pour améliorer les performances des requêtes
CREATE INDEX IF NOT EXISTS idx_meta_spend_daily_user_date 
ON public.meta_spend_daily (user_id, date DESC);

CREATE INDEX IF NOT EXISTS idx_meta_spend_daily_synced_at 
ON public.meta_spend_daily (synced_at DESC);