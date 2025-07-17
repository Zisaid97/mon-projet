
import { supabase } from '@/integrations/supabase/client';

export interface GoogleSheetsLog {
  user_id: string;
  event_type: 'connection_start' | 'auth_redirect' | 'token_exchange' | 'connection_success' | 'connection_error' | 'permission_error' | 'redirect_error';
  message: string;
  error_details?: any;
  user_agent?: string;
  redirect_uri?: string;
  timestamp: string;
}

export const logGoogleSheetsEvent = async (event: Omit<GoogleSheetsLog, 'timestamp' | 'user_id'>) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const logEntry: GoogleSheetsLog = {
      ...event,
      user_id: user.id,
      timestamp: new Date().toISOString(),
      user_agent: navigator.userAgent,
    };

    console.log('[Google Sheets Integration]', logEntry);

    // Only attempt to store in database if we can get a user
    try {
      const { error } = await supabase
        .from('google_sheets_logs' as any)
        .insert(logEntry);

      // Silently handle database errors to prevent blocking the main flow
      if (error && error.code !== '42P01') {
        console.warn('Failed to store Google Sheets log:', error);
      }
    } catch (dbError) {
      console.warn('Database logging failed:', dbError);
    }
  } catch (error) {
    // Silently handle all logging errors to prevent breaking the main functionality
    console.warn('Error logging Google Sheets event:', error);
  }
};

export const getConnectionGuide = (errorType?: string) => {
  const baseGuide = {
    title: "Guide de connexion Google Sheets",
    steps: [
      {
        step: 1,
        title: "Cliquez sur 'Se connecter à Google Sheets'",
        description: "Vous serez redirigé vers Google pour autoriser l'accès."
      },
      {
        step: 2,
        title: "Connectez-vous à votre compte Google",
        description: "Utilisez le compte Google qui contient vos feuilles de calcul."
      },
      {
        step: 3,
        title: "Autorisez les permissions",
        description: "Acceptez l'accès à Google Sheets et Google Drive."
      },
      {
        step: 4,
        title: "Retour automatique",
        description: "Vous serez automatiquement redirigé vers l'application."
      }
    ],
    troubleshooting: [
      {
        problem: "Erreur 'redirect_uri_mismatch'",
        solution: "Contactez l'administrateur - configuration requise côté serveur."
      },
      {
        problem: "Accès refusé",
        solution: "Assurez-vous d'autoriser tous les permissions demandées par Google."
      },
      {
        problem: "Page blanche après connexion",
        solution: "Vérifiez que les pop-ups ne sont pas bloqués dans votre navigateur."
      },
      {
        problem: "Erreurs de connexion réseau",
        solution: "Vérifiez votre connexion internet et réessayez dans quelques minutes."
      }
    ]
  };

  return baseGuide;
};
