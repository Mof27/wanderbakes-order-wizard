import { CustomerRepository } from "./repositories/customer.repository";
import { OrderRepository } from "./repositories/order.repository";
import { SettingsRepository } from "./repositories/settings.repository";
import { KitchenRepository } from "./repositories/kitchen.repository";
import { BakerRepository } from "./repositories/baker.repository";
import { DeliveryRepository } from "./repositories/delivery.repository";
import { GalleryRepository } from "./repositories/gallery.repository";

// Define the complete data service interface
export interface DataService {
  customers: CustomerRepository;
  orders: OrderRepository;
  settings: SettingsRepository;
  kitchen: KitchenRepository;
  baker: BakerRepository;
  delivery: DeliveryRepository;
  gallery: GalleryRepository;
  setMode: (mode: 'mock' | 'firebase', baseUrl?: string) => void;
}

// Function to set the data source mode
let currentMode: 'mock' | 'firebase' = 'mock';
let currentBaseUrl: string | undefined = undefined;

const dataService: DataService = {
  customers: null as any,
  orders: null as any,
  settings: null as any,
  kitchen: null as any,
  baker: null as any,
  delivery: null as any,
  gallery: null as any,
  setMode: (mode: 'mock' | 'firebase', baseUrl?: string) => {
    currentMode = mode;
    currentBaseUrl = baseUrl;
    
    // Dynamically import the data service based on the mode
    if (mode === 'mock') {
      import('./mock')
        .then(mock => {
          dataService.customers = mock.mockDataService.customers;
          dataService.orders = mock.mockDataService.orders;
          dataService.settings = mock.mockDataService.settings;
          dataService.kitchen = mock.mockDataService.kitchen;
          dataService.baker = mock.mockDataService.baker;
          dataService.delivery = mock.mockDataService.delivery;
          dataService.gallery = mock.mockDataService.gallery;
        })
        .catch(err => console.error('Failed to load mock data service', err));
    } else if (mode === 'firebase') {
      if (!baseUrl) {
        throw new Error('Base URL is required for Firebase mode');
      }
      
      import('./firebase')
        .then(firebase => {
          firebase.firebaseDataService.setBaseUrl(baseUrl);
          dataService.customers = firebase.firebaseDataService.customers;
          dataService.orders = firebase.firebaseDataService.orders;
          dataService.settings = firebase.firebaseDataService.settings;
          dataService.kitchen = firebase.firebaseDataService.kitchen;
          dataService.baker = firebase.firebaseDataService.baker;
          dataService.delivery = firebase.firebaseDataService.delivery;
          dataService.gallery = firebase.firebaseDataService.gallery;
        })
        .catch(err => console.error('Failed to load firebase data service', err));
    }
  }
};

export { dataService, currentMode, currentBaseUrl };
