import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  user_role: 'citizen' | 'business' | 'government' | 'ngo';
  organization?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
  organization_id?: string;
  public_display_name?: string;
  is_public_profile?: boolean;
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
  }) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: any }>;
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
    console.log('🔍 Fetching profile for userId:', userId);
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
      
      console.log('📊 Profile query result:', { profile, error, hasData: !!profile });
      
      if (error && error.code !== 'PGRST116') {
        console.error('❌ Error fetching profile:', error);
        return null;
      }
      
      if (!profile) {
        console.warn('⚠️ No profile found for user:', userId);
      }
      
      return profile as Profile;
    } catch (err) {
      console.error('❌ Profile fetch error:', err);
      return null;
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          const profile = await fetchProfileData(session.user.id);
          setProfile(profile);
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        const profile = await fetchProfileData(session.user.id);
        setProfile(profile);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
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
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;