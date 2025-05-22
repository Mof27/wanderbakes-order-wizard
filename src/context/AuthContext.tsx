
import React, { createContext, useState, useEffect, useContext } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../services/supabase/client';
import { toast } from 'sonner';
import { config } from '@/config';
import { AppRole } from '@/services/supabase/database.types';

interface UserProfile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  display_name: string | null;
  avatar_url: string | null;
}

interface SignUpData {
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
  display_name?: string;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  roles: AppRole[];
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (data: SignUpData) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  loading: boolean;
  isConfigured: boolean;
  hasRole: (role: AppRole) => boolean;
  isAdmin: () => boolean;
  refreshProfile: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: Error | null }>;
  verifyPin: (userId: string, pin: string) => Promise<boolean>;
  setUserSession: (userId: string) => Promise<{ success: boolean, error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [isConfigured, setIsConfigured] = useState(isSupabaseConfigured());

  // Fetch user profile and roles
  const fetchUserData = async (userId: string) => {
    if (!isConfigured) return;

    try {
      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error('Error fetching user profile:', profileError);
      } else if (profileData) {
        setProfile(profileData as UserProfile);
      }

      // Fetch user roles
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

      if (rolesError) {
        console.error('Error fetching user roles:', rolesError);
      } else if (rolesData) {
        setRoles(rolesData.map(r => r.role));
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  useEffect(() => {
    if (!isConfigured) {
      if (config.debug.enabled) {
        console.warn('Supabase is not properly configured. Authentication will not work.');
        toast.warning('Supabase is not configured. Using mock data.');
      }
      setLoading(false);
      return;
    }

    // Get initial session and set up subscription
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserData(session.user.id);
      }
      
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // If logged in, fetch user data
        if (session?.user) {
          // Use a timeout to avoid potential deadlocks with Supabase client
          setTimeout(() => {
            fetchUserData(session.user.id);
          }, 0);
        } else {
          // Clear profile and roles when logged out
          setProfile(null);
          setRoles([]);
        }
        
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [isConfigured]);

  // Verify PIN for user
  const verifyPin = async (userId: string, pin: string): Promise<boolean> => {
    if (!isConfigured) {
      return false;
    }

    try {
      const { data, error } = await supabase.rpc('verify_pin', {
        user_id: userId,
        pin
      });

      if (error) {
        console.error('Error verifying PIN:', error);
        return false;
      }

      return !!data;
    } catch (error) {
      console.error('Error in PIN verification:', error);
      return false;
    }
  };

  // Set a user session manually (for PIN-based auth)
  const setUserSession = async (userId: string) => {
    // This is a simplified version for demo purposes
    // In a production app, you'd use a proper token-based system
    if (!isConfigured) {
      return { success: false, error: new Error('Supabase is not configured') };
    }

    try {
      // Fetch user data
      await fetchUserData(userId);
      
      // For demo, we'll simulate a successful login
      // In a real app, you'd use supabase.auth.setSession() with a valid token
      
      return { success: true, error: null };
    } catch (error) {
      console.error('Error setting user session:', error);
      return { success: false, error: error as Error };
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchUserData(user.id);
    }
  };

  const signIn = async (email: string, password: string) => {
    if (!isConfigured) {
      toast.error('Authentication is not available. Supabase is not configured.');
      return { error: new Error('Supabase is not configured') };
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (!error) {
        toast.success('Signed in successfully!');
      }
      
      return { error };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signUp = async ({ email, password, first_name, last_name, display_name }: SignUpData) => {
    if (!isConfigured) {
      toast.error('Authentication is not available. Supabase is not configured.');
      return { error: new Error('Supabase is not configured') };
    }

    try {
      // Prepare user metadata
      const userData = {
        first_name,
        last_name,
        display_name: display_name || first_name
      };

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      });
      
      if (!error) {
        toast.success('Account created successfully! Verify your email.');
      }
      
      return { error };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    if (!isConfigured) {
      return;
    }

    try {
      await supabase.auth.signOut();
      toast.info('Signed out successfully');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out');
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user || !isConfigured) {
      return { error: new Error('User not authenticated') };
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (!error) {
        // Update the local profile state
        setProfile(prev => prev ? { ...prev, ...updates } : null);
        toast.success('Profile updated successfully');
      }

      return { error };
    } catch (error) {
      console.error('Error updating profile:', error);
      return { error: error as Error };
    }
  };

  const hasRole = (role: AppRole): boolean => {
    return roles.includes(role);
  };

  const isAdmin = (): boolean => {
    return roles.includes('admin');
  };

  const value = {
    session,
    user,
    profile,
    roles,
    signIn,
    signUp,
    signOut,
    loading,
    isConfigured,
    hasRole,
    isAdmin,
    refreshProfile,
    updateProfile,
    verifyPin,
    setUserSession
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
