
import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';
import { config } from '@/config';

// Use environment variables or config values
const supabaseUrl = config.supabase.url;
const supabaseKey = config.supabase.anonKey;

// Create a single supabase client for the entire app
export const supabase = createClient<Database>(
  supabaseUrl,
  supabaseKey,
  {
    auth: {
      persistSession: true,
      storageKey: 'wanderbakes-auth-storage',
    }
  }
);

// Helper function to check if Supabase is properly configured
export const isSupabaseConfigured = (): boolean => {
  return Boolean(supabaseUrl) && Boolean(supabaseKey);
};
