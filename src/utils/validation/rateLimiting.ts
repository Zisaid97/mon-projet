
// Enhanced rate limiting with IP-based tracking
export const createRateLimiter = (maxRequests: number, windowMs: number) => {
  const requests = new Map<string, { count: number; timestamps: number[] }>();
  
  return (identifier: string): { allowed: boolean; remainingAttempts: number } => {
    const now = Date.now();
    const userRequests = requests.get(identifier) || { count: 0, timestamps: [] };
    
    // Remove old requests outside the window
    const validTimestamps = userRequests.timestamps.filter(time => now - time < windowMs);
    
    if (validTimestamps.length >= maxRequests) {
      return { allowed: false, remainingAttempts: 0 };
    }
    
    validTimestamps.push(now);
    requests.set(identifier, { count: validTimestamps.length, timestamps: validTimestamps });
    
    return { 
      allowed: true, 
      remainingAttempts: maxRequests - validTimestamps.length 
    };
  };
};
