
// Security event logging helper
export const logSecurityEvent = async (
  eventType: string,
  details: any,
  userId?: string
) => {
  try {
    const eventData = {
      event_type: eventType,
      event_details: details,
      user_id: userId,
      timestamp: new Date().toISOString(),
      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown'
    };
    
    // In a real implementation, this would send to your logging service
    console.warn('[SECURITY EVENT]', eventData);
  } catch (error) {
    console.error('Failed to log security event:', error);
  }
};
