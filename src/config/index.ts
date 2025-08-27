
/**
 * Application configuration
 */
export const config = {
  /**
   * API configuration
   */
  api: {
    /**
     * Data source mode: 'mock' or 'live' or 'supabase'
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

    /**
     * Log authentication events
     */
    authEvents: true, // Added this line
  },

  /**
   * Supabase configuration
   * These are fallback values for local development only
   * In production, use environment variables
   */
  supabase: {
    // Get values from environment variables with fallbacks
    url: "https://nygwbcsekdwrpjbpckmj.supabase.co",
    anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im55Z3diY3Nla2R3cnBqYnBja21qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc4MTIwNTgsImV4cCI6MjA2MzM4ODA1OH0.i1bnHDPQ7VJK_sEONv2_RIx8IptBKLz-SY3qS0cHTyE",
    // Flag to indicate whether to use mock data when Supabase is not properly configured
    useMockWhenUnconfigured: true,
  },
};
