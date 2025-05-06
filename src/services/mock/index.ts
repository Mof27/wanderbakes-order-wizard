
import { MockOrderRepository } from "../repositories/order.repository";
import { MockTripRepository } from "../repositories/trip.repository";
import { MockCustomerRepository } from "../repositories/customer.repository";
import { MockProductRepository } from "../repositories/product.repository";
import { MockSettingsRepository } from "../repositories/settings.repository";

// load sample data
import { mockOrders, mockCustomers } from "@/data/mockData";

const orderRepository = new MockOrderRepository(mockOrders);
const tripRepository = new MockTripRepository([]);
const customerRepository = new MockCustomerRepository(mockCustomers);
const productRepository = new MockProductRepository();
const settingsRepository = new MockSettingsRepository();

// Initialize settings with default values after creation
settingsRepository.update({
  cakeSizes: [],
  cakeShapes: [],
  cakeFlavors: [],
  colors: [],
  printTemplate: {
    title: "Order Form",
    orientation: "portrait",
    sections: []
  },
  deliveryLabelTemplate: {
    title: "Delivery Label",
    sections: []
  },
  driverSettings: {
    driver1Name: "Driver 1",
    driver2Name: "Driver 2",
    driver1Vehicle: "Car 1",
    driver2Vehicle: "Car 2"
  }
});

export const mockDataService = {
  orders: orderRepository,
  trips: tripRepository,
  customers: customerRepository,
  products: productRepository,
  settings: settingsRepository,
  setMode: (_mode: string, _baseUrl?: string) => {
    // Implementation for mode setting (mock version)
    console.log(`Mock data service: mode set to ${_mode}`);
    return;
  }
};
