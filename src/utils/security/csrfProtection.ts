
import React from 'react';
import { generateSecureNonce } from '@/utils/enhancedAuthUtils';
import { logEnhancedSecurityEvent } from '@/utils/enhancedAuthUtils';

// CSRF Token Management
class CSRFTokenManager {
  private static instance: CSRFTokenManager;
  private tokens: Map<string, { token: string; expires: number }> = new Map();
  private readonly TOKEN_EXPIRY = 30 * 60 * 1000; // 30 minutes

  static getInstance(): CSRFTokenManager {
    if (!CSRFTokenManager.instance) {
      CSRFTokenManager.instance = new CSRFTokenManager();
    }
    return CSRFTokenManager.instance;
  }

  generateToken(sessionId: string): string {
    const token = generateSecureNonce();
    const expires = Date.now() + this.TOKEN_EXPIRY;
    
    this.tokens.set(sessionId, { token, expires });
    
    // Cleanup expired tokens
    this.cleanupExpiredTokens();
    
    return token;
  }

  validateToken(sessionId: string, providedToken: string): boolean {
    const tokenData = this.tokens.get(sessionId);
    
    if (!tokenData) {
      logEnhancedSecurityEvent('CSRF_TOKEN_NOT_FOUND', { sessionId });
      return false;
    }

    if (Date.now() > tokenData.expires) {
      this.tokens.delete(sessionId);
      logEnhancedSecurityEvent('CSRF_TOKEN_EXPIRED', { sessionId });
      return false;
    }

    const isValid = tokenData.token === providedToken;
    
    if (!isValid) {
      logEnhancedSecurityEvent('CSRF_TOKEN_MISMATCH', { sessionId });
    }

    return isValid;
  }

  private cleanupExpiredTokens(): void {
    const now = Date.now();
    for (const [sessionId, tokenData] of this.tokens.entries()) {
      if (now > tokenData.expires) {
        this.tokens.delete(sessionId);
      }
    }
  }

  revokeToken(sessionId: string): void {
    this.tokens.delete(sessionId);
    logEnhancedSecurityEvent('CSRF_TOKEN_REVOKED', { sessionId });
  }
}

export const csrfTokenManager = CSRFTokenManager.getInstance();

// CSRF Protection Hook
export const useCSRFProtection = () => {
  const generateCSRFToken = (): string => {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const token = csrfTokenManager.generateToken(sessionId);
    
    // Store session ID for validation
    sessionStorage.setItem('csrf_session_id', sessionId);
    
    return token;
  };

  const validateCSRFToken = (token: string): boolean => {
    const sessionId = sessionStorage.getItem('csrf_session_id');
    if (!sessionId) {
      logEnhancedSecurityEvent('CSRF_SESSION_ID_MISSING', {});
      return false;
    }

    return csrfTokenManager.validateToken(sessionId, token);
  };

  return { generateCSRFToken, validateCSRFToken };
};

// CSRF Protected Form Component
interface CSRFProtectedProps {
  csrfToken?: string;
}

export const withCSRFProtection = <P extends object>(
  FormComponent: React.ComponentType<P & CSRFProtectedProps>
): React.ComponentType<P> => {
  return (props: P) => {
    const { generateCSRFToken } = useCSRFProtection();
    const [csrfToken] = React.useState(() => generateCSRFToken());

    return React.createElement(
      React.Fragment,
      null,
      React.createElement('input', {
        type: 'hidden',
        name: 'csrf_token',
        value: csrfToken
      }),
      React.createElement(FormComponent, { ...props, csrfToken })
    );
  };
};
