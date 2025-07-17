
import React, { useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { sanitizeInput } from '@/utils/validation/sanitizers';
import { logSecurityEvent } from '@/utils/security/securityLogger';
import { useAuth } from '@/hooks/useAuth';

interface SecureInputProps extends React.ComponentProps<typeof Input> {
  onSecureChange?: (value: string) => void;
  maxLength?: number;
  allowedPattern?: RegExp;
  sanitize?: boolean;
}

export function SecureInput({ 
  onSecureChange, 
  maxLength = 1000, 
  allowedPattern,
  sanitize = true,
  onChange,
  ...props 
}: SecureInputProps) {
  const { user } = useAuth();
  const [lastValue, setLastValue] = useState('');

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    
    // Length validation
    if (value.length > maxLength) {
      logSecurityEvent({
        event_type: 'INPUT_LENGTH_EXCEEDED',
        severity: 'medium',
        description: 'Input length exceeded maximum allowed',
        user_id: user?.id,
        additional_data: {
          attempted_length: value.length,
          max_length: maxLength,
          field: props.name || 'unknown'
        }
      });
      value = value.substring(0, maxLength);
    }

    // Pattern validation
    if (allowedPattern && !allowedPattern.test(value)) {
      logSecurityEvent({
        event_type: 'INVALID_INPUT_PATTERN',
        severity: 'medium',
        description: 'Input failed pattern validation',
        user_id: user?.id,
        additional_data: {
          pattern: allowedPattern.source,
          field: props.name || 'unknown'
        }
      });
      return; // Don't update if pattern doesn't match
    }

    // Sanitization
    if (sanitize) {
      const originalValue = value;
      value = sanitizeInput(value);
      
      if (originalValue !== value) {
        logSecurityEvent({
          event_type: 'INPUT_SANITIZED',
          severity: 'low',
          description: 'Input was sanitized for security',
          user_id: user?.id,
          additional_data: {
            field: props.name || 'unknown',
            original_length: originalValue.length,
            sanitized_length: value.length
          }
        });
      }
    }

    // Check for potential XSS patterns
    const xssPatterns = [
      /<script[^>]*>.*?<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<iframe[^>]*>.*?<\/iframe>/gi
    ];

    const hasXssPattern = xssPatterns.some(pattern => pattern.test(value));
    if (hasXssPattern) {
      logSecurityEvent({
        event_type: 'XSS_ATTEMPT_DETECTED',
        severity: 'high',
        description: 'Potential XSS attack detected in input',
        user_id: user?.id,
        additional_data: {
          field: props.name || 'unknown',
          value: value.substring(0, 100) // Log only first 100 chars
        }
      });
      return; // Block XSS attempts
    }

    setLastValue(value);
    
    // Call original onChange if provided
    if (onChange) {
      const syntheticEvent = {
        ...e,
        target: { ...e.target, value }
      };
      onChange(syntheticEvent as React.ChangeEvent<HTMLInputElement>);
    }

    // Call secure change handler
    if (onSecureChange) {
      onSecureChange(value);
    }
  }, [maxLength, allowedPattern, sanitize, onChange, onSecureChange, props.name, user?.id]);

  return (
    <Input 
      {...props} 
      onChange={handleChange}
      maxLength={maxLength}
    />
  );
}
