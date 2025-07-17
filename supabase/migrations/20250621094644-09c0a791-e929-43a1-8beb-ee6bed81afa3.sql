
-- Créer la table user_notes pour stocker les notes des utilisateurs
CREATE TABLE public.user_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  page_type TEXT NOT NULL CHECK (page_type IN ('marketing', 'profits')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Activer Row Level Security (RLS)
ALTER TABLE public.user_notes ENABLE ROW LEVEL SECURITY;

-- Créer les politiques RLS pour que les utilisateurs ne voient que leurs propres notes
CREATE POLICY "Users can view their own notes" 
  ON public.user_notes 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own notes" 
  ON public.user_notes 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notes" 
  ON public.user_notes 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notes" 
  ON public.user_notes 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Créer un trigger pour mettre à jour automatiquement updated_at
CREATE TRIGGER update_user_notes_updated_at
  BEFORE UPDATE ON public.user_notes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
