
-- Fix RLS for monthly_average_exchange_rates view
-- Since this is a view, we need to ensure proper RLS on underlying tables
ALTER TABLE IF EXISTS financial_tracking ENABLE ROW LEVEL SECURITY;

-- Add RLS policy for financial_tracking if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'financial_tracking' 
    AND policyname = 'Users can only access their own financial data'
  ) THEN
    CREATE POLICY "Users can only access their own financial data" 
    ON financial_tracking FOR ALL 
    USING (user_id = auth.uid());
  END IF;
END
$$;

-- Ensure marketing_performance has proper RLS
ALTER TABLE IF EXISTS marketing_performance ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'marketing_performance' 
    AND policyname = 'Users can only access their own marketing data'
  ) THEN
    CREATE POLICY "Users can only access their own marketing data" 
    ON marketing_performance FOR ALL 
    USING (user_id = auth.uid());
  END IF;
END
$$;

-- Add audit logging table for security events
CREATE TABLE IF NOT EXISTS security_audit_log (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  event_type text NOT NULL,
  event_details jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on audit log
ALTER TABLE security_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can read audit logs
CREATE POLICY "Admins can read audit logs" 
ON security_audit_log FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

-- System can insert audit logs
CREATE POLICY "System can insert audit logs" 
ON security_audit_log FOR INSERT 
WITH CHECK (true);
