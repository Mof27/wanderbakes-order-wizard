
import { MockOrderRepository } from "../repositories/order.repository";
import { MockTripRepository } from "../repositories/trip.repository";
import { MockCustomerRepository } from "../repositories/customer.repository";
import { MockProductRepository } from "../repositories/product.repository";
import { MockSettingsRepository } from "../repositories/settings.repository";

// load sample data
import { orders, customers, settings } from "@/data/mockData";

const orderRepository = new MockOrderRepository(orders);
const tripRepository = new MockTripRepository([]);
const customerRepository = new MockCustomerRepository(customers);
const productRepository = new MockProductRepository();
const settingsRepository = new MockSettingsRepository(settings);

export const mockDataService = {
  orders: orderRepository,
  trips: tripRepository,
  customers: customerRepository,
  products: productRepository,
  settings: settingsRepository,
};
