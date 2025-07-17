
-- Créer la table pour stocker les configurations Meta Ads
CREATE TABLE public.meta_ads_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  client_id TEXT NOT NULL,
  client_secret TEXT NOT NULL,
  redirect_uri TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Activer RLS pour la sécurité
ALTER TABLE public.meta_ads_config ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre aux utilisateurs de voir leurs propres configurations
CREATE POLICY "Users can view their own meta ads config" 
  ON public.meta_ads_config 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Politique pour permettre aux utilisateurs de créer leurs propres configurations
CREATE POLICY "Users can create their own meta ads config" 
  ON public.meta_ads_config 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Politique pour permettre aux utilisateurs de modifier leurs propres configurations
CREATE POLICY "Users can update their own meta ads config" 
  ON public.meta_ads_config 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Politique pour permettre aux utilisateurs de supprimer leurs propres configurations
CREATE POLICY "Users can delete their own meta ads config" 
  ON public.meta_ads_config 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Contrainte d'unicité pour éviter les doublons par utilisateur
ALTER TABLE public.meta_ads_config 
ADD CONSTRAINT unique_user_meta_config 
UNIQUE (user_id);

-- Trigger pour mettre à jour automatiquement updated_at
CREATE TRIGGER update_meta_ads_config_updated_at
  BEFORE UPDATE ON public.meta_ads_config
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
