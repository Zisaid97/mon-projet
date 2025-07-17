
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { SecureSessionManager, setupActivityTracking } from '@/utils/secureSessionManager';
import { logEnhancedSecurityEvent } from '@/utils/enhancedAuthUtils';
import { validateSecurityHeaders, validateOrigin } from '@/utils/security/securityHeaders';
import { enhancedRateLimit } from '@/utils/security/enhancedValidation';
import { toast } from '@/hooks/use-toast';

interface EnhancedSecurityValidatorProps {
  children: React.ReactNode;
}

export function EnhancedSecurityValidator({ children }: EnhancedSecurityValidatorProps) {
  const { user, logout } = useAuth();
  const [sessionWarningShown, setSessionWarningShown] = useState(false);
  const [securityInitialized, setSecurityInitialized] = useState(false);

  // Initialize security measures
  useEffect(() => {
    const initializeSecurity = async () => {
      if (!user || securityInitialized) return;

      const sessionManager = SecureSessionManager.getInstance();
      sessionManager.setUserId(user.id);

      // Rate limiting for user actions
      const rateLimitResult = enhancedRateLimit(user.id, 1000, 60000); // 1000 actions per minute
      if (!rateLimitResult.allowed) {
        await logEnhancedSecurityEvent('USER_RATE_LIMITED', {
          remaining: rateLimitResult.remaining,
          resetTime: rateLimitResult.resetTime
        }, user.id);
      }

      // Validate current origin
      const allowedOrigins = [
        window.location.origin,
        'https://*.supabase.co',
        'https://*.lovable.app'
      ];
      
      const isValidOrigin = validateOrigin(allowedOrigins)(window.location.origin);
      if (!isValidOrigin) {
        await logEnhancedSecurityEvent('INVALID_ORIGIN_DETECTED', {
          origin: window.location.origin
        }, user.id);
      }

      // Security headers validation with enhanced checks
      try {
        const headerValidation = await validateSecurityHeaders(window.location.origin);
        if (!headerValidation.valid) {
          await logEnhancedSecurityEvent('SECURITY_HEADERS_MISSING', {
            issues: headerValidation.issues,
            recommendations: headerValidation.recommendations
          }, user.id);
        }
      } catch (error) {
        await logEnhancedSecurityEvent('SECURITY_VALIDATION_FAILED', {
          error: error instanceof Error ? error.message : 'Unknown error'
        }, user.id);
      }

      // Session management with enhanced security
      const handleTimeout = async () => {
        await logEnhancedSecurityEvent('FORCED_LOGOUT_SESSION_TIMEOUT', {}, user.id);
        toast({
          title: "Session expirée",
          description: "Votre session a expiré pour des raisons de sécurité. Veuillez vous reconnecter.",
          variant: "destructive",
        });
        await logout();
      };

      const handleWarning = () => {
        if (!sessionWarningShown) {
          setSessionWarningShown(true);
          toast({
            title: "Session bientôt expirée",
            description: "Votre session expirera dans 5 minutes. Continuez votre activité pour la prolonger.",
            variant: "default",
          });
          
          setTimeout(() => setSessionWarningShown(false), 60000);
        }
      };

      sessionManager.startSessionTimeout(handleTimeout, handleWarning);

      // Enhanced activity tracking with security monitoring
      const cleanupActivityTracking = setupActivityTracking();

      // Monitor for suspicious activity patterns
      const monitorSuspiciousActivity = () => {
        const suspiciousEvents = [
          'contextmenu', // Right-click attempts
          'selectstart', // Text selection attempts
          'dragstart',   // Drag attempts
          'copy',        // Copy attempts
        ];

        suspiciousEvents.forEach(eventType => {
          document.addEventListener(eventType, async (e) => {
            await logEnhancedSecurityEvent('SUSPICIOUS_USER_ACTIVITY', {
              eventType,
              timestamp: new Date().toISOString()
            }, user.id);
          }, { passive: true });
        });
      };

      monitorSuspiciousActivity();

      // Extend session on legitimate user activity
      const extendSession = async () => {
        const rateLimitCheck = enhancedRateLimit(`${user.id}_session_extend`, 60, 60000);
        if (rateLimitCheck.allowed) {
          sessionManager.extendSession(handleTimeout, handleWarning);
          setSessionWarningShown(false);
        }
      };

      const activityEvents = ['click', 'keydown', 'scroll', 'mousemove'];
      activityEvents.forEach(event => {
        document.addEventListener(event, extendSession, { passive: true });
      });

      setSecurityInitialized(true);

      // Cleanup function
      return () => {
        sessionManager.clearAllTimeouts();
        cleanupActivityTracking();
        activityEvents.forEach(event => {
          document.removeEventListener(event, extendSession);
        });
      };
    };

    initializeSecurity();
  }, [user, logout, sessionWarningShown, securityInitialized]);

  // Monitor for browser security features
  useEffect(() => {
    const checkBrowserSecurity = async () => {
      const securityFeatures = {
        https: window.location.protocol === 'https:',
        localStorage: typeof Storage !== 'undefined',
        sessionStorage: typeof sessionStorage !== 'undefined',
        crypto: typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function',
        csp: document.querySelector('meta[http-equiv="Content-Security-Policy"]') !== null
      };

      const missingFeatures = Object.entries(securityFeatures)
        .filter(([, supported]) => !supported)
        .map(([feature]) => feature);

      if (missingFeatures.length > 0) {
        await logEnhancedSecurityEvent('BROWSER_SECURITY_FEATURES_MISSING', {
          missingFeatures,
          userAgent: navigator.userAgent
        }, user?.id);
      }
    };

    checkBrowserSecurity();
  }, [user?.id]);

  return <>{children}</>;
}
