
-- Create table for Google Sheets integration logs
CREATE TABLE public.google_sheets_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('connection_start', 'auth_redirect', 'token_exchange', 'connection_success', 'connection_error', 'permission_error', 'redirect_error')),
  message TEXT NOT NULL,
  error_details JSONB,
  user_agent TEXT,
  redirect_uri TEXT,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS)
ALTER TABLE public.google_sheets_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS
CREATE POLICY "Users can view their own Google Sheets logs" 
  ON public.google_sheets_logs 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own Google Sheets logs" 
  ON public.google_sheets_logs 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Index for better performance
CREATE INDEX idx_google_sheets_logs_user_id ON public.google_sheets_logs(user_id);
CREATE INDEX idx_google_sheets_logs_timestamp ON public.google_sheets_logs(timestamp);
