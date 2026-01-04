import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth } from './AuthContext';

/**
 * ViewModeContext - Simplified for new role architecture
 * 
 * In the new architecture:
 * - 1 user = 1 role (member/expert/sponsor) stored in profile.user_role
 * - Super Admin = permission flag (is_super_admin = true), not a role
 * - No role switching - this context now just provides helper functions
 */

interface ViewModeContextType {
  isSuperAdmin: boolean;
  getEffectiveRole: () => string;
}

const ViewModeContext = createContext<ViewModeContextType | undefined>(undefined);

// Helper to determine effective role from database user_role
const mapUserRole = (userRole: string | undefined): 'member' | 'expert' | 'sponsor' => {
  if (!userRole) return 'member';
  if (['expert', 'creator'].includes(userRole)) return 'expert';
  if (['sponsor', 'business', 'government', 'ngo'].includes(userRole)) return 'sponsor';
  return 'member';
};

export const ViewModeProvider = ({ children }: { children: ReactNode }) => {
  const { profile } = useAuth();
  
  const isSuperAdmin = profile?.is_super_admin === true;
  
  // Get effective role from profile
  const getEffectiveRole = (): string => {
    if (!profile) return 'member';
    return mapUserRole(profile.user_role);
  };

  return (
    <ViewModeContext.Provider value={{ isSuperAdmin, getEffectiveRole }}>
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
