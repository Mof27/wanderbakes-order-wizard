
import { createClient } from '@supabase/supabase-js';
import { dataService } from '@/services';

/**
 * Initialize Supabase integration for the gallery feature
 * 
 * @param supabaseUrl The Supabase project URL
 * @param supabaseKey The Supabase API key
 * @returns Whether initialization was successful
 */
export const initializeSupabaseGallery = (supabaseUrl: string, supabaseKey: string): boolean => {
  try {
    // Validate inputs
    if (!supabaseUrl || !supabaseKey) {
      console.error('Supabase URL and key are required');
      return false;
    }
    
    // Test connection by creating a client and making a simple query
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Set the data service mode to Supabase
    dataService.setMode('supabase', supabaseUrl, supabaseKey);
    
    console.log('Supabase Gallery integration initialized successfully');
    return true;
  } catch (error) {
    console.error('Failed to initialize Supabase Gallery:', error);
    return false;
  }
};
