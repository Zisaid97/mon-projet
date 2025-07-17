import React from 'react';
import { generateNonce } from '@/utils/validation/sanitizers';
import { logSecurityEvent } from '@/utils/security/securityLogger';

interface CSRFToken {
  token: string;
  timestamp: number;
  used: boolean;
}

class CSRFProtection {
  private tokens = new Map<string, CSRFToken>();
  private readonly TOKEN_LIFETIME = 30 * 60 * 1000; // 30 minutes
  private readonly MAX_TOKENS_PER_SESSION = 10;

  generateToken(sessionId?: string): string {
    const token = generateNonce();
    const id = sessionId || 'anonymous';
    
    // Clean up old tokens for this session
    this.cleanupTokens(id);
    
    this.tokens.set(token, {
      token,
      timestamp: Date.now(),
      used: false,
    });

    // Limit tokens per session
    const sessionTokens = Array.from(this.tokens.entries())
      .filter(([_, tokenData]) => Date.now() - tokenData.timestamp < this.TOKEN_LIFETIME)
      .slice(-this.MAX_TOKENS_PER_SESSION);
    
    this.tokens.clear();
    sessionTokens.forEach(([tokenKey, tokenData]) => {
      this.tokens.set(tokenKey, tokenData);
    });

    return token;
  }

  validateToken(token: string, userId?: string): boolean {
    const tokenData = this.tokens.get(token);
    
    if (!tokenData) {
      logSecurityEvent({
        event_type: 'CSRF_TOKEN_NOT_FOUND',
        severity: 'high',
        description: 'CSRF token validation failed - token not found',
        user_id: userId,
        additional_data: { token: token.substring(0, 8) + '...' },
      });
      return false;
    }

    if (tokenData.used) {
      logSecurityEvent({
        event_type: 'CSRF_TOKEN_REUSE',
        severity: 'high',
        description: 'CSRF token reuse attempt detected',
        user_id: userId,
        additional_data: { token: token.substring(0, 8) + '...' },
      });
      return false;
    }

    if (Date.now() - tokenData.timestamp > this.TOKEN_LIFETIME) {
      logSecurityEvent({
        event_type: 'CSRF_TOKEN_EXPIRED',
        severity: 'medium',
        description: 'Expired CSRF token used',
        user_id: userId,
        additional_data: { token: token.substring(0, 8) + '...' },
      });
      this.tokens.delete(token);
      return false;
    }

    // Mark token as used
    tokenData.used = true;
    
    // Remove token after use (one-time use)
    setTimeout(() => this.tokens.delete(token), 1000);

    return true;
  }

  private cleanupTokens(sessionId: string): void {
    const now = Date.now();
    const tokensToDelete: string[] = [];

    for (const [token, tokenData] of this.tokens.entries()) {
      if (now - tokenData.timestamp > this.TOKEN_LIFETIME) {
        tokensToDelete.push(token);
      }
    }

    tokensToDelete.forEach(token => this.tokens.delete(token));
  }

  getTokenCount(): number {
    return this.tokens.size;
  }

  clearAllTokens(): void {
    this.tokens.clear();
  }
}

export const csrfProtection = new CSRFProtection();

// React hook for CSRF protection
export function useCSRFToken(sessionId?: string) {
  const [token, setToken] = React.useState<string>('');

  React.useEffect(() => {
    const newToken = csrfProtection.generateToken(sessionId);
    setToken(newToken);
  }, [sessionId]);

  const refreshToken = () => {
    const newToken = csrfProtection.generateToken(sessionId);
    setToken(newToken);
  };

  const validateToken = (tokenToValidate: string, userId?: string) => {
    return csrfProtection.validateToken(tokenToValidate, userId);
  };

  return {
    token,
    refreshToken,
    validateToken,
  };
}

// CSRF protection middleware for forms
export function withCSRFProtection<T extends object>(
  formData: T,
  csrfToken: string,
  userId?: string
): T & { _csrf: string } {
  if (!csrfProtection.validateToken(csrfToken, userId)) {
    throw new Error('CSRF validation failed');
  }
  
  return {
    ...formData,
    _csrf: csrfToken,
  };
}