
-- Create table for profit tracking (CPD commissions)
CREATE TABLE public.profit_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  date DATE NOT NULL,
  cpd_category DECIMAL(4,2) NOT NULL, -- 11.00, 13.00, 15.00, 20.00, 24.00, 30.00, 35.00
  quantity INTEGER NOT NULL DEFAULT 0,
  commission_total DECIMAL(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, date, cpd_category)
);

-- Enable Row Level Security
ALTER TABLE public.profit_tracking ENABLE ROW LEVEL SECURITY;

-- Create policies for user data access
CREATE POLICY "Users can view their own profit data" 
  ON public.profit_tracking 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profit data" 
  ON public.profit_tracking 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profit data" 
  ON public.profit_tracking 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own profit data" 
  ON public.profit_tracking 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create trigger to automatically update the updated_at column
CREATE TRIGGER update_profit_tracking_updated_at 
  BEFORE UPDATE ON public.profit_tracking 
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
