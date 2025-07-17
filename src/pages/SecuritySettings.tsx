
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SecurityMonitoring } from '@/components/security/SecurityMonitoring';
import { SecurityAuditLog } from '@/components/security/SecurityAuditLog';
import { Shield, Activity, FileText, Settings } from 'lucide-react';

export default function SecuritySettings() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center space-x-3 mb-6">
        <Shield className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Centre de Sécurité</h1>
      </div>

      <Tabs defaultValue="monitoring" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="monitoring" className="flex items-center space-x-2">
            <Activity className="h-4 w-4" />
            <span>Monitoring</span>
          </TabsTrigger>
          <TabsTrigger value="audit" className="flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span>Audit</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>Paramètres</span>
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center space-x-2">
            <Shield className="h-4 w-4" />
            <span>Rapports</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="monitoring">
          <SecurityMonitoring />
        </TabsContent>

        <TabsContent value="audit">
          <SecurityAuditLog />
        </TabsContent>

        <TabsContent value="settings">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Paramètres de Sécurité</CardTitle>
                <CardDescription>
                  Configurez les paramètres de sécurité de votre application
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-sm text-gray-600">
                    Les paramètres de sécurité sont automatiquement configurés et optimisés.
                    Consultez les autres onglets pour le monitoring et l'audit.
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Rapports de Sécurité</CardTitle>
              <CardDescription>
                Rapports automatiques et analyses de sécurité
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-gray-600">
                Les rapports de sécurité automatiques seront disponibles prochainement.
                En attendant, utilisez le monitoring en temps réel et les logs d'audit.
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
