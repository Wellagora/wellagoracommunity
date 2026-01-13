import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTermsAcceptance } from '@/hooks/useTermsAcceptance';
import TermsModal from '@/components/legal/TermsModal';
import { logger } from '@/lib/logger';

/**
 * Wrapper component that checks Terms of Service acceptance
 * CRITICAL: Always skips for demo mode users
 */
const TermsCheckWrapper = () => {
  const { user, isDemoMode, signOut } = useAuth();
  const { needsAcceptance, loading, acceptTerms } = useTermsAcceptance();
  const [showModal, setShowModal] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);
  const location = useLocation();

  // Don't show modal on legal pages
  const isLegalPage = location.pathname.includes('/impressum') || 
                       location.pathname.includes('/privacy') ||
                       location.pathname.includes('/adatvedelem');

  useEffect(() => {
    // CRITICAL: Demo mode ALWAYS skips terms modal
    if (isDemoMode) {
      logger.debug('[TermsWrapper] Demo mode - skipping modal', null, 'Terms');
      setShowModal(false);
      return;
    }

    // Only show modal for real users who need to accept
    if (!loading && needsAcceptance && user && !isLegalPage) {
      logger.debug('[TermsWrapper] Showing terms modal for real user', { userId: user.id }, 'Terms');
      setShowModal(true);
    } else {
      setShowModal(false);
    }
  }, [isDemoMode, loading, needsAcceptance, user, isLegalPage]);

  const handleAcceptTerms = async () => {
    // Double-check: never process for demo users
    if (isDemoMode) {
      setShowModal(false);
      return;
    }

    setIsAccepting(true);
    try {
      const success = await acceptTerms();
      if (success) {
        logger.debug('[TermsWrapper] Terms accepted, closing modal', null, 'Terms');
        setShowModal(false);
      }
    } finally {
      setIsAccepting(false);
    }
  };

  const handleDeclineTerms = async () => {
    logger.debug('[TermsWrapper] Terms declined, signing out', null, 'Terms');
    await signOut();
  };

  // Show loading state while checking terms (only for real users)
  if (loading && user && !isDemoMode) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      {/* Only show modal for real users who need to accept */}
      {!isDemoMode && (
        <TermsModal
          open={showModal}
          onAccept={handleAcceptTerms}
          onDecline={handleDeclineTerms}
          showDecline={true}
          isLoading={isAccepting}
        />
      )}
      <Outlet />
    </>
  );
};

export default TermsCheckWrapper;
