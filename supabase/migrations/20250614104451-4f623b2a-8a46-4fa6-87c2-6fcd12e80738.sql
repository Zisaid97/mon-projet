
-- Create table for marketing performance data
CREATE TABLE public.marketing_performance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  date DATE NOT NULL,
  spend_usd DECIMAL(10,2) NOT NULL DEFAULT 0,
  leads INTEGER NOT NULL DEFAULT 0,
  deliveries INTEGER NOT NULL DEFAULT 0,
  margin_per_order DECIMAL(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Enable Row Level Security
ALTER TABLE public.marketing_performance ENABLE ROW LEVEL SECURITY;

-- Create policies for user data access
CREATE POLICY "Users can view their own marketing data" 
  ON public.marketing_performance 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own marketing data" 
  ON public.marketing_performance 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own marketing data" 
  ON public.marketing_performance 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own marketing data" 
  ON public.marketing_performance 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update the updated_at column
CREATE TRIGGER update_marketing_performance_updated_at 
  BEFORE UPDATE ON public.marketing_performance 
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
