import { useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { FinancialRow, FinancialRowInput } from "@/types/financial";
import { useAuth } from "./useAuth";
import { 
  financialDataSchema, 
  sanitizeInput, 
  logSecurityEvent,
  createRateLimiter 
} from "@/utils/validation";

// Create rate limiter for financial operations
const financialOperationLimiter = createRateLimiter(15, 60000); // 15 operations per minute

function getMonthStart(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

// Enhanced financial rows hook with security
export function useSecureFinancialRows() {
  const { user } = useAuth();
  const now = new Date();
  const start = getMonthStart(now).toISOString().slice(0,10);
  const end = new Date(now.getFullYear(), now.getMonth()+1, 0)
    .toISOString().slice(0,10);

  return useQuery<FinancialRow[]>({
    queryKey: ["financial_tracking", user?.id, start, end],
    queryFn: async () => {
      if (!user?.id) return [];
      
      try {
        const { data, error } = await supabase
          .from("financial_tracking")
          .select("*")
          .eq("user_id", user.id)
          .gte("date", start)
          .lte("date", end)
          .order("date", { ascending: true });

        if (error) {
          await logSecurityEvent('FINANCIAL_DATA_ACCESS_ERROR', { 
            error: error.message 
          }, user.id);
          throw error;
        }

        return data as FinancialRow[];
      } catch (error) {
        await logSecurityEvent('FINANCIAL_DATA_FETCH_FAILED', { 
          error: error instanceof Error ? error.message : 'Unknown error'
        }, user.id);
        throw error;
      }
    },
    enabled: !!user,
  });
}

// Enhanced financial row for date with security
export function useSecureFinancialRowForDate(date: string) {
  const { user } = useAuth();
  
  return useQuery<FinancialRow | null>({
    queryKey: ["financial_tracking", user?.id, date],
    queryFn: async () => {
      if (!user?.id) return null;
      
      // Validate date input
      const sanitizedDate = sanitizeInput(date);
      if (sanitizedDate !== date || !sanitizedDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
        await logSecurityEvent('INVALID_DATE_FORMAT', { 
          provided_date: date 
        }, user.id);
        throw new Error("Format de date invalide");
      }

      try {
        const { data, error } = await supabase
          .from("financial_tracking")
          .select("*")
          .eq("user_id", user.id)
          .eq("date", sanitizedDate)
          .maybeSingle();

        if (error) {
          await logSecurityEvent('FINANCIAL_ROW_ACCESS_ERROR', { 
            error: error.message,
            date: sanitizedDate 
          }, user.id);
          throw error;
        }

        return data || null;
      } catch (error) {
        throw error;
      }
    },
    enabled: !!user && !!date,
  });
}

// Enhanced upsert with security
export function useSecureUpsertFinancialRow() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (row: FinancialRowInput & { user_id: string }) => {
      if (!user?.id) {
        await logSecurityEvent('UNAUTHORIZED_FINANCIAL_UPSERT_ATTEMPT', {});
        throw new Error("Utilisateur non authentifié");
      }

      // Rate limiting check
      const rateLimitResult = financialOperationLimiter(user.id);
      if (!rateLimitResult.allowed) {
        await logSecurityEvent('RATE_LIMIT_EXCEEDED', { 
          operation: 'upsertFinancialRow',
          user_id: user.id 
        });
        throw new Error("Trop d'opérations. Veuillez patienter.");
      }

      // Enhanced input validation
      try {
        const validatedData = financialDataSchema.parse({
          date: sanitizeInput(row.date),
          exchange_rate: row.exchange_rate,
          amount_received_usd: row.amount_received_usd,
        });

        // Verify user owns this operation
        if (row.user_id !== user.id) {
          await logSecurityEvent('UNAUTHORIZED_FINANCIAL_UPSERT', { 
            attempted_user_id: row.user_id,
            actual_user_id: user.id 
          }, user.id);
          throw new Error("Accès non autorisé");
        }

        const amount_received_mad = validatedData.amount_received_usd * validatedData.exchange_rate;
        
        // Create properly typed object for upsert
        const upsertData = {
          user_id: user.id,
          date: validatedData.date,
          exchange_rate: validatedData.exchange_rate,
          amount_received_usd: validatedData.amount_received_usd,
          amount_received_mad
        };
        
        const { error, data } = await supabase
          .from("financial_tracking")
          .upsert(upsertData, { onConflict: "user_id,date" })
          .select()
          .maybeSingle();

        if (error) {
          await logSecurityEvent('FINANCIAL_UPSERT_ERROR', { 
            error: error.message 
          }, user.id);
          throw error;
        }

        await logSecurityEvent('FINANCIAL_DATA_SAVED', { 
          date: validatedData.date 
        }, user.id);

        return data;
      } catch (error) {
        if (error instanceof Error && error.message.includes('validation')) {
          await logSecurityEvent('INVALID_FINANCIAL_INPUT_ATTEMPT', { 
            error: error.message 
          }, user.id);
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["financial_tracking"] });
    },
  });
}

// Enhanced delete with security
export function useSecureDeleteFinancialRow() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ user_id, date }: { user_id: string, date: string }) => {
      if (!user?.id) {
        await logSecurityEvent('UNAUTHORIZED_FINANCIAL_DELETE_ATTEMPT', {});
        throw new Error("Utilisateur non authentifié");
      }

      // Rate limiting check
      const rateLimitResult = financialOperationLimiter(user.id);
      if (!rateLimitResult.allowed) {
        await logSecurityEvent('RATE_LIMIT_EXCEEDED', { 
          operation: 'deleteFinancialRow',
          user_id: user.id 
        });
        throw new Error("Trop d'opérations. Veuillez patienter.");
      }

      // Validate inputs
      const sanitizedDate = sanitizeInput(date);
      if (sanitizedDate !== date || !sanitizedDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
        await logSecurityEvent('INVALID_DELETE_DATE_FORMAT', { 
          provided_date: date 
        }, user.id);
        throw new Error("Format de date invalide");
      }

      // Verify ownership
      if (user_id !== user.id) {
        await logSecurityEvent('UNAUTHORIZED_FINANCIAL_DELETE', { 
          attempted_user_id: user_id,
          actual_user_id: user.id 
        }, user.id);
        throw new Error("Accès non autorisé");
      }

      try {
        const { error } = await supabase
          .from("financial_tracking")
          .delete()
          .eq("user_id", user.id)
          .eq("date", sanitizedDate);

        if (error) {
          await logSecurityEvent('FINANCIAL_DELETE_ERROR', { 
            error: error.message,
            date: sanitizedDate 
          }, user.id);
          throw error;
        }

        await logSecurityEvent('FINANCIAL_DATA_DELETED', { 
          date: sanitizedDate 
        }, user.id);
      } catch (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["financial_tracking"] });
    },
  });
}
