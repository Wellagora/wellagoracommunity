import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';
import { DEMO_ACCOUNTS, MOCK_SPONSORS, MOCK_EXPERTS } from '@/data/mockData';

// User roles - simplified to 3 main roles
export type UserRole = 'member' | 'expert' | 'sponsor';

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
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  isDemoMode: boolean;
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
    
    // Check for demo session first
    const demoSession = localStorage.getItem('wellagora_demo_session');
    if (demoSession) {
      try {
        const { user: demoUser, profile: demoProfile } = JSON.parse(demoSession);
        logger.debug('Restoring demo session', { role: demoProfile?.user_role }, 'Auth');
        setUser(demoUser);
        setProfile(demoProfile);
        setIsDemoMode(true);
        setLoading(false);
        return; // Skip Supabase session check for demo mode
      } catch (e) {
        localStorage.removeItem('wellagora_demo_session');
      }
    }
    
    // Set up auth state listener - MUST NOT be async!
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        logger.debug('Auth state changed', { event, hasSession: !!session }, 'Auth');
        
        // Only synchronous updates here
        setSession(session);
        setUser(session?.user ?? null);
        
        // Defer data loading with setTimeout to prevent deadlock
        if (session?.user) {
          logger.debug('User detected, deferring data load', null, 'Auth');
          setTimeout(() => {
            loadUserData(session.user.id).finally(() => {
              setLoading(false);
            });
          }, 0);
        } else {
          logger.debug('No user, clearing data', null, 'Auth');
          setProfile(null);
          setLoading(false);
        }
      }
    );

    // Get initial session
    logger.debug('Checking for existing session', null, 'Auth');
    supabase.auth.getSession().then(({ data: { session } }) => {
      logger.debug('Initial session check', { hasSession: !!session }, 'Auth');
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
    const { error } = await supabase.auth.signUp({
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
          },
        },
    });

    return { error };
  };

  const signIn = async (email: string, password: string): Promise<{ error: Error | null; demoRole?: string }> => {
    // 1. CHECK FOR DEMO ACCOUNT FIRST
    const demoAccount = DEMO_ACCOUNTS.find(
      acc => acc.email.toLowerCase() === email.toLowerCase() && acc.password === password
    );

    if (demoAccount) {
      logger.debug('Demo mode activated', { role: demoAccount.role }, 'Auth');
      
      // Create mock user object (mimics Supabase user structure)
      const mockUser = {
        id: `demo-${demoAccount.role}-${Date.now()}`,
        email: demoAccount.email,
        user_metadata: { 
          full_name: demoAccount.name,
          role: demoAccount.role 
        },
        app_metadata: {},
        aud: 'authenticated',
        created_at: new Date().toISOString()
      };

      // Get role-specific data
      const sponsorData = demoAccount.role === 'sponsor' ? MOCK_SPONSORS[0] : null;
      const expertData = demoAccount.role === 'expert' ? MOCK_EXPERTS[0] : null;

      // Create mock profile object
      const mockProfile: Profile = {
        id: mockUser.id,
        first_name: demoAccount.role === 'sponsor' 
          ? sponsorData?.contact_name?.split(' ')[1] || 'Mária'
          : demoAccount.role === 'expert'
            ? expertData?.first_name || 'János'
            : 'Eszter',
        last_name: demoAccount.role === 'sponsor' 
          ? sponsorData?.contact_name?.split(' ')[0] || 'Horváth'
          : demoAccount.role === 'expert'
            ? expertData?.last_name || 'Kovács'
            : 'Tóth',
        email: demoAccount.email,
        user_role: demoAccount.role === 'admin' ? 'member' : demoAccount.role,
        is_super_admin: demoAccount.role === 'admin',
        organization_name: sponsorData?.organization_name || null,
        organization_logo_url: null,
        avatar_url: expertData?.avatar_url || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_verified_expert: demoAccount.role === 'expert',
      };

      // Set states
      setUser(mockUser as unknown as User);
      setProfile(mockProfile);
      setIsDemoMode(true);
      
      // Store demo session in localStorage for persistence
      localStorage.setItem('wellagora_demo_session', JSON.stringify({
        user: mockUser,
        profile: mockProfile,
        role: demoAccount.role
      }));

      return { error: null, demoRole: demoAccount.role };
    }

    // 2. NORMAL SUPABASE LOGIN (for real accounts)
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { error };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    // Clear demo session if exists
    localStorage.removeItem('wellagora_demo_session');
    setIsDemoMode(false);
    
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
