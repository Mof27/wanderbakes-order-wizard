
import { CustomerRepository } from "./repositories/customer.repository";
import { OrderRepository } from "./repositories/order.repository";
import { SettingsRepository } from "./repositories/settings.repository";
import { BakerRepository } from "./repositories/baker.repository";
import { GalleryRepository } from "./repositories/gallery.repository";
import { isSupabaseConfigured } from "./supabase/client";

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
      // 1. Use mock data repositories for repositories not yet migrated
      // 2. Use Supabase repositories for those that are migrated
      
      Promise.all([
        import('./mock'),
        import('./repositories/supabase/gallery.repository')
      ]).then(([mock, { SupabaseGalleryRepository }]) => {
        // Use mock implementations for repositories not yet migrated
        dataService.customers = mock.mockDataService.customers;
        dataService.orders = mock.mockDataService.orders;
        dataService.settings = mock.mockDataService.settings;
        dataService.baker = mock.mockDataService.baker;
        
        // Use Supabase implementation for gallery
        if (baseUrl && apiKey) {
          dataService.gallery = new SupabaseGalleryRepository(baseUrl, apiKey);
        } else {
          // Fall back to mock if Supabase isn't configured
          dataService.gallery = mock.mockDataService.gallery;
        }
      }).catch(err => console.error('Failed to load repositories', err));
    }
  }
};

// Initialize the data service with the detected mode
dataService.setMode(currentMode, currentBaseUrl, currentApiKey);

export { dataService, currentMode, currentBaseUrl };
