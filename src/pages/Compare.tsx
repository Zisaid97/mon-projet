
import React from 'react';
import { ComparativeAnalysis } from '@/components/comparative/ComparativeAnalysis';
import { RequireAuth } from '@/components/RequireAuth';

export default function Compare() {
  return (
    <RequireAuth>
      <div className="container mx-auto px-4 py-8">
        <ComparativeAnalysis />
      </div>
    </RequireAuth>
  );
}
