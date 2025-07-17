
import DOMPurify from 'dompurify';

// Enhanced HTML sanitization with stricter rules
export const sanitizeHtml = (input: string): string => {
  if (typeof window !== 'undefined' && DOMPurify) {
    return DOMPurify.sanitize(input, { 
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: [],
      KEEP_CONTENT: false,
      FORBID_TAGS: ['script', 'object', 'embed', 'form', 'input', 'textarea', 'button'],
      FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur']
    });
  }
  // Enhanced fallback for server-side
  return input
    .replace(/<[^>]*>/g, '') // Remove all HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocols
    .replace(/data:/gi, '') // Remove data: protocols
    .replace(/vbscript:/gi, '') // Remove vbscript: protocols
    .replace(/on\w+\s*=/gi, ''); // Remove event handlers
};

// Enhanced input sanitization with comprehensive protection
export const sanitizeInput = (input: string): string => {
  if (!input || typeof input !== 'string') return '';
  
  return input
    .trim()
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
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Remove control characters
    .substring(0, 1000); // Limit length to prevent DoS
};

// File name sanitization
export const sanitizeFileName = (fileName: string): string => {
  return fileName
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_{2,}/g, '_')
    .substring(0, 100)
    .replace(/^[._]/, '') // Remove leading dots/underscores
    .replace(/[._]$/, ''); // Remove trailing dots/underscores
};

// Content Security Policy nonce generator
export const generateNonce = (): string => {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }
  // Fallback for older browsers
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};
