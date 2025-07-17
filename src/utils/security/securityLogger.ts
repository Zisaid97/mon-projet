
import { supabase } from '@/integrations/supabase/client';

export interface SecurityEvent {
  event_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  user_id?: string;
  ip_address?: string;
  user_agent?: string;
  additional_data?: Record<string, any>;
}

export const logSecurityEvent = async (event: SecurityEvent): Promise<void> => {
  try {
    const enhancedEvent = {
      event_type: event.event_type,
      severity: event.severity,
      description: event.description,
      user_id: event.user_id,
      ip_address: event.ip_address || 'unknown',
      user_agent: event.user_agent || navigator?.userAgent || 'unknown',
      additional_data: event.additional_data,
    };

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.warn('[SECURITY EVENT]', enhancedEvent);
    }

    // Store in database for audit trail - using a more flexible approach
    const { error } = await supabase
      .from('security_events' as any)
      .insert(enhancedEvent);

    if (error && error.code !== '42P01') { // Ignore "relation does not exist" error
      console.error('Failed to log security event:', error);
    }
  } catch (error) {
    console.error('Security logging error:', error);
  }
};

export const logFailedAuthentication = (details: { email?: string; ip?: string }) => {
  logSecurityEvent({
    event_type: 'FAILED_AUTHENTICATION',
    severity: 'medium',
    description: 'Failed login attempt detected',
    additional_data: details,
  });
};

export const logSuspiciousActivity = (details: { activity: string; user_id?: string }) => {
  logSecurityEvent({
    event_type: 'SUSPICIOUS_ACTIVITY',
    severity: 'high',
    description: `Suspicious activity detected: ${details.activity}`,
    user_id: details.user_id,
    additional_data: details,
  });
};

export const logDataAccess = (details: { resource: string; user_id: string; action: string }) => {
  logSecurityEvent({
    event_type: 'DATA_ACCESS',
    severity: 'low',
    description: `Data access: ${details.action} on ${details.resource}`,
    user_id: details.user_id,
    additional_data: details,
  });
};

export const logPrivilegeEscalation = (details: { user_id: string; attempted_action: string }) => {
  logSecurityEvent({
    event_type: 'PRIVILEGE_ESCALATION',
    severity: 'critical',
    description: `Privilege escalation attempt: ${details.attempted_action}`,
    user_id: details.user_id,
    additional_data: details,
  });
};
