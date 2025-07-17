import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AuthServiceManager } from './AuthServiceManager';
import { BillingServiceManager } from './BillingServiceManager';
import { NotificationServiceManager } from './NotificationServiceManager';
import { IntegrationServiceManager } from './IntegrationServiceManager';
import { Shield, CreditCard, Bell, Plug } from 'lucide-react';

export const MicroservicesHub: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Hub Microservices</h1>
        <p className="text-muted-foreground">
          Gérez vos services backend centralisés - Authentification, Facturation, Notifications et Intégrations
        </p>
      </div>

      <Tabs defaultValue="auth" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="auth" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Authentification
          </TabsTrigger>
          <TabsTrigger value="billing" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Facturation
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="integrations" className="flex items-center gap-2">
            <Plug className="h-4 w-4" />
            Intégrations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="auth">
          <AuthServiceManager />
        </TabsContent>

        <TabsContent value="billing">
          <BillingServiceManager />
        </TabsContent>

        <TabsContent value="notifications">
          <NotificationServiceManager />
        </TabsContent>

        <TabsContent value="integrations">
          <IntegrationServiceManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};