import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { cleanupAuthState } from "@/utils/authUtils";
import { emailSchema, passwordSchema, sanitizeInput } from "@/utils/validation";

export type User = {
  id: string;
  email: string;
  user_metadata?: any;
};

// Failed login attempts tracking
const failedAttempts = new Map<string, { count: number; lastAttempt: number }>();
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let unsub: any;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const currentUser = session?.user
        ? { id: session.user.id, email: session.user.email ?? "", user_metadata: session.user.user_metadata }
        : null;
      setUser(currentUser);
      setHydrated(true);

      unsub = supabase.auth.onAuthStateChange((_event, session) => {
        const supaUser = session?.user
          ? { id: session.user.id, email: session.user.email ?? "", user_metadata: session.user.user_metadata }
          : null;
        setUser(supaUser);
      }).data.subscription;
    })();

    return () => {
      if (unsub) unsub.unsubscribe();
    };
  }, []);

  // Check if account is locked
  const isAccountLocked = (email: string): boolean => {
    const attempts = failedAttempts.get(email);
    if (!attempts) return false;
    
    const now = Date.now();
    if (now - attempts.lastAttempt > LOCKOUT_DURATION) {
      failedAttempts.delete(email);
      return false;
    }
    
    return attempts.count >= MAX_FAILED_ATTEMPTS;
  };

  // Record failed login attempt
  const recordFailedAttempt = (email: string) => {
    const current = failedAttempts.get(email) || { count: 0, lastAttempt: 0 };
    failedAttempts.set(email, {
      count: current.count + 1,
      lastAttempt: Date.now()
    });
  };

  // Clear failed attempts on successful login
  const clearFailedAttempts = (email: string) => {
    failedAttempts.delete(email);
  };

  // Login via Supabase
  const login = useCallback(
    async (email: string, password: string) => {
      // Validate inputs
      try {
        emailSchema.parse(email);
        passwordSchema.parse(password);
      } catch (error) {
        throw new Error("Email ou mot de passe invalide");
      }

      const sanitizedEmail = sanitizeInput(email.toLowerCase());

      // Check if account is locked
      if (isAccountLocked(sanitizedEmail)) {
        throw new Error("Compte temporairement verrouillé. Réessayez dans 15 minutes.");
      }

      cleanupAuthState();
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        // Ignore errors, we are just trying to ensure a clean state
      }

      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: sanitizedEmail,
          password,
        });

        if (error) {
          recordFailedAttempt(sanitizedEmail);
          throw new Error(error.message);
        }

        clearFailedAttempts(sanitizedEmail);

        // If session is null but user exists, MFA is required
        if (data.user && !data.session) {
          return { mfaRequired: true };
        }
        
        // If session exists, login is complete
        if (data.session) {
          window.location.href = "/dashboard";
        }

        return { mfaRequired: false };
      } catch (error) {
        recordFailedAttempt(sanitizedEmail);
        throw error;
      }
    },
    []
  );

  // Logout via Supabase
  const logout = useCallback(async () => {
    cleanupAuthState();
    try {
      await supabase.auth.signOut({ scope: 'global' });
    } catch (err) {
      // Ignore errors, we'll redirect anyway
    }
    setUser(null);
    window.location.href = "/auth";
  }, []);

  // Register étendu pour prénom/nom
  const register = useCallback(
    async (email: string, password: string, meta?: { first_name?: string; last_name?: string }) => {
      // Validate inputs
      try {
        emailSchema.parse(email);
        passwordSchema.parse(password);
      } catch (error) {
        throw new Error("Email ou mot de passe invalide");
      }

      const sanitizedEmail = sanitizeInput(email.toLowerCase());
      const sanitizedFirstName = meta?.first_name ? sanitizeInput(meta.first_name) : undefined;
      const sanitizedLastName = meta?.last_name ? sanitizeInput(meta.last_name) : undefined;

      const { error } = await supabase.auth.signUp({
        email: sanitizedEmail,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            first_name: sanitizedFirstName,
            last_name: sanitizedLastName,
          },
        },
      });
      if (error) throw new Error(error.message);
    },
    []
  );

  // NOUVEAU : renvoyer l’email de confirmation
  const resendConfirmationEmail = useCallback(
    async (email: string) => {
      try {
        emailSchema.parse(email);
      } catch (error) {
        throw new Error("Email invalide");
      }

      const sanitizedEmail = sanitizeInput(email.toLowerCase());

      const { error } = await supabase.auth.resend({
        type: "signup",
        email: sanitizedEmail,
        options: { emailRedirectTo: `${window.location.origin}/` },
      });
      if (error) {
        toast({
          title: "Erreur",
          description: error.message,
          variant: "destructive",
        });
        throw new Error(error.message);
      }
      toast({
        title: "Email de confirmation envoyé",
        description: `Un nouvel email de confirmation a été envoyé à ${sanitizedEmail}.`,
      });
    },
    []
  );

  // NOUVEAU : Gestion du mot de passe et 2FA
  const updatePassword = useCallback(async (password: string) => {
    try {
      passwordSchema.parse(password);
    } catch (error) {
      throw new Error("Le mot de passe ne respecte pas les critères de sécurité");
    }

    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
      throw error;
    }
    toast({ title: "Succès", description: "Votre mot de passe a été mis à jour." });
  }, []);

  const submitMfaChallenge = useCallback(async (code: string) => {
    const { data: factorsData } = await supabase.auth.mfa.listFactors();
    const totpFactor = factorsData?.totp[0];

    if (!totpFactor) {
      throw new Error("2FA non configuré. Impossible de vérifier le code.");
    }
    
    const { error } = await supabase.auth.mfa.challengeAndVerify({
      factorId: totpFactor.id,
      code,
    });

    if (error) {
      throw new Error("Code de vérification invalide.");
    }

    window.location.href = "/dashboard";
  }, []);

  const enrollMfa = useCallback(async () => {
    const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp' });
    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
      throw error;
    }
    return data;
  }, []);

  const challengeAndVerifyMfa = useCallback(async (factorId: string, code: string) => {
    const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId, code });
    if (error) {
      toast({ title: "Erreur", description: "Code de vérification invalide.", variant: "destructive" });
      throw error;
    }
    toast({ title: "Succès", description: "L'authentification à deux facteurs est activée." });
  }, []);

  const unenrollMfa = useCallback(async (factorId: string) => {
    const { error } = await supabase.auth.mfa.unenroll({ factorId });
    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
      throw error;
    }
    toast({ title: "Succès", description: "L'authentification à deux facteurs est désactivée." });
  }, []);

  const listMfaFactors = useCallback(async () => {
    const { data, error } = await supabase.auth.mfa.listFactors();
    if (error) {
      console.error("Error listing MFA factors:", error);
      return { totp: [] };
    }
    return data;
  }, []);

  return { 
    user, 
    login, 
    logout, 
    register, 
    hydrated, 
    resendConfirmationEmail, 
    updatePassword, 
    enrollMfa, 
    challengeAndVerifyMfa, 
    unenrollMfa, 
    listMfaFactors, 
    submitMfaChallenge 
  };
}
