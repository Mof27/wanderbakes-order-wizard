
/**
 * Application configuration
 */
export const config = {
  /**
   * API configuration
   */
  api: {
    /**
     * Data source mode: 'mock' or 'live'
     */
    dataSourceMode: 'mock' as const,
    
    /**
     * Base URL for the API when in live mode
     */
    baseUrl: '',
  },
  
  /**
   * Debug mode configuration
   */
  debug: {
    /**
     * Enable debug logging
     */
    enabled: true,
    
    /**
     * Log data service operations
     */
    dataService: true,
  },

  /**
   * Supabase configuration
   * These are fallback values for local development only
   * In production, use environment variables
   */
  supabase: {
    // Replace these with your Supabase project URL and anon key
    url: import.meta.env.VITE_SUPABASE_URL || '',
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
    // Flag to indicate whether to use mock data when Supabase is not properly configured
    useMockWhenUnconfigured: true,
  },
};
