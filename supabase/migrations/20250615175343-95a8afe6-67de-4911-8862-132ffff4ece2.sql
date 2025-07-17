
-- Table notifications par utilisateur
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  type TEXT NOT NULL, -- "alerte", "suggestion", "objectif", etc.
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  channel TEXT NOT NULL DEFAULT 'popup', -- popup, email, ou both
  data JSONB,
  status TEXT NOT NULL DEFAULT 'unread', -- unread, read
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_user_id ON public.notifications (user_id);
CREATE INDEX idx_notifications_status ON public.notifications (status);

-- Table de préférences notifications par utilisateur
CREATE TABLE public.notification_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  enable_notifications BOOLEAN NOT NULL DEFAULT true,
  channels TEXT[] NOT NULL DEFAULT ARRAY['popup', 'email'],
  types TEXT[] NOT NULL DEFAULT ARRAY['alerte', 'suggestion', 'objectif', 'campagne', 'lead', 'finances'],
  email_summary_frequency TEXT NOT NULL DEFAULT 'daily', -- daily, weekly
  email_signature TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX uniq_notification_settings_user_id ON public.notification_settings (user_id);

-- RLS pour sécuriser ces tables par user
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Utilisateur voit ses notifications" 
  ON public.notifications FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Utilisateur gère ses notifications" 
  ON public.notifications FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Utilisateur met à jour ses notifications" 
  ON public.notifications FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Utilisateur supprime ses notifications"
  ON public.notifications FOR DELETE 
  USING (auth.uid() = user_id);

-- RLS settings
CREATE POLICY "Utilisateur voit les réglages notif"
  ON public.notification_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Utilisateur gère les réglages notif"
  ON public.notification_settings FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Utilisateur modifie ses réglages notif"
  ON public.notification_settings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Utilisateur supprime ses réglages notif"
  ON public.notification_settings FOR DELETE
  USING (auth.uid() = user_id);
