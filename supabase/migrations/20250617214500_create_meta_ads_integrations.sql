
-- Create table for Meta Ads integrations
CREATE TABLE public.meta_ads_integrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  meta_account_id TEXT NOT NULL,
  meta_account_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable Row Level Security
ALTER TABLE public.meta_ads_integrations ENABLE ROW LEVEL SECURITY;

-- Create policies for user data access
CREATE POLICY "Users can view their own Meta Ads integration" 
  ON public.meta_ads_integrations 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own Meta Ads integration" 
  ON public.meta_ads_integrations 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own Meta Ads integration" 
  ON public.meta_ads_integrations 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own Meta Ads integration" 
  ON public.meta_ads_integrations 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create trigger to automatically update the updated_at column
CREATE TRIGGER update_meta_ads_integrations_updated_at 
  BEFORE UPDATE ON public.meta_ads_integrations 
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
