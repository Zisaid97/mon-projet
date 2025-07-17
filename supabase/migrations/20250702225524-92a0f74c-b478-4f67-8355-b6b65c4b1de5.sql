-- Create table for Meta Ads attributions with period support
CREATE TABLE IF NOT EXISTS public.attributions_meta (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  month DATE NOT NULL, -- Premier jour du mois
  product TEXT NOT NULL,
  country TEXT NOT NULL,
  spend_usd NUMERIC NOT NULL DEFAULT 0,
  spend_dh NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, month, product, country)
);

-- Enable RLS
ALTER TABLE public.attributions_meta ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own meta attributions" 
  ON public.attributions_meta 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own meta attributions" 
  ON public.attributions_meta 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own meta attributions" 
  ON public.attributions_meta 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own meta attributions" 
  ON public.attributions_meta 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_attributions_meta_updated_at
  BEFORE UPDATE ON public.attributions_meta
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create sync_logs table for tracking synchronization status
CREATE TABLE IF NOT EXISTS public.sync_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  sync_type TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('success', 'error', 'running')),
  last_sync_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for sync_logs
ALTER TABLE public.sync_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own sync logs" 
  ON public.sync_logs 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sync logs" 
  ON public.sync_logs 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sync logs" 
  ON public.sync_logs 
  FOR UPDATE 
  USING (auth.uid() = user_id);