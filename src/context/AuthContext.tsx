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
          localStorage.removeItem("user_roles");
          localStorage.removeItem("pin_auth_user_id");
          localStorage.removeItem("pin_auth_timestamp");
          localStorage.removeItem("pin_auth_roles");
        }
        
        setLoading(false);
      }
    );

    // Check for stored PIN auth on initialization
    checkStoredPinAuth();

    return () => {
      subscription.unsubscribe();
    };
  }, [isConfigured]);

  // Check for stored PIN auth
  const checkStoredPinAuth = async () => {
    if (!isConfigured) return;
    
    const storedUserId = localStorage.getItem('pin_auth_user_id');
    const timestamp = parseInt(localStorage.getItem('pin_auth_timestamp') || '0');
    const storedRoles = localStorage.getItem('pin_auth_roles');
    
    // Check if PIN auth exists and is not expired (24 hours)
    if (storedUserId && (Date.now() - timestamp) < 24 * 60 * 60 * 1000) {
      console.log("Found stored PIN auth for user:", storedUserId);
      await setUserSession(storedUserId);
      
      // Also load roles from localStorage if available
      if (storedRoles) {
        try {
          const parsedRoles = JSON.parse(storedRoles);
          console.log("Loaded stored PIN auth roles:", parsedRoles);
          setRoles(parsedRoles);
        } catch (e) {
          console.error("Error parsing stored roles:", e);
        }
      }
    }
  };

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
    if (!isConfigured) {
      return { success: false, error: new Error('Supabase is not configured') };
    }

    try {
      console.log("Setting up user session for:", userId);
      
      // Fetch the user profile directly
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (profileError) {
        console.error('Error fetching profile:', profileError);
        return { success: false, error: profileError };
      }
      
      // Fetch roles
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);
        
      if (rolesError) {
        console.error('Error fetching roles:', rolesError);
      }
      
      const userRoles = rolesData?.map(r => r.role) || [];
      console.log("Fetched user roles for PIN auth:", userRoles);
      
      // Set the local state
      setProfile(profile);
      setRoles(userRoles);
      
      // Store roles in localStorage as a backup
      localStorage.setItem("user_roles", JSON.stringify(userRoles));
      localStorage.setItem("pin_auth_user_id", userId);
      localStorage.setItem("pin_auth_timestamp", Date.now().toString());
      localStorage.setItem("pin_auth_roles", JSON.stringify(userRoles));
      
      // Create a temporary user object
      const tempUser = {
        id: userId,
        app_metadata: { provider: 'pin', roles: userRoles },
        user_metadata: {
          first_name: profile.first_name,
          last_name: profile.last_name,
          display_name: profile.display_name,
          roles: userRoles
        }
      };
      
      console.log("Created temporary user object:", tempUser);
      
      // @ts-ignore - we're creating a minimal User object for PIN auth
      setUser(tempUser);
      
      // Create a session-like state (not a real Supabase session but works for our app)
      const tempSession = {
        user: tempUser,
        access_token: `pin_auth_${userId}`,
        refresh_token: '',
        expires_at: Date.now() + 24 * 60 * 60 * 1000 // 24 hours from now
      };
      
      console.log("Created temporary session:", tempSession);
      
      // @ts-ignore - using a custom session for PIN auth
      setSession(tempSession);
      
      return { success: true, error: null };
    } catch (error) {
      console.error('Error setting user session:', error);
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

  // Sign out the user
  const signOut = async () => {
    if (!isConfigured) {
      return;
    }

    try {
      // Clear PIN auth if it exists
      localStorage.removeItem('pin_auth_user_id');
      localStorage.removeItem('pin_auth_timestamp');
      localStorage.removeItem('pin_auth_roles');
      localStorage.removeItem('user_roles');
      
      // Standard Supabase signout
      await supabase.auth.signOut();
      
      // Clear state
      setUser(null);
      setSession(null);
      setProfile(null);
      setRoles([]);
      
      toast.info('Signed out successfully');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out');
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
    console.log(`Checking if user has role ${role}: ${hasRoleResult}`, { allRoles: roles });
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
