
-- Create table for financial tracking data
CREATE TABLE public.financial_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  date DATE NOT NULL,
  exchange_rate DECIMAL(10,4) NOT NULL DEFAULT 10.0,
  amount_received_usd DECIMAL(10,2) NOT NULL DEFAULT 0,
  amount_received_mad DECIMAL(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Enable Row Level Security
ALTER TABLE public.financial_tracking ENABLE ROW LEVEL SECURITY;

-- Create policies for user data access
CREATE POLICY "Users can view their own financial data" 
  ON public.financial_tracking 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own financial data" 
  ON public.financial_tracking 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own financial data" 
  ON public.financial_tracking 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own financial data" 
  ON public.financial_tracking 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create trigger to automatically update the updated_at column
CREATE TRIGGER update_financial_tracking_updated_at 
  BEFORE UPDATE ON public.financial_tracking 
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
