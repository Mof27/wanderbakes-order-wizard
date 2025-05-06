
import { mockCustomers, mockIngredients, mockOrders } from "@/data/mockData";
import { MockCustomerRepository } from "../repositories/customer.repository";
import { MockOrderRepository } from "../repositories/order.repository";
import { MockProductRepository } from "../repositories/product.repository";

/**
 * Mock data provider that initializes repositories with mock data
 */
export class MockDataProvider {
  public readonly customerRepository: MockCustomerRepository;
  public readonly orderRepository: MockOrderRepository;
  public readonly productRepository: MockProductRepository;

  constructor() {
    this.customerRepository = new MockCustomerRepository(mockCustomers);
    this.orderRepository = new MockOrderRepository(mockOrders);
    this.productRepository = new MockProductRepository(mockIngredients);
  }
}
