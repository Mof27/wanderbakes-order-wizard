
import { CustomerRepository } from "./repositories/customer.repository";
import { OrderRepository } from "./repositories/order.repository";
import { SettingsRepository } from "./repositories/settings.repository";
import { BakerRepository } from "./repositories/baker.repository";
import { GalleryRepository } from "./repositories/gallery.repository";
import { config } from "@/config";
import { liveDataService } from "./live";
import { mockDataService } from "./mock";

// Define the complete data service interface
export interface DataService {
  customers: CustomerRepository;
  orders: OrderRepository;
  settings: SettingsRepository;
  baker: BakerRepository;
  gallery: GalleryRepository;
  setMode?: (mode: 'mock' | 'firebase' | 'live', baseUrl?: string) => void;
}

// Initialize data service based on config
const initializeDataService = (): DataService => {
  console.log(`Data service initialized in ${config.api.dataSourceMode} mode`);
  
  if (config.api.dataSourceMode === 'live') {
    return liveDataService;
  } else if (config.api.dataSourceMode === 'firebase') {
    console.warn("Firebase mode is not yet implemented, falling back to mock");
    return mockDataService;
  } else {
    return mockDataService;
  }
};

const dataService = initializeDataService();

export { dataService };
