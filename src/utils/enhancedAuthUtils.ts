import { logSecurityEvent } from "@/utils/validation";

// Enhanced auth state cleanup with comprehensive storage clearing
export const comprehensiveAuthCleanup = async (userId?: string) => {
  try {
    // Log cleanup attempt
    await logSecurityEvent('AUTH_CLEANUP_INITIATED', {}, userId);

    // Remove all Supabase auth keys from localStorage
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || 
          key.startsWith('sb-') || 
          key.includes('auth') ||
          key.includes('session') ||
          key.includes('token')) {
        localStorage.removeItem(key);
      }
    });
    
    // Remove from sessionStorage if in use
    if (typeof sessionStorage !== 'undefined') {
      Object.keys(sessionStorage).forEach((key) => {
        if (key.startsWith('supabase.auth.') || 
            key.startsWith('sb-') ||
            key.includes('auth') ||
            key.includes('session') ||
            key.includes('token')) {
          sessionStorage.removeItem(key);
        }
      });
    }

    // Clear any cached auth data
    if (typeof window !== 'undefined') {
      try {
        if (window.indexedDB) {
          // Clear IndexedDB auth data if used by Supabase
          const deleteReq = indexedDB.deleteDatabase('supabase-auth');
          deleteReq.onerror = () => console.log('Failed to clear IndexedDB auth data');
        }
      } catch (error) {
        console.log('IndexedDB cleanup failed:', error);
      }

      // Clear any other browser storage
      try {
        if ('caches' in window) {
          caches.keys().then(cacheNames => {
            cacheNames.forEach(cacheName => {
              if (cacheName.includes('auth') || cacheName.includes('supabase')) {
                caches.delete(cacheName);
              }
            });
          });
        }
      } catch (error) {
        console.log('Cache cleanup failed:', error);
      }
    }

    await logSecurityEvent('AUTH_CLEANUP_COMPLETED', {}, userId);
  } catch (error) {
    await logSecurityEvent('AUTH_CLEANUP_FAILED', { 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, userId);
  }
};

// Security header validation with enhanced checks
export const validateSecurityHeaders = (response: Response): { 
  valid: boolean; 
  missing: string[]; 
  warnings: string[] 
} => {
  const requiredHeaders = [
    'x-content-type-options',
    'x-frame-options',
    'x-xss-protection'
  ];

  const recommendedHeaders = [
    'strict-transport-security',
    'content-security-policy',
    'referrer-policy'
  ];

  const missing = requiredHeaders.filter(header => !response.headers.has(header));
  const warnings = recommendedHeaders.filter(header => !response.headers.has(header));

  return {
    valid: missing.length === 0,
    missing,
    warnings
  };
};

// Enhanced input sanitization with context-aware cleaning
export const contextualSanitize = (input: string, context: 'filename' | 'url' | 'html' | 'sql' | 'general' = 'general'): string => {
  if (!input || typeof input !== 'string') return '';

  let sanitized = input.trim();

  switch (context) {
    case 'filename':
      sanitized = sanitized
        .replace(/[^a-zA-Z0-9._-]/g, '_')
        .replace(/_{2,}/g, '_')
        .substring(0, 100)
        .replace(/^[._]/, '')
        .replace(/[._]$/, '');
      break;

    case 'url':
      try {
        const parsed = new URL(sanitized);
        if (!['http:', 'https:'].includes(parsed.protocol)) {
          return '';
        }
        // Block potentially dangerous domains
        const blockedDomains = ['localhost', '127.0.0.1', '0.0.0.0', '10.', '192.168.'];
        if (blockedDomains.some(domain => parsed.hostname.includes(domain))) {
          return '';
        }
        sanitized = parsed.toString();
      } catch {
        return '';
      }
      break;

    case 'html':
      sanitized = sanitized
        .replace(/<script[^>]*>.*?<\/script>/gi, '')
        .replace(/<[^>]*>/g, '')
        .replace(/javascript:/gi, '')
        .replace(/data:/gi, '')
        .replace(/vbscript:/gi, '')
        .replace(/on\w+\s*=/gi, '');
      break;

    case 'sql':
      // Basic SQL injection prevention
      const sqlKeywords = [
        'SELECT', 'INSERT', 'UPDATE', 'DELETE', 'DROP', 'CREATE', 'ALTER',
        'EXEC', 'EXECUTE', 'UNION', 'DECLARE', '--', '/*', '*/', ';'
      ];
      const upperInput = sanitized.toUpperCase();
      if (sqlKeywords.some(keyword => upperInput.includes(keyword))) {
        sanitized = sanitized.replace(/['"`;]/g, '');
      }
      break;

    default:
      sanitized = sanitized
        .replace(/[<>\"'&]/g, (match) => {
          const htmlEntities: { [key: string]: string } = {
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#x27;',
            '&': '&amp;'
          };
          return htmlEntities[match] || match;
        })
        .replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
        .substring(0, 1000);
  }

  return sanitized;
};

// Content Security Policy nonce generator with enhanced entropy
export const generateSecureNonce = (): string => {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const array = new Uint8Array(32); // Increased from 16 to 32 bytes
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }
  
  // Enhanced fallback for older browsers
  const timestamp = Date.now().toString(36);
  const random1 = Math.random().toString(36).substring(2, 15);
  const random2 = Math.random().toString(36).substring(2, 15);
  const random3 = Math.random().toString(36).substring(2, 15);
  
  return `${timestamp}${random1}${random2}${random3}`;
};

// Security event aggregator for pattern detection
class SecurityEventAggregator {
  private events: Map<string, Array<{ timestamp: number; data: any }>> = new Map();
  private readonly MAX_EVENTS_PER_TYPE = 100;
  private readonly EVENT_RETENTION_MS = 24 * 60 * 60 * 1000; // 24 hours

  addEvent(eventType: string, data: any, userId?: string): void {
    const key = `${eventType}:${userId || 'anonymous'}`;
    
    if (!this.events.has(key)) {
      this.events.set(key, []);
    }
    
    const eventList = this.events.get(key)!;
    eventList.push({ timestamp: Date.now(), data });
    
    // Cleanup old events
    const cutoff = Date.now() - this.EVENT_RETENTION_MS;
    this.events.set(key, eventList
      .filter(event => event.timestamp > cutoff)
      .slice(-this.MAX_EVENTS_PER_TYPE)
    );
    
    // Check for suspicious patterns
    this.detectSuspiciousPatterns(eventType, eventList, userId);
  }

  private detectSuspiciousPatterns(eventType: string, events: Array<{ timestamp: number; data: any }>, userId?: string): void {
    const recentEvents = events.filter(event => 
      Date.now() - event.timestamp < 5 * 60 * 1000 // Last 5 minutes
    );

    // Detect rapid repeated events (potential automated attack)
    if (recentEvents.length > 10) {
      logSecurityEvent('SUSPICIOUS_REPEATED_EVENTS', {
        event_type: eventType,
        count: recentEvents.length,
        time_window: '5_minutes'
      }, userId);
    }

    // Detect specific attack patterns
    if (eventType === 'XSS_ATTEMPT_DETECTED' && recentEvents.length > 3) {
      logSecurityEvent('POTENTIAL_XSS_ATTACK', {
        attempts: recentEvents.length,
        time_window: '5_minutes'
      }, userId);
    }

    if (eventType === 'RATE_LIMIT_EXCEEDED' && recentEvents.length > 5) {
      logSecurityEvent('PERSISTENT_RATE_LIMIT_VIOLATION', {
        violations: recentEvents.length,
        time_window: '5_minutes'
      }, userId);
    }
  }

  getEventSummary(userId?: string): Record<string, number> {
    const summary: Record<string, number> = {};
    
    this.events.forEach((events, key) => {
      if (!userId || key.includes(userId)) {
        const eventType = key.split(':')[0];
        summary[eventType] = (summary[eventType] || 0) + events.length;
      }
    });
    
    return summary;
  }
}

export const securityEventAggregator = new SecurityEventAggregator();

// Enhanced security event logging with pattern detection
export const logEnhancedSecurityEvent = async (
  eventType: string,
  details: any,
  userId?: string
) => {
  try {
    // Add to aggregator for pattern detection
    securityEventAggregator.addEvent(eventType, details, userId);
    
    // Log the event
    await logSecurityEvent(eventType, {
      ...details,
      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown',
      timestamp: new Date().toISOString(),
      page_url: typeof window !== 'undefined' ? window.location.href : 'Unknown'
    }, userId);
  } catch (error) {
    console.error('Failed to log enhanced security event:', error);
  }
};
