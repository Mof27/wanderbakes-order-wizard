import { MockCustomerRepository } from "../repositories/customer.repository";
import { MockOrderRepository } from "../repositories/order.repository";
import { MockSettingsRepository } from "../repositories/settings.repository";
import { MockBakerRepository } from "../repositories/baker.repository";
import { MockGalleryRepository } from "../repositories/gallery.repository";

// Initialize the customer repository with some mock data
const customerRepository = new MockCustomerRepository();

// Initialize the order repository with some mock data
const orderRepository = new MockOrderRepository();

// Initialize the settings repository with some mock data
const settingsRepository = new MockSettingsRepository();

// Initialize the baker repository with some mock data
const bakerRepository = new MockBakerRepository();

// Initialize the gallery repository
const galleryRepository = new MockGalleryRepository();

// Export all repositories
export const mockDataService = {
  customers: customerRepository,
  orders: orderRepository,
  settings: settingsRepository,
  baker: bakerRepository,
  gallery: galleryRepository
};
