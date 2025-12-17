import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

type ViewMode = 'super_admin' | 'business' | 'citizen';

interface ViewModeContextType {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  getEffectiveRole: () => string;
  isSuperAdmin: boolean;
}

const ViewModeContext = createContext<ViewModeContextType | undefined>(undefined);

const STORAGE_KEY = 'wellagora_view_mode';

export const ViewModeProvider = ({ children }: { children: ReactNode }) => {
  const { user, profile } = useAuth();
  const [viewMode, setViewModeState] = useState<ViewMode>('super_admin');
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  // Check if user is super admin
  useEffect(() => {
    const checkSuperAdmin = async () => {
      if (!user) {
        setIsSuperAdmin(false);
        setViewModeState('citizen');
        return;
      }

      try {
        const { data, error } = await supabase.rpc('has_role', {
          _user_id: user.id,
          _role: 'super_admin'
        });
        
        logger.debug('Super admin check result', { userId: user.id, isSuperAdmin: data, hasError: !!error }, 'ViewMode');
        
        setIsSuperAdmin(data || false);

        // If not super admin, reset view mode to citizen
        if (!data) {
          setViewModeState('citizen');
          localStorage.removeItem(STORAGE_KEY);
        }
      } catch (error) {
        logger.error('Error checking super_admin role', error, 'ViewMode');
        setIsSuperAdmin(false);
      }
    };

    checkSuperAdmin();
  }, [user]);

  // Load saved view mode from localStorage
  useEffect(() => {
    if (isSuperAdmin) {
      const savedMode = localStorage.getItem(STORAGE_KEY) as ViewMode;
      if (savedMode && ['super_admin', 'business', 'citizen'].includes(savedMode)) {
        setViewModeState(savedMode);
      }
    }
  }, [isSuperAdmin]);

  const setViewMode = (mode: ViewMode) => {
    setViewModeState(mode);
    if (isSuperAdmin) {
      localStorage.setItem(STORAGE_KEY, mode);
    }
  };

  const getEffectiveRole = (): string => {
    // If not super admin, return actual profile role
    if (!isSuperAdmin) {
      return profile?.user_role || 'citizen';
    }

    // If super admin, return simulated role based on view mode
    switch (viewMode) {
      case 'business':
        return 'business';
      case 'citizen':
        return 'citizen';
      case 'super_admin':
      default:
        return profile?.user_role || 'citizen';
    }
  };

  return (
    <ViewModeContext.Provider value={{ viewMode, setViewMode, getEffectiveRole, isSuperAdmin }}>
      {children}
    </ViewModeContext.Provider>
  );
};

export const useViewMode = (): ViewModeContextType => {
  const context = useContext(ViewModeContext);
  if (context === undefined) {
    throw new Error('useViewMode must be used within a ViewModeProvider');
  }
  return context;
};
