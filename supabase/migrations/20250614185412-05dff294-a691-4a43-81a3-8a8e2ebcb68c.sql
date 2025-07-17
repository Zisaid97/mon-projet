
-- Activer RLS sur toutes les tables (ne fait rien si déjà activé)
ALTER TABLE public.financial_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profit_tracking ENABLE ROW LEVEL SECURITY;

-- Supprimer et recréer les politiques pour financial_tracking
DROP POLICY IF EXISTS "Users can view their own financial data" ON public.financial_tracking;
DROP POLICY IF EXISTS "Users can insert their own financial data" ON public.financial_tracking;
DROP POLICY IF EXISTS "Users can update their own financial data" ON public.financial_tracking;
DROP POLICY IF EXISTS "Users can delete their own financial data" ON public.financial_tracking;

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

-- Supprimer et recréer les politiques pour marketing_performance
DROP POLICY IF EXISTS "Users can view their own marketing data" ON public.marketing_performance;
DROP POLICY IF EXISTS "Users can insert their own marketing data" ON public.marketing_performance;
DROP POLICY IF EXISTS "Users can update their own marketing data" ON public.marketing_performance;
DROP POLICY IF EXISTS "Users can delete their own marketing data" ON public.marketing_performance;

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

-- Supprimer et recréer les politiques pour profit_tracking
DROP POLICY IF EXISTS "Users can view their own profit data" ON public.profit_tracking;
DROP POLICY IF EXISTS "Users can insert their own profit data" ON public.profit_tracking;
DROP POLICY IF EXISTS "Users can update their own profit data" ON public.profit_tracking;
DROP POLICY IF EXISTS "Users can delete their own profit data" ON public.profit_tracking;

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
