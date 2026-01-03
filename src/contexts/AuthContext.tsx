import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

export type ActiveView = 'member' | 'expert' | 'sponsor';

const ACTIVE_VIEW_KEY = 'wellagora_active_view';

interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  user_role: 'citizen' | 'business' | 'government' | 'ngo' | 'creator';
  organization?: string;
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
  activeView: ActiveView;
  availableViews: ActiveView[];
  setActiveView: (view: ActiveView) => Promise<void>;
  signUp: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: string;
    organization?: string;
  }) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
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
  // Initialize from localStorage for instant no-flicker load
  const [activeView, setActiveViewState] = useState<ActiveView>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(ACTIVE_VIEW_KEY);
      if (saved && ['member', 'expert', 'sponsor'].includes(saved)) {
        return saved as ActiveView;
      }
    }
    return 'member';
  });
  const [availableViews, setAvailableViews] = useState<ActiveView[]>(['member']);

  // Helper function to fetch profile data
  const fetchProfileData = async (userId: string) => {
    logger.debug('Fetching profile', { userId }, 'Auth');
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select(`
          id,
          first_name,
          last_name,
          email,
          user_role,
          organization,
          organization_id,
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
      
      logger.debug('Profile query result', { hasData: !!profile, hasError: !!error }, 'Auth');
      
      if (error && error.code !== 'PGRST116') {
        logger.error('Error fetching profile', error, 'Auth');
        return null;
      }
      
      if (!profile) {
        logger.warn('No profile found', { userId }, 'Auth');
      }
      
      return profile as Profile;
    } catch (err) {
      logger.error('Profile fetch error', err, 'Auth');
      return null;
    }
  };

  // Fetch available views from database function
  const fetchAvailableViews = async (userId: string): Promise<ActiveView[]> => {
    try {
      const { data, error } = await supabase.rpc('get_available_views', { _user_id: userId });
      
      if (error) {
        logger.error('Error fetching available views', error, 'Auth');
        return ['member'];
      }
      
      return (data as ActiveView[]) || ['member'];
    } catch (err) {
      logger.error('Available views fetch error', err, 'Auth');
      return ['member'];
    }
  };

  // Fetch current view state from database
  const fetchViewState = async (userId: string): Promise<ActiveView> => {
    try {
      const { data, error } = await supabase
        .from('user_view_state')
        .select('active_view')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (error && error.code !== 'PGRST116') {
        logger.error('Error fetching view state', error, 'Auth');
        return 'member';
      }
      
      return (data?.active_view as ActiveView) || 'member';
    } catch (err) {
      logger.error('View state fetch error', err, 'Auth');
      return 'member';
    }
  };

  // Set active view with database + localStorage persistence
  const setActiveView = async (view: ActiveView): Promise<void> => {
    if (!user) return;
    
    // Super Admin can switch to ANY view, others need it in availableViews
    const canSwitch = availableViews.length === 3 || availableViews.includes(view);
    if (!canSwitch) {
      logger.warn('Cannot switch to view', { view, availableViews }, 'Auth');
      return;
    }
    
    // 1. Optimistic update - immediate
    setActiveViewState(view);
    
    // 2. localStorage update - immediate, survives F5
    localStorage.setItem(ACTIVE_VIEW_KEY, view);
    
    try {
      // 3. Database persistence
      const { error } = await supabase
        .from('user_view_state')
        .upsert(
          { user_id: user.id, active_view: view, updated_at: new Date().toISOString() },
          { onConflict: 'user_id' }
        );
      
      if (error) {
        logger.error('Error saving view state', error, 'Auth');
        // Rollback on error - refetch actual state
        const actualView = await fetchViewState(user.id);
        setActiveViewState(actualView);
        localStorage.setItem(ACTIVE_VIEW_KEY, actualView);
        throw error;
      }
      
      logger.debug('View state saved', { view }, 'Auth');
    } catch (err) {
      logger.error('Set active view error', err, 'Auth');
      throw err;
    }
  };

  // Load all auth-related data for a user
  const loadUserData = async (userId: string) => {
    logger.debug('Loading user data', { userId }, 'Auth');
    
    try {
      // Get localStorage value immediately (no flicker)
      const savedView = localStorage.getItem(ACTIVE_VIEW_KEY) as ActiveView | null;
      if (savedView && ['member', 'expert', 'sponsor'].includes(savedView)) {
        setActiveViewState(savedView);
      }
      
      // Fetch profile, available views, and current view state in parallel
      const [profileData, views, dbView] = await Promise.all([
        fetchProfileData(userId),
        fetchAvailableViews(userId),
        fetchViewState(userId)
      ]);
      
      setProfile(profileData);
      setAvailableViews(views);
      
      // Validate: prefer localStorage FIRST, then DB, then member
      // localStorage takes priority because user just switched manually
      const validView = (savedView && views.includes(savedView)) ? savedView :
                        views.includes(dbView) ? dbView : 'member';
      setActiveViewState(validView);
      localStorage.setItem(ACTIVE_VIEW_KEY, validView);
      
      logger.debug('User data loaded', { 
        hasProfile: !!profileData, 
        views, 
        activeView: validView 
      }, 'Auth');
    } catch (err) {
      logger.error('User data load error', err, 'Auth');
      setProfile(null);
      setAvailableViews(['member']);
      setActiveViewState('member');
    }
  };

  useEffect(() => {
    logger.debug('Setting up auth state listener', null, 'Auth');
    
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
          setAvailableViews(['member']);
          setActiveViewState('member');
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
          },
        },
    });

    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return { error };
  };

  const signOut = async () => {
    // Clear localStorage on sign out
    localStorage.removeItem(ACTIVE_VIEW_KEY);
    await supabase.auth.signOut();
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: new Error('No user logged in') };

    const { error } = await supabase
      .from('profiles')
      .update(updates)
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
    activeView,
    availableViews,
    setActiveView,
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
