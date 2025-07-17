
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from './useAuth';
import { logGoogleSheetsEvent } from '@/utils/googleSheetsLogger';

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

export interface GoogleSpreadsheet {
  id: string;
  name: string;
  modifiedTime: string;
}

export interface SheetInfo {
  spreadsheetId: string;
  properties: {
    title: string;
  };
  sheets: Array<{
    properties: {
      sheetId: number;
      title: string;
      gridProperties: {
        rowCount: number;
        columnCount: number;
      };
    };
  }>;
}

export function useGoogleSheets() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [integration, setIntegration] = useState<GoogleIntegration | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  // Fonction pour déterminer l'URL de redirection correcte
  const getRedirectUri = useCallback(() => {
    const currentOrigin = window.location.origin;
    
    // Si on est sur le domaine trackprofit, utiliser cette URL
    if (currentOrigin.includes('trackprofit')) {
      return `${currentOrigin}/google-auth-callback`;
    }
    
    // Si on est sur un domaine Lovable (*.lovable.app)
    if (currentOrigin.includes('lovable.app')) {
      return `${currentOrigin}/google-auth-callback`;
    }
    
    // Par défaut, utiliser l'origine actuelle
    return `${currentOrigin}/google-auth-callback`;
  }, []);

  const callEdgeFunction = useCallback(async (functionName: string, payload: any, retries = 3) => {
    if (!user) throw new Error('User not authenticated');

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('No session');

    console.log(`Calling edge function ${functionName} with payload:`, payload);

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const response = await fetch(`https://uqqajzfkqushviwuayng.supabase.co/functions/v1/${functionName}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        const data = await response.json();
        console.log(`Edge function ${functionName} response:`, data);
        
        if (!response.ok) {
          throw new Error(data.error || 'Request failed');
        }

        return data;
      } catch (error) {
        console.error(`Attempt ${attempt} failed for ${functionName}:`, error);
        
        if (attempt === retries) {
          throw error;
        }
        
        // Wait before retry with exponential backoff
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }, [user]);

  const connectToGoogle = useCallback(async () => {
    if (isConnecting) {
      console.log('Connection already in progress, skipping...');
      return;
    }

    if (!navigator.onLine) {
      throw new Error('Aucune connexion internet détectée. Vérifiez votre connexion réseau.');
    }

    try {
      setIsConnecting(true);
      setLoading(true);
      
      await logGoogleSheetsEvent({
        event_type: 'connection_start',
        message: 'User initiated Google Sheets connection'
      });

      const REDIRECT_URI = getRedirectUri();
      
      console.log("Connecting to Google with redirect URI:", REDIRECT_URI);
      console.log("Current URL origin:", window.location.origin);
      
      await logGoogleSheetsEvent({
        event_type: 'auth_redirect',
        message: 'Preparing Google OAuth redirect',
        redirect_uri: REDIRECT_URI,
        error_details: {
          current_origin: window.location.origin,
          full_url: window.location.href,
          detected_redirect_uri: REDIRECT_URI,
          user_agent: navigator.userAgent
        }
      });
      
      const data = await callEdgeFunction("google-auth", { 
        action: "get_auth_url", 
        redirectUri: REDIRECT_URI 
      });

      await logGoogleSheetsEvent({
        event_type: 'auth_redirect',
        message: 'Successfully generated auth URL, redirecting to Google',
        redirect_uri: REDIRECT_URI,
        error_details: {
          auth_url_generated: true,
          redirect_uri_sent: REDIRECT_URI
        }
      });

      // Redirect to Google OAuth
      window.location.href = data.auth_url;
    } catch (error) {
      console.error("Connect to Google error:", error);
      
      await logGoogleSheetsEvent({
        event_type: 'connection_error',
        message: 'Failed to initiate Google connection',
        error_details: {
          error: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
          current_url: window.location.href,
          attempted_redirect_uri: getRedirectUri(),
          user_agent: navigator.userAgent
        }
      });

      let userFriendlyMessage = "Erreur de connexion à Google.";
      
      if (error instanceof Error) {
        if (error.message.includes('redirect_uri')) {
          userFriendlyMessage = `Problème de configuration OAuth. URL de redirection requise : ${getRedirectUri()}`;
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          userFriendlyMessage = "Problème de connexion réseau. Vérifiez votre connexion internet et réessayez.";
        } else {
          userFriendlyMessage = error.message;
        }
      }

      toast({
        title: "Erreur de connexion",
        description: userFriendlyMessage,
        variant: "destructive"
      });
      
      throw error;
    } finally {
      setLoading(false);
      setIsConnecting(false);
    }
  }, [callEdgeFunction, isConnecting, getRedirectUri]);

  const disconnectFromGoogle = useCallback(async () => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('google_integrations')
        .delete()
        .eq('user_id', user?.id);

      if (error) throw error;

      setIntegration(null);
      
      await logGoogleSheetsEvent({
        event_type: 'connection_success',
        message: 'User disconnected from Google Sheets'
      });

      toast({
        title: "Déconnecté",
        description: "Votre compte Google a été déconnecté avec succès."
      });
    } catch (error) {
      console.error("Disconnect error:", error);
      
      await logGoogleSheetsEvent({
        event_type: 'connection_error',
        message: 'Failed to disconnect from Google',
        error_details: error
      });

      toast({
        title: "Erreur",
        description: "Impossible de déconnecter le compte Google",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [user]);

  const checkIntegration = useCallback(async (force = false) => {
    if (!user) {
      setIntegration(null);
      return;
    }

    // Éviter les appels répétés sauf si forcé
    if (!force && integration !== null) {
      return;
    }

    try {
      const { data, error } = await supabase
        .from('google_integrations')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error checking integration:', error);
        setIntegration(null);
        return;
      }
      
      setIntegration(data || null);
    } catch (error) {
      console.error('Exception during integration check:', error);
      setIntegration(null);
    }
  }, [user, integration]);

  const listSpreadsheets = useCallback(async (): Promise<GoogleSpreadsheet[]> => {
    try {
      const data = await callEdgeFunction('google-sheets', { action: 'list_spreadsheets' });
      return data.files || [];
    } catch (error) {
      await logGoogleSheetsEvent({
        event_type: 'permission_error',
        message: 'Failed to list spreadsheets - possible permission issue',
        error_details: error
      });
      throw error;
    }
  }, [callEdgeFunction]);

  const getSheetInfo = useCallback(async (spreadsheetId: string): Promise<SheetInfo> => {
    return await callEdgeFunction('google-sheets', { 
      action: 'get_sheet_info', 
      spreadsheetId 
    });
  }, [callEdgeFunction]);

  const readSheetData = useCallback(async (spreadsheetId: string, range: string) => {
    return await callEdgeFunction('google-sheets', { 
      action: 'read_range', 
      spreadsheetId, 
      range 
    });
  }, [callEdgeFunction]);

  const writeSheetData = useCallback(async (
    spreadsheetId: string, 
    range: string, 
    values: any[][]
  ) => {
    return await callEdgeFunction('google-sheets', { 
      action: 'write_data', 
      spreadsheetId, 
      range, 
      values 
    });
  }, [callEdgeFunction]);

  const createSpreadsheet = useCallback(async (sheetName: string) => {
    return await callEdgeFunction('google-sheets', { 
      action: 'create_spreadsheet', 
      sheetName 
    });
  }, [callEdgeFunction]);

  return {
    loading,
    integration,
    connectToGoogle,
    disconnectFromGoogle,
    checkIntegration,
    listSpreadsheets,
    getSheetInfo,
    readSheetData,
    writeSheetData,
    createSpreadsheet
  };
}
