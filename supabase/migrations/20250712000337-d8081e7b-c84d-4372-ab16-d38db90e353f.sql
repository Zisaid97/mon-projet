-- Create security_events table for audit logging
CREATE TABLE public.security_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  description TEXT NOT NULL,
  user_id UUID,
  ip_address TEXT,
  user_agent TEXT,
  additional_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;

-- Create policies for security events
CREATE POLICY "Users can view their own security events" 
ON public.security_events 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can insert security events" 
ON public.security_events 
FOR INSERT 
WITH CHECK (true);

-- Only admins can view all security events
CREATE POLICY "Admins can view all security events" 
ON public.security_events 
FOR SELECT 
USING (auth.uid() IN (
  SELECT user_id FROM organization_members 
  WHERE role IN ('admin', 'owner') 
  AND deactivated = false
));

-- Create index for performance
CREATE INDEX idx_security_events_user_id ON public.security_events(user_id);
CREATE INDEX idx_security_events_event_type ON public.security_events(event_type);
CREATE INDEX idx_security_events_created_at ON public.security_events(created_at);