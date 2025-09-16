import { DataService } from "../index";
import { LiveGalleryRepository } from "../repositories/live/gallery.repository";
import { MockCustomerRepository } from "../repositories/customer.repository";
import { MockOrderRepository } from "../repositories/order.repository";
import { MockSettingsRepository } from "../repositories/settings.repository";
import { MockBakerRepository } from "../repositories/baker.repository";

// Initialize live data service - only gallery is live for now
export const liveDataService: DataService = {
  customers: new MockCustomerRepository(), // Using mock for now
  orders: new MockOrderRepository(), // Using mock for now
  settings: new MockSettingsRepository(), // Using mock for now
  baker: new MockBakerRepository(), // Using mock for now
  gallery: new LiveGalleryRepository(),
  setMode: () => {} // Not used in this implementation
};