
-- Create user_settings table to store user preferences
CREATE TABLE public.user_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  theme TEXT DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
  language TEXT DEFAULT 'fr' CHECK (language IN ('fr', 'en', 'ar')),
  currency TEXT DEFAULT 'MAD' CHECK (currency IN ('MAD', 'USD')),
  show_dual_amounts BOOLEAN DEFAULT false,
  show_margin_percentages BOOLEAN DEFAULT true,
  round_numbers BOOLEAN DEFAULT true,
  decimal_places INTEGER DEFAULT 2 CHECK (decimal_places IN (0, 2)),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable Row Level Security
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for user settings access
CREATE POLICY "Users can view their own settings" 
  ON public.user_settings 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings" 
  ON public.user_settings 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings" 
  ON public.user_settings 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own settings" 
  ON public.user_settings 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create trigger to automatically update the updated_at column
CREATE TRIGGER update_user_settings_updated_at 
  BEFORE UPDATE ON public.user_settings 
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
