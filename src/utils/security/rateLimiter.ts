import { logSecurityEvent } from './securityLogger';

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  blockDurationMs: number;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
  blocked: boolean;
  blockUntil?: number;
}

class RateLimiter {
  private store = new Map<string, RateLimitEntry>();
  private defaultConfig: RateLimitConfig = {
    windowMs: 60000, // 1 minute
    maxRequests: 100,
    blockDurationMs: 300000, // 5 minutes
  };

  check(
    identifier: string, 
    config: Partial<RateLimitConfig> = {}
  ): { allowed: boolean; remaining: number; resetTime: number; blocked: boolean } {
    const finalConfig = { ...this.defaultConfig, ...config };
    const now = Date.now();
    const current = this.store.get(identifier);

    // Check if currently blocked
    if (current?.blocked && current.blockUntil && now < current.blockUntil) {
      return { 
        allowed: false, 
        remaining: 0, 
        resetTime: current.blockUntil, 
        blocked: true 
      };
    }

    // Reset window if expired or first request
    if (!current || now > current.resetTime) {
      this.store.set(identifier, {
        count: 1,
        resetTime: now + finalConfig.windowMs,
        blocked: false,
      });
      return { 
        allowed: true, 
        remaining: finalConfig.maxRequests - 1, 
        resetTime: now + finalConfig.windowMs, 
        blocked: false 
      };
    }

    // Increment count
    current.count++;

    // Check if limit exceeded
    if (current.count > finalConfig.maxRequests) {
      // Block the identifier
      current.blocked = true;
      current.blockUntil = now + finalConfig.blockDurationMs;
      
      // Log security event
      logSecurityEvent({
        event_type: 'RATE_LIMIT_EXCEEDED',
        severity: 'medium',
        description: `Rate limit exceeded for identifier: ${identifier}`,
        additional_data: {
          identifier,
          count: current.count,
          limit: finalConfig.maxRequests,
          blockDuration: finalConfig.blockDurationMs,
        },
      });

      return { 
        allowed: false, 
        remaining: 0, 
        resetTime: current.blockUntil, 
        blocked: true 
      };
    }

    return {
      allowed: true,
      remaining: finalConfig.maxRequests - current.count,
      resetTime: current.resetTime,
      blocked: false,
    };
  }

  reset(identifier: string): void {
    this.store.delete(identifier);
  }

  getStatus(identifier: string): RateLimitEntry | null {
    return this.store.get(identifier) || null;
  }
}

export const rateLimiter = new RateLimiter();

// Pre-configured rate limiters for common use cases
export const loginRateLimit = (identifier: string) => 
  rateLimiter.check(identifier, { 
    windowMs: 900000, // 15 minutes
    maxRequests: 5, 
    blockDurationMs: 1800000 // 30 minutes
  });

export const apiRateLimit = (identifier: string) => 
  rateLimiter.check(identifier, { 
    windowMs: 60000, // 1 minute
    maxRequests: 60,
    blockDurationMs: 300000 // 5 minutes
  });

export const fileUploadRateLimit = (identifier: string) => 
  rateLimiter.check(identifier, { 
    windowMs: 300000, // 5 minutes
    maxRequests: 10,
    blockDurationMs: 900000 // 15 minutes
  });