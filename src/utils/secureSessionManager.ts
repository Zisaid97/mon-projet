import { logSecurityEvent } from "@/utils/validation";

export class SecureSessionManager {
  private static instance: SecureSessionManager;
  private timeoutId: number | null = null;
  private warningTimeoutId: number | null = null;
  private readonly TIMEOUT_DURATION = 30 * 60 * 1000; // 30 minutes
  private readonly WARNING_DURATION = 5 * 60 * 1000; // 5 minutes before timeout
  private lastActivity: number = Date.now();
  private userId: string | null = null;

  static getInstance(): SecureSessionManager {
    if (!SecureSessionManager.instance) {
      SecureSessionManager.instance = new SecureSessionManager();
    }
    return SecureSessionManager.instance;
  }

  setUserId(userId: string | null): void {
    this.userId = userId;
  }

  startSessionTimeout(onTimeout: () => void, onWarning?: () => void): void {
    this.clearAllTimeouts();
    this.lastActivity = Date.now();
    
    // Set warning timer
    if (onWarning) {
      this.warningTimeoutId = window.setTimeout(() => {
        logSecurityEvent('SESSION_TIMEOUT_WARNING', {
          remaining_time: this.WARNING_DURATION
        }, this.userId || undefined);
        onWarning();
      }, this.TIMEOUT_DURATION - this.WARNING_DURATION);
    }

    // Set timeout timer
    this.timeoutId = window.setTimeout(() => {
      logSecurityEvent('SESSION_TIMEOUT', {
        inactive_duration: Date.now() - this.lastActivity
      }, this.userId || undefined);
      onTimeout();
    }, this.TIMEOUT_DURATION);
  }

  resetSessionTimeout(onTimeout: () => void, onWarning?: () => void): void {
    this.lastActivity = Date.now();
    this.startSessionTimeout(onTimeout, onWarning);
  }

  clearAllTimeouts(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    if (this.warningTimeoutId) {
      clearTimeout(this.warningTimeoutId);
      this.warningTimeoutId = null;
    }
  }

  extendSession(onTimeout: () => void, onWarning?: () => void): void {
    this.resetSessionTimeout(onTimeout, onWarning);
  }

  trackActivity(): void {
    this.lastActivity = Date.now();
  }

  getLastActivity(): number {
    return this.lastActivity;
  }

  getTimeUntilTimeout(): number {
    const elapsed = Date.now() - this.lastActivity;
    return Math.max(0, this.TIMEOUT_DURATION - elapsed);
  }

  isSessionExpired(): boolean {
    return this.getTimeUntilTimeout() === 0;
  }
}

// Activity tracker for user interactions
export const trackUserActivity = (): void => {
  const sessionManager = SecureSessionManager.getInstance();
  sessionManager.trackActivity();
};

// Setup activity listeners
export const setupActivityTracking = (): (() => void) => {
  const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
  
  const handleActivity = () => {
    trackUserActivity();
  };

  events.forEach(event => {
    document.addEventListener(event, handleActivity, { passive: true });
  });

  // Return cleanup function
  return () => {
    events.forEach(event => {
      document.removeEventListener(event, handleActivity);
    });
  };
};
