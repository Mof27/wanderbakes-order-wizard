
import { CustomerRepository } from "./repositories/customer.repository";
import { OrderRepository } from "./repositories/order.repository";
import { SettingsRepository } from "./repositories/settings.repository";
import { BakerRepository } from "./repositories/baker.repository";
import { GalleryRepository } from "./repositories/gallery.repository";
import { isSupabaseConfigured } from "./supabase/client";
import { config } from "@/config";

// Define the complete data service interface
export interface DataService {
  customers: CustomerRepository;
  orders: OrderRepository;
  settings: SettingsRepository;
  baker: BakerRepository;
  gallery: GalleryRepository;
  setMode: (mode: 'mock' | 'firebase' | 'supabase', baseUrl?: string, apiKey?: string) => void;
  currentMode: 'mock' | 'firebase' | 'supabase';
}

// Function to set the data source mode
let currentMode: 'mock' | 'firebase' | 'supabase' = 'mock';
let currentBaseUrl: string | undefined = undefined;
let currentApiKey: string | undefined = undefined;

// Auto-detect Supabase configuration on startup
if (isSupabaseConfigured()) {
  currentMode = 'supabase';
  console.log('Supabase configuration detected! Using Supabase as data source.');
  // Set the baseUrl and apiKey from environment variables
  currentBaseUrl = import.meta.env.VITE_SUPABASE_URL || config.supabase?.url;
  currentApiKey = import.meta.env.VITE_SUPABASE_ANON_KEY || config.supabase?.anonKey;
} else {
  console.log('Supabase not configured. Using mock data as fallback.');
  if (config.supabase?.useMockWhenUnconfigured) {
    currentMode = 'mock';
  }
}

const dataService: DataService = {
  customers: null as any,
  orders: null as any,
  settings: null as any,
  baker: null as any,
  gallery: null as any,
  currentMode,
  setMode: (mode: 'mock' | 'firebase' | 'supabase', baseUrl?: string, apiKey?: string) => {
    currentMode = mode;
    currentBaseUrl = baseUrl;
    currentApiKey = apiKey;
    
    // Dynamically import the data service based on the mode
    if (mode === 'mock') {
      import('./mock')
        .then(mock => {
          dataService.customers = mock.mockDataService.customers;
          dataService.orders = mock.mockDataService.orders;
          dataService.settings = mock.mockDataService.settings;
          dataService.baker = mock.mockDataService.baker;
          dataService.gallery = mock.mockDataService.gallery;
        })
        .catch(err => console.error('Failed to load mock data service', err));
    } else if (mode === 'firebase') {
      if (!baseUrl) {
        throw new Error('Base URL is required for Firebase mode');
      }
      
      // This is a placeholder for future Firebase implementation
      console.warn("Firebase mode is not yet implemented");
      // We'll continue with mock data for now
      import('./mock')
        .then(mock => {
          dataService.customers = mock.mockDataService.customers;
          dataService.orders = mock.mockDataService.orders;
          dataService.settings = mock.mockDataService.settings;
          dataService.baker = mock.mockDataService.baker;
          dataService.gallery = mock.mockDataService.gallery;
        })
        .catch(err => console.error('Failed to load mock data service', err));
    } else if (mode === 'supabase') {
      // For Supabase mode, we'll use a hybrid approach:
      // 1. Use Supabase repositories for those that are implemented
      // 2. Use mock data repositories for those not yet migrated
      
      Promise.all([
        import('./mock'),
        import('./repositories/supabase/gallery.repository'),
        import('./repositories/supabase/customer.repository')  // Import our new Supabase Customer Repository
      ]).then(([mock, { SupabaseGalleryRepository }, { SupabaseCustomerRepository }]) => {
        try {
          // Only use Supabase implementations if Supabase is properly configured
          if (isSupabaseConfigured()) {
            // Use Supabase implementation for customer repository
            dataService.customers = new SupabaseCustomerRepository();
            
            // Use Supabase implementation for gallery
            dataService.gallery = new SupabaseGalleryRepository();
          } else {
            throw new Error('Supabase is not configured properly');
          }
          
          // Use mock implementations for repositories not yet migrated
          dataService.orders = mock.mockDataService.orders;
          dataService.settings = mock.mockDataService.settings;
          dataService.baker = mock.mockDataService.baker;
        } catch (error) {
          console.error('Failed to initialize Supabase repositories:', error);
          console.warn('Falling back to mock data for all repositories');
          
          // Fall back to mock data for all repositories
          dataService.customers = mock.mockDataService.customers;
          dataService.orders = mock.mockDataService.orders;
          dataService.settings = mock.mockDataService.settings;
          dataService.baker = mock.mockDataService.baker;
          dataService.gallery = mock.mockDataService.gallery;
        }
      }).catch(err => {
        console.error('Failed to load repositories:', err);
        
        // Handle the error by falling back to mock data
        import('./mock')
          .then(mock => {
            dataService.customers = mock.mockDataService.customers;
            dataService.orders = mock.mockDataService.orders;
            dataService.settings = mock.mockDataService.settings;
            dataService.baker = mock.mockDataService.baker;
            dataService.gallery = mock.mockDataService.gallery;
          })
          .catch(err => console.error('Failed to load mock data service as fallback', err));
      });
    }
  }
};

// Initialize the data service with the detected mode
dataService.setMode(currentMode, currentBaseUrl, currentApiKey);

export { dataService, currentMode, currentBaseUrl };
