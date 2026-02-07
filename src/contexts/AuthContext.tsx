import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';
import { notificationTriggers } from '@/lib/notificationTriggers';
import { DEMO_ACCOUNTS, MOCK_SPONSORS, MOCK_EXPERTS } from '@/data/mockData';

// User roles - simplified to main roles + admin
export type UserRole = 'member' | 'expert' | 'sponsor' | 'admin';

interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  user_role: string;  // Database can have legacy values
  is_super_admin: boolean;
  organization?: string;
  organization_name?: string;
  organization_logo_url?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
  organization_id?: string;
  public_display_name?: string;
  is_public_profile?: boolean;
  stripe_onboarding_complete?: boolean;
  payout_preference?: string | null;
  is_verified_expert?: boolean;
  bio?: string;
  website_url?: string;
  location?: string;
  industry?: string;
  sustainability_goals?: string[];
  preferred_language?: string;
  company_size?: string;
  employee_count?: number;
  role?: string;
  sponsor_status?: string;
  credit_balance?: number;
  // Expert-specific fields
  expert_title?: string;
  expertise_areas?: string[];
  wise_iban?: string;
  wise_email?: string;
  auto_create_drafts?: boolean;
  green_pass?: boolean;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  isDemoMode: boolean;
  viewAsRole: UserRole | null;
  setViewAsRole: (role: UserRole | null) => void;
  signUp: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: string;
    organization?: string;
    bio?: string;
    industry?: string;
  }) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null; demoRole?: string }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: Error | null }>;
  setProfile: React.Dispatch<React.SetStateAction<Profile | null>>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);
  
  // God Mode: viewAsRole allows Super Admins to switch between views
  const [viewAsRole, setViewAsRoleState] = useState<UserRole | null>(() => {
    const stored = sessionStorage.getItem('wellagora_view_as_role');
    return stored as UserRole | null;
  });

  // Setter that also persists to sessionStorage
  const setViewAsRole = (role: UserRole | null) => {
    setViewAsRoleState(role);
    if (role) {
      sessionStorage.setItem('wellagora_view_as_role', role);
    } else {
      sessionStorage.removeItem('wellagora_view_as_role');
    }
  };

  // Helper function to fetch profile data
  const fetchProfileData = async (userId: string) => {
    logger.debug('Fetching profile', { userId }, 'Auth');
    try {
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select(`
          id,
          first_name,
          last_name,
          email,
          user_role,
          is_super_admin,
          organization,
          organization_id,
          organization_name,
          organization_logo_url,
          avatar_url,
          created_at,
          updated_at,
          public_display_name,
          is_public_profile,
          bio,
          location,
          industry,
          website_url,
          sustainability_goals,
          preferred_language,
          company_size,
          employee_count,
          role
        `)
        .eq('id', userId)
        .maybeSingle();
      
      logger.debug('Profile query result', { hasData: !!profileData, hasError: !!error }, 'Auth');
      
      if (error && error.code !== 'PGRST116') {
        logger.error('Error fetching profile', error, 'Auth');
        return null;
      }
      
      if (!profileData) {
        logger.warn('No profile found', { userId }, 'Auth');
        return null;
      }
      
      // Ensure is_super_admin has a default value
      return {
        ...profileData,
        is_super_admin: profileData.is_super_admin ?? false
      } as Profile;
    } catch (err) {
      logger.error('Profile fetch error', err, 'Auth');
      return null;
    }
  };

  // Load all auth-related data for a user
  const loadUserData = async (userId: string) => {
    logger.debug('Loading user data', { userId }, 'Auth');
    
    try {
      const profileData = await fetchProfileData(userId);
      setProfile(profileData);
      
      logger.debug('User data loaded', { 
        hasProfile: !!profileData, 
        user_role: profileData?.user_role,
        is_super_admin: profileData?.is_super_admin
      }, 'Auth');
    } catch (err) {
      logger.error('User data load error', err, 'Auth');
      setProfile(null);
    }
  };

  useEffect(() => {
    logger.debug('Setting up auth state listener', null, 'Auth');

    // Restore demo session if present, BUT do not short-circuit Supabase listener setup.
    // Reason: if we return early here, real Supabase logins won't work until a full reload.
    const demoSessionRaw = localStorage.getItem('wellagora_demo_session');
    let hasDemoSession = false;

    if (demoSessionRaw) {
      try {
        const { user: demoUser, profile: demoProfile } = JSON.parse(demoSessionRaw);
        logger.debug('Restoring demo session', { role: demoProfile?.user_role }, 'Auth');
        setUser(demoUser);
        setProfile(demoProfile);
        setIsDemoMode(true);
        hasDemoSession = true;
        setLoading(false);
      } catch (e) {
        localStorage.removeItem('wellagora_demo_session');
      }
    }

    // Set up auth state listener - MUST NOT be async!
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        logger.debug('Auth state changed', { event, hasSession: !!session }, 'Auth');

        // If a real Supabase session appears, we must exit demo mode.
        if (session?.user) {
          localStorage.removeItem('wellagora_demo_session');
          setIsDemoMode(false);
        }

        // Only synchronous updates here
        setSession(session);
        setUser(session?.user ?? (hasDemoSession ? (user as User | null) : null));

        // Defer data loading with setTimeout to prevent deadlock
        if (session?.user) {
          logger.debug('User detected, deferring data load', null, 'Auth');
          setTimeout(() => {
            loadUserData(session.user.id).finally(() => {
              setLoading(false);
            });
          }, 0);
        } else {
          // No Supabase session: keep demo session state if it was restored.
          if (!hasDemoSession) {
            logger.debug('No user, clearing data', null, 'Auth');
            setProfile(null);
            setUser(null);
          }
          setLoading(false);
        }
      }
    );

    // Get initial session
    logger.debug('Checking for existing session', null, 'Auth');
    supabase.auth.getSession().then(({ data: { session } }) => {
      logger.debug('Initial session check', { hasSession: !!session }, 'Auth');

      // If demo is active and there is no Supabase session, do not override demo state.
      if (!session && hasDemoSession) {
        return;
      }

      if (session?.user) {
        localStorage.removeItem('wellagora_demo_session');
        setIsDemoMode(false);
      }

      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        setTimeout(() => {
          loadUserData(session.user.id).finally(() => {
            setLoading(false);
          });
        }, 0);
      } else {
        setLoading(false);
      }
    });

    return () => {
      logger.debug('Cleaning up auth subscription', null, 'Auth');
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: string;
    organization?: string;
    bio?: string;
    industry?: string;
  }) => {
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            first_name: data.firstName,
            last_name: data.lastName,
            user_role: data.role,
            organization: data.organization || null,
            organization_name: data.organization || null,
            bio: data.bio || null,
            industry: data.industry || null,
            accepted_terms_at: new Date().toISOString(),
            accepted_terms_version: '2026-02-10',
          },
        },
    });

    // Send welcome email if signup was successful
    if (!error && authData?.user) {
      notificationTriggers.onUserRegistration({
        userId: authData.user.id,
        email: data.email,
        name: `${data.firstName} ${data.lastName}`.trim() || undefined,
        role: data.role
      }).catch(err => logger.error('Failed to send welcome email', err, 'Auth'));
    }

    return { error };
  };

  const signIn = async (email: string, password: string): Promise<{ error: Error | null; demoRole?: string }> => {
    // Check if this is a demo account (for role-based redirect after login)
    const demoAccount = DEMO_ACCOUNTS.find(
      (acc) => acc.email.toLowerCase() === email.toLowerCase()
    );

    // ALWAYS use real Supabase authentication - no mock data bypass
    try {
      // Ensure demo mode is cleared for fresh login
      localStorage.removeItem('wellagora_demo_session');
      setIsDemoMode(false);

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error };
      }

      // Return demoRole for redirect purposes (if it was a demo account)
      return { error: null, demoRole: demoAccount?.role };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    // Clear demo session if exists
    localStorage.removeItem('wellagora_demo_session');
    sessionStorage.removeItem('wellagora_view_as_role');
    setIsDemoMode(false);
    setViewAsRoleState(null);
    
    // Normal Supabase signout
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: new Error('No user logged in') };

    const { error } = await supabase
      .from('profiles')
      .update(updates as Record<string, unknown>)
      .eq('id', user.id);

    if (!error && profile) {
      setProfile({ ...profile, ...updates });
    }

    return { error };
  };

  const refreshProfile = async () => {
    if (!user) return;
    await loadUserData(user.id);
  };

  const value: AuthContextType = {
    user,
    profile,
    session,
    loading,
    isDemoMode,
    viewAsRole,
    setViewAsRole,
    signUp,
    signIn,
    signOut,
    updateProfile,
    setProfile,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
