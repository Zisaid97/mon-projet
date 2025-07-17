
-- Create table for automatic marketing spend attribution
CREATE TABLE IF NOT EXISTS public.marketing_spend_attrib (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  date DATE NOT NULL,
  country TEXT NOT NULL,
  product TEXT NOT NULL,
  spend_usd NUMERIC NOT NULL DEFAULT 0,
  spend_dh NUMERIC NOT NULL DEFAULT 0,
  source TEXT NOT NULL DEFAULT 'Meta Ads',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, date, country, product, source)
);

-- Enable RLS
ALTER TABLE public.marketing_spend_attrib ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own marketing spend attributions" 
  ON public.marketing_spend_attrib 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own marketing spend attributions" 
  ON public.marketing_spend_attrib 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own marketing spend attributions" 
  ON public.marketing_spend_attrib 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own marketing spend attributions" 
  ON public.marketing_spend_attrib 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_marketing_spend_attrib_updated_at
  BEFORE UPDATE ON public.marketing_spend_attrib
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
