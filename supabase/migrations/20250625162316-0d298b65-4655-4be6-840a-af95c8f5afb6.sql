
-- Créer la table monthly_bonus pour stocker les bonus mensuels des utilisateurs
CREATE TABLE public.monthly_bonus (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL,
  amount_dh NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, year, month)
);

-- Activer Row Level Security (RLS)
ALTER TABLE public.monthly_bonus ENABLE ROW LEVEL SECURITY;

-- Créer les politiques RLS pour que les utilisateurs ne voient que leurs propres bonus
CREATE POLICY "Users can view their own monthly bonus" 
  ON public.monthly_bonus 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own monthly bonus" 
  ON public.monthly_bonus 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own monthly bonus" 
  ON public.monthly_bonus 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own monthly bonus" 
  ON public.monthly_bonus 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Créer un trigger pour mettre à jour automatiquement updated_at
CREATE TRIGGER update_monthly_bonus_updated_at
  BEFORE UPDATE ON public.monthly_bonus
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
