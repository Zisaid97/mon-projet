
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MetaAdsConfigForm from './MetaAdsConfigForm';
import MetaAdsConnectButton from './MetaAdsConnectButton';

export const ConfigurationSection: React.FC = () => {
  return (
    <Tabs defaultValue="config" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="config">📋 Configuration</TabsTrigger>
        <TabsTrigger value="connect">🔗 Connexion</TabsTrigger>
      </TabsList>
      
      <TabsContent value="config" className="space-y-4">
        <MetaAdsConfigForm />
      </TabsContent>
      
      <TabsContent value="connect" className="space-y-4">
        <div className="max-w-md mx-auto">
          <MetaAdsConnectButton />
        </div>
      </TabsContent>
    </Tabs>
  );
};
