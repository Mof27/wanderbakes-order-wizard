import { DataService } from "../index";
import { LiveGalleryRepository } from "../repositories/live/gallery.repository";
import { LiveCustomerRepository } from "../repositories/live/customer.repository";
import { LiveOrderRepository } from "../repositories/live/order.repository";
import { LiveSettingsRepository } from "../repositories/live/settings.repository";
import { LiveBakerRepository } from "../repositories/live/baker.repository";

// Initialize live data service with all repositories connected to Supabase
export const liveDataService: DataService = {
  customers: new LiveCustomerRepository(),
  orders: new LiveOrderRepository(), 
  settings: new LiveSettingsRepository(),
  baker: new LiveBakerRepository(),
  gallery: new LiveGalleryRepository(),
  setMode: () => {} // Not used in this implementation
};