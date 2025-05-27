
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
      console.log("AuthContext: Fetching user data for:", userId);
      
      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error('AuthContext: Error fetching user profile:', profileError);
      } else if (profileData) {
        console.log("AuthContext: Profile data fetched:", profileData);
        setProfile(profileData as UserProfile);
      }

      // Fetch user roles
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

      if (rolesError) {
        console.error('AuthContext: Error fetching user roles:', rolesError);
        setRoles([]);
      } else if (rolesData) {
        const userRoles = rolesData.map(r => r.role);
        console.log("AuthContext: Roles fetched from database:", userRoles);
        setRoles(userRoles);
      } else {
        setRoles([]);
      }
    } catch (error) {
      console.error('AuthContext: Error fetching user data:', error);
      setRoles([]);
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

    console.log("AuthContext: Initializing authentication...");

    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("AuthContext: Auth state change:", event, session?.user?.id);
        setSession(session);
        setUser(session?.user ?? null);
        
        // If logged in, fetch user data with a small delay to avoid deadlocks
        if (session?.user) {
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

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("AuthContext: Initial session check:", session?.user?.id);
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserData(session.user.id);
      }
      
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [isConfigured]);
  
  // Refresh user profile
  const refreshProfile = async () => {
    if (user) {
      await fetchUserData(user.id);
    }
  };

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    if (!isConfigured) {
      toast.error('Authentication is not available. Supabase is not configured.');
      return { error: new Error('Supabase is not configured') };
    }

    try {
      console.log("AuthContext: Attempting sign in for:", email);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (!error) {
        console.log("AuthContext: Sign in successful");
        toast.success('Signed in successfully!');
      } else {
        console.error("AuthContext: Sign in error:", error.message);
      }
      
      return { error };
    } catch (error) {
      console.error("AuthContext: Unexpected sign in error:", error);
      return { error: error as Error };
    }
  };

  // Sign up a new user
  const signUp = async ({ email, password, first_name, last_name, display_name }: SignUpData) => {
    if (!isConfigured) {
      toast.error('Authentication is not available. Supabase is not configured.');
      return { error: new Error('Supabase is not configured') };
    }

    try {
      console.log("AuthContext: Attempting sign up for:", email);
      
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
        console.log("AuthContext: Sign up successful");
        toast.success('Account created successfully! Check your email for verification.');
      } else {
        console.error("AuthContext: Sign up error:", error.message);
      }
      
      return { error };
    } catch (error) {
      console.error("AuthContext: Unexpected sign up error:", error);
      return { error: error as Error };
    }
  };

  // Sign out
  const signOut = async () => {
    if (!isConfigured) {
      return;
    }

    try {
      console.log("AuthContext: Starting logout process...");
      
      // Standard Supabase signout
      await supabase.auth.signOut();
      
      // Clear state
      setUser(null);
      setSession(null);
      setProfile(null);
      setRoles([]);
      
      console.log("AuthContext: Logout completed");
      toast.info('Signed out successfully');
    } catch (error) {
      console.error('AuthContext: Error signing out:', error);
      // Even if signout fails, clear local state
      setUser(null);
      setSession(null);
      setProfile(null);
      setRoles([]);
      toast.error('Signed out locally (server error)');
    }
  };

  // Update the user's profile
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

  // Create an enhanced hasRole function
  const hasRole = (role: AppRole): boolean => {
    const hasRoleResult = roles.includes(role);
    console.log(`AuthContext: Checking if user has role ${role}: ${hasRoleResult}`, { allRoles: roles });
    return hasRoleResult;
  };

  // Check if the user is an admin
  const isAdmin = (): boolean => {
    return hasRole('admin');
  };

  // Value object for the context
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
    updateProfile
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
