
import React from 'react';
import { Facebook } from "lucide-react";
import { useMetaSpendData } from "@/hooks/useMetaAdsIntegration";
import { useMetaAdsConfig } from "@/hooks/useMetaAdsConfig";
import { ConfigurationSection } from './ConfigurationSection';
import { StatusSection } from './StatusSection';
import { DataSection } from './DataSection';

export function MetaAdsIntegration() {
  const { config: metaConfig } = useMetaAdsConfig();
  const { data: spendData } = useMetaSpendData();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Facebook className="h-8 w-8 text-blue-600" />
        <h1 className="text-2xl font-bold">Meta Ads - Synchronisation Automatique</h1>
      </div>

      <ConfigurationSection />
      <StatusSection hasConfig={!!metaConfig} />
      <DataSection spendData={spendData} />
    </div>
  );
}
