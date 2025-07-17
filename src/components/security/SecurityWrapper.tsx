import React from 'react';
import { SecurityProvider } from '@/components/security/SecurityContext';
import { SecurityValidator } from '@/components/security/SecurityValidator';

interface SecurityWrapperProps {
  children: React.ReactNode;
}

export function SecurityWrapper({ children }: SecurityWrapperProps) {
  return (
    <SecurityProvider>
      <SecurityValidator>
        {children}
      </SecurityValidator>
    </SecurityProvider>
  );
}