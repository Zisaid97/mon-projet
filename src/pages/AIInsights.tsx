
import React from 'react';
import { Header } from "@/components/layout/Header";
import { AIInsightsPage } from "@/components/ai/AIInsightsPage";
import { RequireAuth } from "@/components/RequireAuth";

export default function AIInsights() {
  return (
    <RequireAuth>
      <div className="bg-background min-h-screen transition-colors">
        <Header />
        <main className="max-w-6xl mx-auto px-6 py-8">
          <AIInsightsPage />
        </main>
      </div>
    </RequireAuth>
  );
}
