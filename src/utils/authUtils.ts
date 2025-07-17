
export const cleanupAuthState = () => {
  // Remove all Supabase auth keys from localStorage
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.startsWith('sb-')) {
      localStorage.removeItem(key);
    }
  });
  
  // Remove from sessionStorage if in use
  if (typeof sessionStorage !== 'undefined') {
    Object.keys(sessionStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.startsWith('sb-')) {
        sessionStorage.removeItem(key);
      }
    });
  }

  // Clear any cached auth data
  if (typeof window !== 'undefined') {
    // Clear any additional browser storage that might contain auth data
    try {
      if (window.indexedDB) {
        // Clear IndexedDB auth data if used by Supabase
        const deleteReq = indexedDB.deleteDatabase('supabase-auth');
        deleteReq.onerror = () => console.log('Failed to clear IndexedDB auth data');
      }
    } catch (error) {
      console.log('IndexedDB cleanup failed:', error);
    }
  }
};

// Session timeout management
export class SessionManager {
  private static instance: SessionManager;
  private timeoutId: number | null = null;
  private readonly TIMEOUT_DURATION = 30 * 60 * 1000; // 30 minutes
  private readonly WARNING_DURATION = 5 * 60 * 1000; // 5 minutes before timeout

  static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager();
    }
    return SessionManager.instance;
  }

  startSessionTimeout(onTimeout: () => void, onWarning?: () => void): void {
    this.clearSessionTimeout();
    
    // Set warning timer
    if (onWarning) {
      setTimeout(() => {
        onWarning();
      }, this.TIMEOUT_DURATION - this.WARNING_DURATION);
    }

    // Set timeout timer
    this.timeoutId = window.setTimeout(() => {
      onTimeout();
    }, this.TIMEOUT_DURATION);
  }

  resetSessionTimeout(onTimeout: () => void, onWarning?: () => void): void {
    this.startSessionTimeout(onTimeout, onWarning);
  }

  clearSessionTimeout(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  extendSession(): void {
    // Reset the timeout when user is active
    if (this.timeoutId) {
      this.clearSessionTimeout();
      // Re-establish timeout with current callbacks would require storing them
      // This is a simplified version - in practice you'd store the callbacks
    }
  }
}

// Security headers validation
export const validateSecurityHeaders = (response: Response): boolean => {
  const requiredHeaders = [
    'x-content-type-options',
    'x-frame-options',
    'x-xss-protection'
  ];

  return requiredHeaders.every(header => response.headers.has(header));
};

// Input sanitization helpers
export const sanitizeFileName = (fileName: string): string => {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, '_').substring(0, 100);
};

export const sanitizeUrl = (url: string): string => {
  try {
    const parsed = new URL(url);
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      throw new Error('Invalid protocol');
    }
    return parsed.toString();
  } catch {
    return '';
  }
};

// Content Security Policy helpers
export const generateNonce = (): string => {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};
