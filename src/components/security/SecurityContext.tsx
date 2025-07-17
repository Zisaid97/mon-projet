import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { logSecurityEvent } from '@/utils/security/securityLogger';
import { rateLimiter } from '@/utils/security/rateLimiter';
import { generateNonce } from '@/utils/validation/sanitizers';

interface SecurityContextType {
  sessionNonce: string;
  checkRateLimit: (action: string) => boolean;
  logSecurityAction: (action: string, details?: any) => void;
}

const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

export function SecurityProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [sessionNonce] = useState(() => generateNonce());

  const checkRateLimit = (action: string): boolean => {
    const identifier = user?.id || 'anonymous';
    const result = rateLimiter.check(`${action}:${identifier}`);
    
    if (!result.allowed) {
      logSecurityEvent({
        event_type: 'RATE_LIMIT_VIOLATION',
        severity: 'medium',
        description: `Rate limit exceeded for action: ${action}`,
        user_id: user?.id,
        additional_data: { action, remaining: result.remaining },
      });
    }
    
    return result.allowed;
  };

  const logSecurityAction = (action: string, details?: any) => {
    logSecurityEvent({
      event_type: 'USER_ACTION',
      severity: 'low',
      description: `User action: ${action}`,
      user_id: user?.id,
      additional_data: { action, details, sessionNonce },
    });
  };

  // Monitor for suspicious activity
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        logSecurityAction('SESSION_HIDDEN');
      } else {
        logSecurityAction('SESSION_VISIBLE');
      }
    };

    const handleBeforeUnload = () => {
      logSecurityAction('SESSION_END');
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [user?.id]);

  const value: SecurityContextType = {
    sessionNonce,
    checkRateLimit,
    logSecurityAction,
  };

  return (
    <SecurityContext.Provider value={value}>
      {children}
    </SecurityContext.Provider>
  );
}

export function useSecurity() {
  const context = useContext(SecurityContext);
  if (context === undefined) {
    throw new Error('useSecurity must be used within a SecurityProvider');
  }
  return context;
}