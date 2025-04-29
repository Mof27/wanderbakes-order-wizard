
import { MockDataProvider } from "./mock";
import { LiveApiClient } from "./api";
import { CustomerRepository } from "./repositories/customer.repository";
import { OrderRepository } from "./repositories/order.repository";
import { ProductRepository } from "./repositories/product.repository";

/**
 * Data source mode to determine which data provider to use
 */
export type DataSourceMode = 'mock' | 'live';

/**
 * Data service class that provides access to all repositories
 * and handles toggling between mock and live data
 */
export class DataService {
  private static instance: DataService;
  private mockDataProvider: MockDataProvider;
  private liveApiClient: LiveApiClient | null = null;
  private mode: DataSourceMode = 'mock'; // Default to mock

  private constructor() {
    this.mockDataProvider = new MockDataProvider();
  }

  /**
   * Get the singleton instance of the data service
   */
  public static getInstance(): DataService {
    if (!DataService.instance) {
      DataService.instance = new DataService();
    }
    return DataService.instance;
  }

  /**
   * Set the data source mode (mock or live)
   */
  public setMode(mode: DataSourceMode, apiBaseUrl?: string): void {
    this.mode = mode;
    
    // Initialize live API client if switching to live mode
    if (mode === 'live' && apiBaseUrl) {
      this.liveApiClient = new LiveApiClient(apiBaseUrl);
    }
  }

  /**
   * Get the current data source mode
   */
  public getMode(): DataSourceMode {
    return this.mode;
  }

  /**
   * Get the customer repository
   */
  public get customers(): CustomerRepository {
    // In future, return live repository when mode is 'live'
    return this.mockDataProvider.customerRepository;
  }

  /**
   * Get the order repository
   */
  public get orders(): OrderRepository {
    // In future, return live repository when mode is 'live'
    return this.mockDataProvider.orderRepository;
  }

  /**
   * Get the product repository
   */
  public get products(): ProductRepository {
    // In future, return live repository when mode is 'live'
    return this.mockDataProvider.productRepository;
  }
}

// Create a default export for easier imports
export const dataService = DataService.getInstance();
