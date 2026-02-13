import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

type UserRole = 'expert' | 'member' | 'sponsor' | 'guest';

interface UseWelcomeModalReturn {
  showWelcome: boolean;
  setShowWelcome: (show: boolean) => void;
  userRole: UserRole;
  isFoundingExpert: boolean;
  isLoading: boolean;
}

export function useWelcomeModal(): UseWelcomeModalReturn {
  const { user, profile } = useAuth();
  const [showWelcome, setShowWelcome] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>('guest');
  const [isFoundingExpert, setIsFoundingExpert] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkWelcomeStatus = async () => {
      try {
        if (!user) {
          const hasSeenWelcome = localStorage.getItem('has_seen_welcome') === 'true';
          if (!hasSeenWelcome) {
            setShowWelcome(true);
            setUserRole('guest');
          }
          setIsLoading(false);
          return;
        }

        const { data: profileData } = await supabase
          .from('profiles')
          .select('user_role, has_seen_welcome, is_founding_expert, can_view_as_member')
          .eq('id', user.id)
          .maybeSingle();

        if (profileData) {
          let role: UserRole = 'member';
          const dbRole = (profileData as any).user_role;
          if (dbRole === 'expert' || dbRole === 'creator') {
            role = 'expert';
          } else if (['sponsor', 'business', 'government', 'ngo'].includes(dbRole)) {
            role = 'sponsor';
          }

          setUserRole(role);
          setIsFoundingExpert((profileData as any).is_founding_expert === true || (profileData as any).can_view_as_member === true);

          if (!(profileData as any).has_seen_welcome) {
            setShowWelcome(true);
          }
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Error checking welcome status:', error);
        setIsLoading(false);
      }
    };

    const timeoutId = setTimeout(checkWelcomeStatus, 500);
    return () => clearTimeout(timeoutId);
  }, [user]);

  return { showWelcome, setShowWelcome, userRole, isFoundingExpert, isLoading };
}
