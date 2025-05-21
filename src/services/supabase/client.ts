

import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';
import { config } from '@/config';

// Use Supabase credentials from config
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

// Helper function to check if Supabase is properly configured with real values
export const isSupabaseConfigured = (): boolean => {
  return Boolean(config.supabase.url) && Boolean(config.supabase.anonKey) && 
         config.supabase.url !== 'https://placeholder-url.supabase.co' &&
         config.supabase.anonKey !== 'placeholder-key';
};

