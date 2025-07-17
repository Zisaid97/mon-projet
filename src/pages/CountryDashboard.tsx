
import React from 'react';
import { CountryDashboard } from '@/components/country/CountryDashboard';
import { RequireAuth } from '@/components/RequireAuth';

export default function CountryDashboardPage() {
  return (
    <RequireAuth>
      <div className="container mx-auto px-4 py-8">
        <CountryDashboard />
      </div>
    </RequireAuth>
  );
}
