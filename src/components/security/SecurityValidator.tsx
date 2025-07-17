
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { SecureSessionManager, setupActivityTracking } from '@/utils/secureSessionManager';
import { logSecurityEvent } from '@/utils/validation';
import { toast } from '@/hooks/use-toast';

interface SecurityValidatorProps {
  children: React.ReactNode;
}

export function SecurityValidator({ children }: SecurityValidatorProps) {
  const { user, logout } = useAuth();
  const [sessionWarningShown, setSessionWarningShown] = useState(false);

  useEffect(() => {
    if (!user) return;

    const sessionManager = SecureSessionManager.getInstance();
    sessionManager.setUserId(user.id);

    // Setup session timeout
    const handleTimeout = async () => {
      await logSecurityEvent('FORCED_LOGOUT_SESSION_TIMEOUT', {}, user.id);
      toast({
        title: "Session expirée",
        description: "Votre session a expiré pour des raisons de sécurité. Veuillez vous reconnecter.",
        variant: "destructive",
      });
      logout();
    };

    const handleWarning = () => {
      if (!sessionWarningShown) {
        setSessionWarningShown(true);
        toast({
          title: "Session bientôt expirée",
          description: "Votre session expirera dans 5 minutes. Continuez votre activité pour la prolonger.",
          variant: "default",
        });
        
        // Reset warning flag after timeout period
        setTimeout(() => setSessionWarningShown(false), 60000);
      }
    };

    sessionManager.startSessionTimeout(handleTimeout, handleWarning);

    // Setup activity tracking
    const cleanupActivityTracking = setupActivityTracking();

    // Extend session on user activity
    const extendSession = () => {
      sessionManager.extendSession(handleTimeout, handleWarning);
      setSessionWarningShown(false);
    };

    // Listen for activity to extend session
    const activityEvents = ['click', 'keydown', 'scroll'];
    activityEvents.forEach(event => {
      document.addEventListener(event, extendSession, { passive: true });
    });

    // Cleanup
    return () => {
      sessionManager.clearAllTimeouts();
      cleanupActivityTracking();
      activityEvents.forEach(event => {
        document.removeEventListener(event, extendSession);
      });
    };
  }, [user, logout, sessionWarningShown]);

  // Security headers validation (client-side check)
  useEffect(() => {
    const checkSecurityHeaders = async () => {
      try {
        const response = await fetch(window.location.href, { method: 'HEAD' });
        const hasXContentTypeOptions = response.headers.has('x-content-type-options');
        const hasXFrameOptions = response.headers.has('x-frame-options');
        const hasXXssProtection = response.headers.has('x-xss-protection');

        if (!hasXContentTypeOptions || !hasXFrameOptions || !hasXXssProtection) {
          await logSecurityEvent('MISSING_SECURITY_HEADERS', {
            missing_headers: {
              'x-content-type-options': !hasXContentTypeOptions,
              'x-frame-options': !hasXFrameOptions,
              'x-xss-protection': !hasXXssProtection
            }
          }, user?.id);
        }
      } catch (error) {
        // Silently fail - this is just a client-side check
      }
    };

    checkSecurityHeaders();
  }, [user?.id]);

  return <>{children}</>;
}
