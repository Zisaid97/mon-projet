
// Security Headers Configuration
export const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
};

// Content Security Policy
export const generateCSP = (nonce: string): string => {
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' https://unpkg.com`,
    `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
    "font-src 'self' https://fonts.gstatic.com",
    `img-src 'self' data: https:`,
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join('; ');
};

// Security Headers Validation
export const validateSecurityHeaders = async (url: string): Promise<{
  valid: boolean;
  issues: string[];
  recommendations: string[];
}> => {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    const issues: string[] = [];
    const recommendations: string[] = [];

    // Check required headers
    Object.entries(SECURITY_HEADERS).forEach(([header, expectedValue]) => {
      const actualValue = response.headers.get(header);
      if (!actualValue) {
        issues.push(`Missing header: ${header}`);
      } else if (actualValue !== expectedValue) {
        recommendations.push(`${header} could be strengthened`);
      }
    });

    // Check CSP
    const csp = response.headers.get('Content-Security-Policy');
    if (!csp) {
      issues.push('Missing Content-Security-Policy header');
    }

    return {
      valid: issues.length === 0,
      issues,
      recommendations
    };
  } catch (error) {
    return {
      valid: false,
      issues: ['Failed to validate security headers'],
      recommendations: ['Ensure the server is accessible and configured properly']
    };
  }
};

// Origin Validation
export const validateOrigin = (allowedOrigins: string[]) => {
  return (origin: string): boolean => {
    if (!origin) return false;
    
    try {
      const url = new URL(origin);
      return allowedOrigins.some(allowed => {
        if (allowed === '*') return true;
        if (allowed.startsWith('*.')) {
          const domain = allowed.slice(2);
          return url.hostname.endsWith(domain);
        }
        return url.origin === allowed;
      });
    } catch {
      return false;
    }
  };
};
