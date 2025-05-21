
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
    // These are placeholder values for development only
    // Replace with your actual Supabase project URL and anon key for local testing
    url: 'https://your-project-url.supabase.co',
    anonKey: 'your-anon-key',
    // Flag to indicate whether to use mock data when Supabase is not properly configured
    useMockWhenUnconfigured: true,
  },
};

