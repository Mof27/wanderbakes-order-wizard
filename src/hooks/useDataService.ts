
import { useEffect, useState } from 'react';
import { dataServiceManager } from '@/services/DataServiceManager';

export const useDataService = () => {
  const [isReady, setIsReady] = useState(dataServiceManager.isReady);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (dataServiceManager.isReady) {
      setIsReady(true);
      return;
    }

    console.log('useDataService: Waiting for data service to be ready');
    
    const initializeService = async () => {
      try {
        await dataServiceManager.initialize();
        setIsReady(true);
        setError(null);
        console.log('useDataService: Data service is now ready');
      } catch (err) {
        console.error('useDataService: Failed to initialize data service:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize data service');
      }
    };

    initializeService();

    // Also listen for ready state changes
    dataServiceManager.onReady(() => {
      setIsReady(true);
      setError(null);
    });
  }, []);

  const retry = async () => {
    console.log('useDataService: Retrying initialization');
    setError(null);
    setIsReady(false);
    
    try {
      await dataServiceManager.initialize();
      setIsReady(true);
    } catch (err) {
      console.error('useDataService: Retry failed:', err);
      setError(err instanceof Error ? err.message : 'Retry failed');
    }
  };

  return {
    isReady,
    error,
    retry,
    dataService: dataServiceManager
  };
};
