import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Plug, Play, Pause, RefreshCw, ExternalLink, Activity, AlertCircle } from 'lucide-react';

interface Integration {
  id: string;
  name: string;
  description: string;
  category: string;
  auth_type: string;
  status: 'available' | 'installed';
}

interface UserIntegration {
  id: string;
  integration_id: string;
  active: boolean;
  sync_status: string;
  last_sync_at: string | null;
  installed_at: string;
}

interface IntegrationStats {
  totalIntegrations: number;
  activeIntegrations: number;
  failedSyncs: number;
  lastSyncTime: string | null;
}

export const IntegrationServiceManager: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [userIntegrations, setUserIntegrations] = useState<UserIntegration[]>([]);
  const [stats, setStats] = useState<IntegrationStats>({
    totalIntegrations: 0,
    activeIntegrations: 0,
    failedSyncs: 0,
    lastSyncTime: null
  });

  useEffect(() => {
    fetchIntegrationsData();
  }, []);

  const fetchIntegrationsData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('integration-service', {
        body: { action: 'get_integrations_overview' }
      });

      if (error) throw error;

      if (data.success) {
        setIntegrations(data.data.availableIntegrations || []);
        setUserIntegrations(data.data.userIntegrations || []);
        setStats(data.data.stats || {
          totalIntegrations: 0,
          activeIntegrations: 0,
          failedSyncs: 0,
          lastSyncTime: null
        });
      } else {
        throw new Error(data.error || 'Failed to fetch integrations');
      }
    } catch (error) {
      console.error('Error fetching integrations:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les intégrations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInstallIntegration = async (integrationId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('integration-service', {
        body: {
          action: 'install_integration',
          integration_id: integrationId
        }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Intégration installée",
          description: "L'intégration a été installée avec succès",
        });
        fetchIntegrationsData();
      } else {
        throw new Error(data.error || 'Failed to install integration');
      }
    } catch (error) {
      console.error('Error installing integration:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'installer l'intégration",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleIntegration = async (integrationId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('integration-service', {
        body: {
          action: 'toggle_integration',
          integration_id: integrationId
        }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Intégration mise à jour",
          description: "Le statut de l'intégration a été modifié",
        });
        fetchIntegrationsData();
      } else {
        throw new Error(data.error || 'Failed to toggle integration');
      }
    } catch (error) {
      console.error('Error toggling integration:', error);
      toast({
        title: "Erreur",
        description: "Impossible de modifier l'intégration",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSyncIntegration = async (integrationId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('integration-service', {
        body: {
          action: 'sync_integration',
          integration_id: integrationId
        }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Synchronisation lancée",
          description: "La synchronisation a été démarrée",
        });
        fetchIntegrationsData();
      } else {
        throw new Error(data.error || 'Failed to sync integration');
      }
    } catch (error) {
      console.error('Error syncing integration:', error);
      toast({
        title: "Erreur",
        description: "Impossible de synchroniser l'intégration",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      advertising: 'bg-blue-100 text-blue-800',
      analytics: 'bg-green-100 text-green-800',
      ecommerce: 'bg-purple-100 text-purple-800',
      crm: 'bg-orange-100 text-orange-800',
      email_marketing: 'bg-pink-100 text-pink-800'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status: string) => {
    const colors = {
      available: 'bg-gray-100 text-gray-800',
      installed: 'bg-green-100 text-green-800',
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Intégrations</CardTitle>
            <Plug className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalIntegrations}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Intégrations Actives</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeIntegrations}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Échecs de Sync</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.failedSyncs}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dernière Sync</CardTitle>
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              {stats.lastSyncTime 
                ? new Date(stats.lastSyncTime).toLocaleDateString()
                : 'Jamais'
              }
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Installed Integrations */}
      <Card>
        <CardHeader>
          <CardTitle>Intégrations Installées</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {userIntegrations.map((userIntegration) => {
              const integration = integrations.find(i => i.id === userIntegration.integration_id);
              if (!integration) return null;

              return (
                <div key={userIntegration.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div>
                      <h3 className="font-medium">{integration.name}</h3>
                      <p className="text-sm text-muted-foreground">{integration.description}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <Badge className={getCategoryColor(integration.category)}>
                          {integration.category}
                        </Badge>
                        <Badge className={getStatusColor(userIntegration.active ? 'active' : 'inactive')}>
                          {userIntegration.active ? 'Actif' : 'Inactif'}
                        </Badge>
                        <Badge variant="outline">{userIntegration.sync_status}</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleIntegration(userIntegration.integration_id)}
                      disabled={loading}
                    >
                      {userIntegration.active ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      {userIntegration.active ? 'Désactiver' : 'Activer'}
                    </Button>
                    {userIntegration.active && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSyncIntegration(userIntegration.integration_id)}
                        disabled={loading}
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Sync
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
            {userIntegrations.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                Aucune intégration installée
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Available Integrations */}
      <Card>
        <CardHeader>
          <CardTitle>Marketplace des Intégrations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {integrations
              .filter(integration => integration.status === 'available')
              .map((integration) => (
                <div key={integration.id} className="p-4 border rounded-lg space-y-3">
                  <div>
                    <h3 className="font-medium">{integration.name}</h3>
                    <p className="text-sm text-muted-foreground">{integration.description}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge className={getCategoryColor(integration.category)}>
                      {integration.category}
                    </Badge>
                    <Button
                      size="sm"
                      onClick={() => handleInstallIntegration(integration.id)}
                      disabled={loading}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Installer
                    </Button>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
