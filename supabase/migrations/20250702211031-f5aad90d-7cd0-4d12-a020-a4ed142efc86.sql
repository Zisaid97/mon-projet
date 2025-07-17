-- Create archive tables for monthly data archiving
CREATE TABLE IF NOT EXISTS public.archive_profit_tracking (LIKE public.profit_tracking INCLUDING ALL);
ALTER TABLE public.archive_profit_tracking ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP WITH TIME ZONE DEFAULT now();
ALTER TABLE public.archive_profit_tracking ADD COLUMN IF NOT EXISTS month_archived TEXT NOT NULL;

CREATE TABLE IF NOT EXISTS public.archive_marketing_performance (LIKE public.marketing_performance INCLUDING ALL);
ALTER TABLE public.archive_marketing_performance ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP WITH TIME ZONE DEFAULT now();
ALTER TABLE public.archive_marketing_performance ADD COLUMN IF NOT EXISTS month_archived TEXT NOT NULL;

CREATE TABLE IF NOT EXISTS public.archive_financial_tracking (LIKE public.financial_tracking INCLUDING ALL);
ALTER TABLE public.archive_financial_tracking ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP WITH TIME ZONE DEFAULT now();
ALTER TABLE public.archive_financial_tracking ADD COLUMN IF NOT EXISTS month_archived TEXT NOT NULL;

CREATE TABLE IF NOT EXISTS public.archive_sales_data (LIKE public.sales_data INCLUDING ALL);
ALTER TABLE public.archive_sales_data ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP WITH TIME ZONE DEFAULT now();
ALTER TABLE public.archive_sales_data ADD COLUMN IF NOT EXISTS month_archived TEXT NOT NULL;

CREATE TABLE IF NOT EXISTS public.archive_ad_spending_data (LIKE public.ad_spending_data INCLUDING ALL);
ALTER TABLE public.archive_ad_spending_data ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP WITH TIME ZONE DEFAULT now();
ALTER TABLE public.archive_ad_spending_data ADD COLUMN IF NOT EXISTS month_archived TEXT NOT NULL;

-- Enable RLS on archive tables
ALTER TABLE public.archive_profit_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.archive_marketing_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.archive_financial_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.archive_sales_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.archive_ad_spending_data ENABLE ROW LEVEL SECURITY;

-- Create policies for archive tables
CREATE POLICY "Users can view their own archived profit data" 
  ON public.archive_profit_tracking 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own archived marketing data" 
  ON public.archive_marketing_performance 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own archived financial data" 
  ON public.archive_financial_tracking 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own archived sales data" 
  ON public.archive_sales_data 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own archived ad spending data" 
  ON public.archive_ad_spending_data 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Function to archive monthly data
CREATE OR REPLACE FUNCTION public.archive_monthly_data(target_month TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
  profit_count INTEGER;
  marketing_count INTEGER;
  financial_count INTEGER;
  sales_count INTEGER;
  ad_spending_count INTEGER;
  start_date DATE;
  end_date DATE;
BEGIN
  -- Calculate date range for the month
  start_date := (target_month || '-01')::DATE;
  end_date := (start_date + INTERVAL '1 month - 1 day')::DATE;
  
  -- Archive profit_tracking data
  INSERT INTO public.archive_profit_tracking 
  SELECT *, now(), target_month 
  FROM public.profit_tracking 
  WHERE date BETWEEN start_date AND end_date;
  
  GET DIAGNOSTICS profit_count = ROW_COUNT;
  
  -- Archive marketing_performance data
  INSERT INTO public.archive_marketing_performance 
  SELECT *, now(), target_month 
  FROM public.marketing_performance 
  WHERE date BETWEEN start_date AND end_date;
  
  GET DIAGNOSTICS marketing_count = ROW_COUNT;
  
  -- Archive financial_tracking data
  INSERT INTO public.archive_financial_tracking 
  SELECT *, now(), target_month 
  FROM public.financial_tracking 
  WHERE date BETWEEN start_date AND end_date;
  
  GET DIAGNOSTICS financial_count = ROW_COUNT;
  
  -- Archive sales_data
  INSERT INTO public.archive_sales_data 
  SELECT *, now(), target_month 
  FROM public.sales_data 
  WHERE date BETWEEN start_date AND end_date;
  
  GET DIAGNOSTICS sales_count = ROW_COUNT;
  
  -- Archive ad_spending_data
  INSERT INTO public.archive_ad_spending_data 
  SELECT *, now(), target_month 
  FROM public.ad_spending_data 
  WHERE date BETWEEN start_date AND end_date;
  
  GET DIAGNOSTICS ad_spending_count = ROW_COUNT;
  
  -- Delete archived data from main tables
  DELETE FROM public.profit_tracking WHERE date BETWEEN start_date AND end_date;
  DELETE FROM public.marketing_performance WHERE date BETWEEN start_date AND end_date;
  DELETE FROM public.financial_tracking WHERE date BETWEEN start_date AND end_date;
  DELETE FROM public.sales_data WHERE date BETWEEN start_date AND end_date;
  DELETE FROM public.ad_spending_data WHERE date BETWEEN start_date AND end_date;
  
  -- Reset monthly bonus for the archived month
  DELETE FROM public.monthly_bonus 
  WHERE year = EXTRACT(YEAR FROM start_date) 
    AND month = EXTRACT(MONTH FROM start_date);
  
  -- Build result JSON
  result := json_build_object(
    'status', 'success',
    'month_archived', target_month,
    'archived_counts', json_build_object(
      'profit_tracking', profit_count,
      'marketing_performance', marketing_count,
      'financial_tracking', financial_count,
      'sales_data', sales_count,
      'ad_spending_data', ad_spending_count
    ),
    'archived_at', now()
  );
  
  RETURN result;
END;
$$;