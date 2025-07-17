
-- Create tables for AI integration
CREATE TABLE IF NOT EXISTS public.insights_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  content TEXT NOT NULL,
  insights_type TEXT DEFAULT 'general',
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + INTERVAL '24 hours'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create table for AI alerts and suggestions
CREATE TABLE IF NOT EXISTS public.alerts_ai (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  type TEXT NOT NULL DEFAULT 'suggestion',
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  severity TEXT DEFAULT 'medium', -- low, medium, high
  is_read BOOLEAN DEFAULT false,
  data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create table for chat history
CREATE TABLE IF NOT EXISTS public.ai_chat_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  session_id UUID NOT NULL,
  role TEXT NOT NULL, -- 'user' or 'assistant'
  content TEXT NOT NULL,
  context_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.insights_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts_ai ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_chat_history ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for insights_cache
CREATE POLICY "Users can view their own insights" ON public.insights_cache
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own insights" ON public.insights_cache
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own insights" ON public.insights_cache
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own insights" ON public.insights_cache
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for alerts_ai
CREATE POLICY "Users can view their own AI alerts" ON public.alerts_ai
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own AI alerts" ON public.alerts_ai
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own AI alerts" ON public.alerts_ai
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own AI alerts" ON public.alerts_ai
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for ai_chat_history
CREATE POLICY "Users can view their own chat history" ON public.ai_chat_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own chat history" ON public.ai_chat_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own chat history" ON public.ai_chat_history
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_insights_cache_user_id ON public.insights_cache(user_id);
CREATE INDEX IF NOT EXISTS idx_insights_cache_expires_at ON public.insights_cache(expires_at);
CREATE INDEX IF NOT EXISTS idx_alerts_ai_user_id ON public.alerts_ai(user_id);
CREATE INDEX IF NOT EXISTS idx_alerts_ai_is_read ON public.alerts_ai(is_read);
CREATE INDEX IF NOT EXISTS idx_ai_chat_history_user_id ON public.ai_chat_history(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_chat_history_session_id ON public.ai_chat_history(session_id);

-- Create function to clean expired insights
CREATE OR REPLACE FUNCTION clean_expired_insights()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.insights_cache WHERE expires_at < now();
END;
$$;
