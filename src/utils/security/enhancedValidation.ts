
import { z } from 'zod';
import { sanitizeInput, logSecurityEvent } from '@/utils/validation';
import { contextualSanitize } from '@/utils/enhancedAuthUtils';

// Enhanced file upload validation
export const validateFileUpload = (file: File): {
  valid: boolean;
  errors: string[];
  sanitizedName: string;
} => {
  const errors: string[] = [];
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];

  // File size validation
  if (file.size > maxSize) {
    errors.push('File size exceeds 10MB limit');
  }

  // File type validation
  if (!allowedTypes.includes(file.type)) {
    errors.push('File type not allowed');
  }

  // File name validation and sanitization
  const sanitizedName = contextualSanitize(file.name, 'filename');
  if (sanitizedName !== file.name) {
    logSecurityEvent('FILE_NAME_SANITIZED', {
      original: file.name,
      sanitized: sanitizedName
    });
  }

  // Check for potentially dangerous file extensions
  const dangerousExtensions = ['.exe', '.bat', '.cmd', '.scr', '.pif', '.jar'];
  const fileExtension = sanitizedName.toLowerCase().split('.').pop();
  if (fileExtension && dangerousExtensions.some(ext => ext.includes(fileExtension))) {
    errors.push('Dangerous file extension detected');
  }

  return {
    valid: errors.length === 0,
    errors,
    sanitizedName
  };
};

// Enhanced data integrity validation
export const validateDataIntegrity = <T>(
  data: T,
  expectedChecksum?: string
): { valid: boolean; checksum: string } => {
  const dataString = JSON.stringify(data);
  const checksum = btoa(dataString).slice(0, 16); // Simple checksum

  return {
    valid: !expectedChecksum || checksum === expectedChecksum,
    checksum
  };
};

// SQL injection pattern detection
export const detectSQLInjection = (input: string): boolean => {
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION|SCRIPT)\b)/gi,
    /(--|#|\/\*|\*\/)/g,
    /(\b(OR|AND)\s+\d+\s*=\s*\d+)/gi,
    /'(\s*OR\s*\d+\s*=\s*\d+|UNION|SELECT)/gi,
    /(\bxp_cmdshell\b|\bsp_executesql\b)/gi
  ];

  return sqlPatterns.some(pattern => pattern.test(input));
};

// XSS pattern detection (enhanced)  
export const detectXSSPayload = (input: string): boolean => {
  const xssPatterns = [
    /<script[^>]*>.*?<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe[^>]*>.*?<\/iframe>/gi,
    /vbscript:/gi,
    /data:text\/html/gi,
    /<object[^>]*>.*?<\/object>/gi,
    /<embed[^>]*>/gi,
    /<link[^>]*stylesheet[^>]*>/gi,
    /<meta[^>]*http-equiv[^>]*>/gi
  ];

  return xssPatterns.some(pattern => pattern.test(input));
};

// Comprehensive input validation
export const validateInput = (
  input: string,
  context: 'general' | 'email' | 'url' | 'filename' | 'sql' = 'general',
  userId?: string
): {
  valid: boolean;
  sanitized: string;
  threats: string[];
} => {
  const threats: string[] = [];
  
  // Check for SQL injection
  if (detectSQLInjection(input)) {
    threats.push('SQL_INJECTION_ATTEMPT');
    logSecurityEvent('SQL_INJECTION_ATTEMPT', { input: input.substring(0, 100) }, userId);
  }

  // Check for XSS
  if (detectXSSPayload(input)) {
    threats.push('XSS_ATTEMPT');
    logSecurityEvent('XSS_ATTEMPT_DETECTED', { input: input.substring(0, 100) }, userId);
  }

  // Sanitize based on context - map email to html for contextualSanitize
  const sanitizeContext = context === 'email' ? 'html' : context;
  const sanitized = contextualSanitize(input, sanitizeContext);

  return {
    valid: threats.length === 0,
    sanitized,
    threats
  };
};

// Rate limiting with enhanced tracking
const rateLimitStore = new Map<string, { count: number; resetTime: number; blocked: boolean }>();

export const enhancedRateLimit = (
  identifier: string,
  limit: number = 100,
  windowMs: number = 60000,
  blockDuration: number = 300000 // 5 minutes block
): { allowed: boolean; remaining: number; resetTime: number; blocked: boolean } => {
  const now = Date.now();
  const current = rateLimitStore.get(identifier);

  if (!current || now > current.resetTime) {
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + windowMs,
      blocked: false
    });
    return { allowed: true, remaining: limit - 1, resetTime: now + windowMs, blocked: false };
  }

  // Check if currently blocked
  if (current.blocked && now < current.resetTime) {
    return { allowed: false, remaining: 0, resetTime: current.resetTime, blocked: true };
  }

  current.count++;

  if (current.count > limit) {
    // Block the identifier
    current.blocked = true;
    current.resetTime = now + blockDuration;
    
    logSecurityEvent('RATE_LIMIT_EXCEEDED_BLOCKED', {
      identifier,
      count: current.count,
      limit
    });

    return { allowed: false, remaining: 0, resetTime: current.resetTime, blocked: true };
  }

  return {
    allowed: true,
    remaining: limit - current.count,
    resetTime: current.resetTime,
    blocked: false
  };
};
