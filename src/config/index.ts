
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
    dataSourceMode: 'live' as const,
    
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
};
