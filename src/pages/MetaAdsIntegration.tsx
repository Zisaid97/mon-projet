
import React from 'react';
import { MetaAdsIntegration } from '@/components/meta-ads/MetaAdsIntegration';
import { RequireAuth } from '@/components/RequireAuth';

export default function MetaAdsIntegrationPage() {
  return (
    <RequireAuth>
      <div className="container mx-auto px-4 py-8">
        <MetaAdsIntegration />
      </div>
    </RequireAuth>
  );
}
