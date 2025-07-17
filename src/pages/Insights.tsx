
import React from 'react';
import { AIInsights } from '@/components/insights/AIInsights';
import { RequireAuth } from '@/components/RequireAuth';

export default function InsightsPage() {
  return (
    <RequireAuth>
      <div className="container mx-auto px-4 py-8">
        <AIInsights />
      </div>
    </RequireAuth>
  );
}
