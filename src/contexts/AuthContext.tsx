import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

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

  useEffect(() => {
    logger.debug('Setting up auth state listener', null, 'Auth');
    
    // Set up auth state listener - MUST NOT be async!
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        logger.debug('Auth state changed', { event, hasSession: !!session }, 'Auth');
        
        // Only synchronous updates here
        setSession(session);
        setUser(session?.user ?? null);
        
        // Defer profile fetch with setTimeout to prevent deadlock
        if (session?.user) {
          logger.debug('User detected, deferring profile fetch', null, 'Auth');
          setTimeout(() => {
            fetchProfileData(session.user.id).then(profile => {
              logger.debug('Profile fetched successfully', { hasProfile: !!profile }, 'Auth');
              setProfile(profile);
              setLoading(false);
            }).catch(err => {
              logger.error('Profile fetch failed', err, 'Auth');
              setProfile(null);
              setLoading(false);
            });
          }, 0);
        } else {
          logger.debug('No user, clearing profile', null, 'Auth');
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
          fetchProfileData(session.user.id).then(profile => {
            logger.debug('Initial profile fetched', { hasProfile: !!profile }, 'Auth');
            setProfile(profile);
            setLoading(false);
          }).catch(err => {
            logger.error('Initial profile fetch failed', err, 'Auth');
            setProfile(null);
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

  const value: AuthContextType = {
    user,
    profile,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    setProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;