
-- Create table for Google Sheets integrations
CREATE TABLE public.google_integrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  google_email TEXT NOT NULL,
  google_name TEXT NOT NULL,
  connected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS)
ALTER TABLE public.google_integrations ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own Google integrations" 
  ON public.google_integrations 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own Google integrations" 
  ON public.google_integrations 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own Google integrations" 
  ON public.google_integrations 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own Google integrations" 
  ON public.google_integrations 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_google_integrations_updated_at
  BEFORE UPDATE ON public.google_integrations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
