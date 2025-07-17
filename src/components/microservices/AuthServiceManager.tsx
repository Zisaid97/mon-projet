import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Shield, Clock, Key } from 'lucide-react';

interface RateLimitSettings {
  maxAttempts: number;
  windowMinutes: number;
  lockoutMinutes: number;
}

interface AuthSettings {
  twoFactorEnabled: boolean;
  rateLimitEnabled: boolean;
  rateLimitSettings: RateLimitSettings;
}

export const AuthServiceManager: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<AuthSettings>({
    twoFactorEnabled: false,
    rateLimitEnabled: true,
    rateLimitSettings: {
      maxAttempts: 5,
      windowMinutes: 15,
      lockoutMinutes: 30
    }
  });

  const handleUpdateSettings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('auth-service', {
        body: {
          action: 'update_settings',
          settings
        }
      });

      if (error) throw error;

      toast({
        title: "Paramètres mis à jour",
        description: "Les paramètres d'authentification ont été sauvegardés",
      });
    } catch (error) {
      console.error('Error updating auth settings:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les paramètres",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTestRateLimit = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('auth-service', {
        body: {
          action: 'test_rate_limit',
          identifier: 'test@example.com'
        }
      });

      if (error) throw error;

      toast({
        title: "Test effectué",
        description: `Rate limit status: ${data.allowed ? 'Autorisé' : 'Bloqué'}`,
      });
    } catch (error) {
      console.error('Error testing rate limit:', error);
      toast({
        title: "Erreur",
        description: "Impossible de tester le rate limiting",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Gestion de l'Authentification
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Two-Factor Authentication */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  Authentification à deux facteurs
                </Label>
                <p className="text-sm text-muted-foreground">
                  Activer 2FA pour tous les utilisateurs
                </p>
              </div>
              <Switch
                checked={settings.twoFactorEnabled}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, twoFactorEnabled: checked }))
                }
              />
            </div>
          </div>

          {/* Rate Limiting */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Rate Limiting
                </Label>
                <p className="text-sm text-muted-foreground">
                  Protection contre les attaques par force brute
                </p>
              </div>
              <Switch
                checked={settings.rateLimitEnabled}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, rateLimitEnabled: checked }))
                }
              />
            </div>

            {settings.rateLimitEnabled && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 ml-6">
                <div className="space-y-2">
                  <Label htmlFor="maxAttempts">Tentatives max</Label>
                  <Input
                    id="maxAttempts"
                    type="number"
                    value={settings.rateLimitSettings.maxAttempts}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      rateLimitSettings: {
                        ...prev.rateLimitSettings,
                        maxAttempts: parseInt(e.target.value) || 5
                      }
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="windowMinutes">Fenêtre (min)</Label>
                  <Input
                    id="windowMinutes"
                    type="number"
                    value={settings.rateLimitSettings.windowMinutes}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      rateLimitSettings: {
                        ...prev.rateLimitSettings,
                        windowMinutes: parseInt(e.target.value) || 15
                      }
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lockoutMinutes">Verrouillage (min)</Label>
                  <Input
                    id="lockoutMinutes"
                    type="number"
                    value={settings.rateLimitSettings.lockoutMinutes}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      rateLimitSettings: {
                        ...prev.rateLimitSettings,
                        lockoutMinutes: parseInt(e.target.value) || 30
                      }
                    }))}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button onClick={handleUpdateSettings} disabled={loading}>
              Sauvegarder les paramètres
            </Button>
            <Button variant="outline" onClick={handleTestRateLimit} disabled={loading}>
              Tester Rate Limit
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};