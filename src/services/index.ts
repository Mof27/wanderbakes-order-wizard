
import { CustomerRepository } from "./repositories/customer.repository";
import { OrderRepository } from "./repositories/order.repository";
import { SettingsRepository } from "./repositories/settings.repository";
import { BakerRepository } from "./repositories/baker.repository";
import { GalleryRepository } from "./repositories/gallery.repository";

// Define the complete data service interface
export interface DataService {
  customers: CustomerRepository;
  orders: OrderRepository;
  settings: SettingsRepository;
  baker: BakerRepository;
  gallery: GalleryRepository;
  setMode: (mode: 'mock' | 'firebase' | 'supabase', baseUrl?: string, apiKey?: string) => void;
}

// Function to set the data source mode
let currentMode: 'mock' | 'firebase' | 'supabase' = 'mock';
let currentBaseUrl: string | undefined = undefined;
let currentApiKey: string | undefined = undefined;

const dataService: DataService = {
  customers: null as any,
  orders: null as any,
  settings: null as any,
  baker: null as any,
  gallery: null as any,
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
      if (!baseUrl || !apiKey) {
        throw new Error('Base URL and API key are required for Supabase mode');
      }
      
      // Import Supabase implementation
      import('./repositories/supabase/gallery.repository')
        .then(({ SupabaseGalleryRepository }) => {
          import('./mock')
            .then(mock => {
              // Use mock implementations for other repositories
              dataService.customers = mock.mockDataService.customers;
              dataService.orders = mock.mockDataService.orders;
              dataService.settings = mock.mockDataService.settings;
              dataService.baker = mock.mockDataService.baker;
              
              // Use Supabase implementation for gallery
              dataService.gallery = new SupabaseGalleryRepository(baseUrl, apiKey);
            })
            .catch(err => console.error('Failed to load mock data service', err));
        })
        .catch(err => console.error('Failed to load Supabase gallery repository', err));
    }
  }
};

export { dataService, currentMode, currentBaseUrl };
