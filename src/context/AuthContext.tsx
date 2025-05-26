
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
      console.log("Fetching user data for:", userId);
      
      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error('Error fetching user profile:', profileError);
      } else if (profileData) {
        console.log("Profile data fetched:", profileData);
        setProfile(profileData as UserProfile);
      }

      // Fetch user roles
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

      if (rolesError) {
        console.error('Error fetching user roles:', rolesError);
        // Try to get roles from localStorage as fallback
        tryLoadRolesFromLocalStorage(userId);
      } else if (rolesData) {
        const userRoles = rolesData.map(r => r.role);
        console.log("Roles fetched from database:", userRoles);
        setRoles(userRoles);
        
        // Store roles in localStorage as a backup method
        localStorage.setItem("user_roles", JSON.stringify(userRoles));
      } else {
        // Try to get roles from localStorage as fallback
        tryLoadRolesFromLocalStorage(userId);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      tryLoadRolesFromLocalStorage(userId);
    }
  };

  // Helper to load roles from localStorage
  const tryLoadRolesFromLocalStorage = (userId: string) => {
    try {
      // Try to get roles specific to this user first
      const pinAuthUserId = localStorage.getItem("pin_auth_user_id");
      const pinAuthRoles = localStorage.getItem("pin_auth_roles");
      
      if (pinAuthUserId === userId && pinAuthRoles) {
        const parsedRoles = JSON.parse(pinAuthRoles);
        console.log("Loaded pin auth roles from localStorage:", parsedRoles);
        setRoles(parsedRoles);
        return;
      }
      
      // Fall back to generic roles storage
      const storedRoles = localStorage.getItem("user_roles");
      if (storedRoles) {
        const parsedRoles = JSON.parse(storedRoles);
        console.log("Loaded generic roles from localStorage:", parsedRoles);
        setRoles(parsedRoles);
      }
    } catch (e) {
      console.error("Error parsing stored roles:", e);
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
      console.log("Initial session check:", session?.user?.id);
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
        console.log("Auth state change:", event, session?.user?.id);
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
          // Clear all auth-related localStorage items
          localStorage.removeItem("user_roles");
          localStorage.removeItem("pin_auth_user_id");
          localStorage.removeItem("pin_auth_timestamp");
          localStorage.removeItem("pin_auth_roles");
        }
        
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [isConfigured]);

  // Verify PIN for user using the Edge Function
  const verifyPin = async (userId: string, pin: string): Promise<boolean> => {
    if (!isConfigured) {
      return false;
    }

    try {
      console.log("AuthContext: Calling PIN auth Edge Function for user:", userId);
      
      const { data, error } = await supabase.functions.invoke('pin-auth', {
        body: { userId, pin }
      });

      if (error) {
        console.error('AuthContext: Edge Function error:', error);
        return false;
      }

      if (!data.success) {
        console.log("AuthContext: PIN verification failed:", data.message);
        return false;
      }

      console.log("AuthContext: PIN verified successfully, session data:", data.session);
      return true;
    } catch (error) {
      console.error('AuthContext: Error in PIN verification:', error);
      return false;
    }
  };

  // Set a user session using the Edge Function for PIN-based auth
  const setUserSession = async (userId: string) => {
    if (!isConfigured) {
      return { success: false, error: new Error('Supabase is not configured') };
    }

    try {
      console.log("AuthContext: Setting up user session via Edge Function for:", userId);
      
      // The Edge Function should have already been called via verifyPin
      // But we need to establish the session properly on the client side
      
      // Fetch the user profile and roles to store locally
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (profileError) {
        console.error('AuthContext: Error fetching profile:', profileError);
        return { success: false, error: profileError };
      }
      
      // Fetch roles
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);
        
      if (rolesError) {
        console.error('AuthContext: Error fetching roles:', rolesError);
      }
      
      const userRoles = rolesData?.map(r => r.role) || [];
      console.log("AuthContext: Fetched user roles for PIN auth:", userRoles);
      
      // Set the local state
      setProfile(profile);
      setRoles(userRoles);
      
      // Store backup data in localStorage
      localStorage.setItem("user_roles", JSON.stringify(userRoles));
      localStorage.setItem("pin_auth_user_id", userId);
      localStorage.setItem("pin_auth_timestamp", Date.now().toString());
      localStorage.setItem("pin_auth_roles", JSON.stringify(userRoles));
      
      // The session should already be established by the Edge Function
      // We just need to wait for the auth state change event
      
      return { success: true, error: null };
    } catch (error) {
      console.error('AuthContext: Error setting user session:', error);
      return { success: false, error: error as Error };
    }
  };
  
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
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (!error) {
        toast.success('Signed in successfully!');
      }
      
      return { error };
    } catch (error) {
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

  // Enhanced sign out with complete cleanup
  const signOut = async () => {
    if (!isConfigured) {
      return;
    }

    try {
      console.log("AuthContext: Starting complete logout process...");
      
      // Clear PIN auth if it exists
      localStorage.removeItem('pin_auth_user_id');
      localStorage.removeItem('pin_auth_timestamp');
      localStorage.removeItem('pin_auth_roles');
      localStorage.removeItem('user_roles');
      
      // Clear any other auth-related items
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.includes('auth') || key.includes('supabase'))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      // Standard Supabase signout
      await supabase.auth.signOut();
      
      // Force clear state immediately
      setUser(null);
      setSession(null);
      setProfile(null);
      setRoles([]);
      
      console.log("AuthContext: Complete logout finished");
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
