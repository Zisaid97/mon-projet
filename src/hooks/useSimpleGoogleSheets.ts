import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from './useAuth';

export interface GoogleIntegration {
  id: string;
  user_id: string;
  access_token: string;
  refresh_token: string;
  expires_at: string;
  google_email: string;
  google_name: string;
  connected_at: string;
}

export function useSimpleGoogleSheets() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [integration, setIntegration] = useState<GoogleIntegration | null>(null);
  const [initialized, setInitialized] = useState(false);

  const getRedirectUri = useCallback(() => {
    const currentOrigin = window.location.origin;
    console.log('Current origin:', currentOrigin);
    return `${currentOrigin}/google-auth-callback`;
  }, []);

  const checkIntegration = useCallback(async () => {
    if (!user) return;
    
    console.log('Checking integration for user:', user.id);

    try {
      const { data, error } = await supabase
        .from('google_integrations')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      console.log('Integration query result:', { data, error });

      if (error) {
        console.error('Error checking integration:', error);
        setIntegration(null);
      } else {
        setIntegration(data);
        console.log('Integration set to:', data);
      }
      
      setInitialized(true);
    } catch (error) {
      console.error('Exception during integration check:', error);
      setIntegration(null);
      setInitialized(true);
    }
  }, [user]);

  const connectToGoogle = useCallback(async () => {
    if (!user) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour utiliser cette fonctionnalité",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session');

      const redirectUri = getRedirectUri();
      
      const response = await fetch('https://uqqajzfkqushviwuayng.supabase.co/functions/v1/google-auth', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'get_auth_url',
          redirectUri
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Erreur de connexion');
      }

      // Redirect to Google OAuth
      window.location.href = data.auth_url;
    } catch (error: any) {
      console.error('Connect to Google error:', error);
      toast({
        title: "Erreur de connexion",
        description: error.message || "Impossible de se connecter à Google",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [user, getRedirectUri]);

  const disconnectFromGoogle = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { error } = await supabase
        .from('google_integrations')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;

      setIntegration(null);
      
      toast({
        title: "Déconnecté",
        description: "Votre compte Google a été déconnecté avec succès."
      });
    } catch (error: any) {
      console.error('Disconnect error:', error);
      toast({
        title: "Erreur",
        description: "Impossible de déconnecter le compte Google",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [user]);

  const refreshIntegration = useCallback(() => {
    setInitialized(false);
    setIntegration(null);
  }, []);

  useEffect(() => {
    checkIntegration();
  }, [checkIntegration]);

  return {
    loading,
    integration,
    connectToGoogle,
    disconnectFromGoogle,
    refreshIntegration
  };
}