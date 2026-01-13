import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CURRENT_TERMS_VERSION } from '@/constants/terms';
import { useAuth } from '@/contexts/AuthContext';
import { logger } from '@/lib/logger';

interface UseTermsAcceptanceResult {
  needsAcceptance: boolean;
  loading: boolean;
  acceptTerms: () => Promise<boolean>;
  error: Error | null;
}

/**
 * Hook to check and manage Terms of Service acceptance
 * CRITICAL: Always skips for demo mode users
 */
export const useTermsAcceptance = (): UseTermsAcceptanceResult => {
  const { user, isDemoMode } = useAuth();
  const [needsAcceptance, setNeedsAcceptance] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Check if user needs to accept terms
  const checkTermsAcceptance = useCallback(async () => {
    // CRITICAL: Demo mode ALWAYS skips terms check
    if (isDemoMode) {
      logger.debug('[Terms] Demo mode detected - skipping terms check', null, 'Terms');
      setNeedsAcceptance(false);
      setLoading(false);
      return;
    }

    if (!user) {
      setNeedsAcceptance(false);
      setLoading(false);
      return;
    }

    try {
      logger.debug('[Terms] Checking terms acceptance for user', { userId: user.id }, 'Terms');
      
      const { data: profile, error: fetchError } = await supabase
        .from('profiles')
        .select('accepted_terms_at, accepted_terms_version')
        .eq('id', user.id)
        .maybeSingle();

      if (fetchError) {
        logger.error('[Terms] Error fetching terms status', fetchError, 'Terms');
        setError(fetchError);
        setNeedsAcceptance(false);
        setLoading(false);
        return;
      }

      // User needs to accept terms if:
      // 1. Never accepted (null)
      // 2. Accepted older version
      const needsToAccept = 
        !profile?.accepted_terms_at || 
        profile?.accepted_terms_version !== CURRENT_TERMS_VERSION;

      logger.debug('[Terms] Terms check result', { 
        needsToAccept, 
        currentVersion: CURRENT_TERMS_VERSION,
        userVersion: profile?.accepted_terms_version 
      }, 'Terms');

      setNeedsAcceptance(needsToAccept);
    } catch (err) {
      logger.error('[Terms] Error checking terms', err, 'Terms');
      setError(err as Error);
      setNeedsAcceptance(false);
    } finally {
      setLoading(false);
    }
  }, [user, isDemoMode]);

  // Accept terms and save to database
  const acceptTerms = useCallback(async (): Promise<boolean> => {
    // Double-check: never save for demo users
    if (isDemoMode) {
      logger.debug('[Terms] Demo mode - skipping terms save', null, 'Terms');
      setNeedsAcceptance(false);
      return true;
    }

    if (!user) {
      return false;
    }

    try {
      logger.debug('[Terms] Saving terms acceptance', { userId: user.id, version: CURRENT_TERMS_VERSION }, 'Terms');
      
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          accepted_terms_at: new Date().toISOString(),
          accepted_terms_version: CURRENT_TERMS_VERSION
        })
        .eq('id', user.id);

      if (updateError) {
        logger.error('[Terms] Error saving terms acceptance', updateError, 'Terms');
        setError(updateError);
        return false;
      }

      logger.debug('[Terms] Terms accepted successfully', null, 'Terms');
      setNeedsAcceptance(false);
      return true;
    } catch (err) {
      logger.error('[Terms] Error accepting terms', err, 'Terms');
      setError(err as Error);
      return false;
    }
  }, [user, isDemoMode]);

  useEffect(() => {
    checkTermsAcceptance();
  }, [checkTermsAcceptance]);

  return {
    needsAcceptance,
    loading,
    acceptTerms,
    error
  };
};

export default useTermsAcceptance;
