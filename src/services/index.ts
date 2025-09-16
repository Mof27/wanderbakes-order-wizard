
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
  setMode: (mode: 'mock' | 'firebase' | 'live', baseUrl?: string) => void;
}

// Function to set the data source mode
let currentMode: 'mock' | 'firebase' | 'live' = 'mock';
let currentBaseUrl: string | undefined = undefined;

const dataService: DataService = {
  customers: null as any,
  orders: null as any,
  settings: null as any,
  baker: null as any,
  gallery: null as any,
  setMode: (mode: 'mock' | 'firebase' | 'live', baseUrl?: string) => {
    currentMode = mode;
    currentBaseUrl = baseUrl;
    
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
    } else if (mode === 'live') {
      import('./live')
        .then(live => {
          dataService.customers = live.liveDataService.customers;
          dataService.orders = live.liveDataService.orders;
          dataService.settings = live.liveDataService.settings;
          dataService.baker = live.liveDataService.baker;
          dataService.gallery = live.liveDataService.gallery;
        })
        .catch(err => console.error('Failed to load live data service', err));
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
    }
  }
};

export { dataService, currentMode, currentBaseUrl };
