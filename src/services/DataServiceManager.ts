
import { CustomerRepository } from "./repositories/customer.repository";
import { OrderRepository } from "./repositories/order.repository";
import { SettingsRepository } from "./repositories/settings.repository";
import { BakerRepository } from "./repositories/baker.repository";
import { GalleryRepository } from "./repositories/gallery.repository";
import { isSupabaseConfigured } from "./supabase/client";
import { config } from "@/config";

export interface DataServiceManager {
  customers: CustomerRepository;
  orders: OrderRepository;
  settings: SettingsRepository;
  baker: BakerRepository;
  gallery: GalleryRepository;
  isReady: boolean;
  currentMode: 'mock' | 'firebase' | 'supabase';
  initialize: () => Promise<void>;
  onReady: (callback: () => void) => void;
  setMode: (mode: 'mock' | 'firebase' | 'supabase', baseUrl?: string, apiKey?: string) => Promise<void>;
}

class DataServiceManagerImpl implements DataServiceManager {
  public customers: CustomerRepository = null as any;
  public orders: OrderRepository = null as any;
  public settings: SettingsRepository = null as any;
  public baker: BakerRepository = null as any;
  public gallery: GalleryRepository = null as any;
  public isReady: boolean = false;
  public currentMode: 'mock' | 'firebase' | 'supabase' = 'mock';

  private readyCallbacks: (() => void)[] = [];
  private initializationPromise: Promise<void> | null = null;

  constructor() {
    // Auto-detect mode on startup but don't initialize yet
    if (isSupabaseConfigured()) {
      this.currentMode = 'supabase';
      console.log('Supabase configuration detected! Will use Supabase as data source.');
    } else {
      console.log('Supabase not configured. Will use mock data as fallback.');
      if (config.supabase.useMockWhenUnconfigured) {
        this.currentMode = 'mock';
      }
    }
  }

  async initialize(): Promise<void> {
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = this._doInitialize();
    return this.initializationPromise;
  }

  private async _doInitialize(): Promise<void> {
    console.log('DataServiceManager: Starting initialization with mode:', this.currentMode);
    
    try {
      await this.setMode(this.currentMode);
      this.isReady = true;
      console.log('DataServiceManager: Initialization complete, notifying callbacks');
      
      // Notify all waiting callbacks
      this.readyCallbacks.forEach(callback => {
        try {
          callback();
        } catch (error) {
          console.error('Error in ready callback:', error);
        }
      });
      this.readyCallbacks = [];
    } catch (error) {
      console.error('DataServiceManager: Initialization failed:', error);
      // Fall back to mock if initialization fails
      await this._initializeMock();
      this.isReady = true;
      this.readyCallbacks.forEach(callback => callback());
      this.readyCallbacks = [];
    }
  }

  onReady(callback: () => void): void {
    if (this.isReady) {
      callback();
    } else {
      this.readyCallbacks.push(callback);
    }
  }

  async setMode(mode: 'mock' | 'firebase' | 'supabase', baseUrl?: string, apiKey?: string): Promise<void> {
    console.log('DataServiceManager: Setting mode to:', mode);
    this.currentMode = mode;
    
    if (mode === 'mock') {
      await this._initializeMock();
    } else if (mode === 'firebase') {
      if (!baseUrl) {
        throw new Error('Base URL is required for Firebase mode');
      }
      // Firebase mode placeholder - use mock for now
      console.warn("Firebase mode is not yet implemented, falling back to mock");
      await this._initializeMock();
    } else if (mode === 'supabase') {
      await this._initializeSupabase();
    }
  }

  private async _initializeMock(): Promise<void> {
    console.log('DataServiceManager: Initializing mock repositories');
    const mock = await import('./mock');
    
    this.customers = mock.mockDataService.customers;
    this.orders = mock.mockDataService.orders;
    this.settings = mock.mockDataService.settings;
    this.baker = mock.mockDataService.baker;
    this.gallery = mock.mockDataService.gallery;
    
    console.log('DataServiceManager: Mock repositories initialized successfully');
  }

  private async _initializeSupabase(): Promise<void> {
    console.log('DataServiceManager: Initializing Supabase repositories');
    
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase is not properly configured');
    }

    // Import all repositories with retry logic
    const [
      mock,
      { SupabaseGalleryRepository },
      { SupabaseCustomerRepository },
      { SupabaseOrderRepository },
      { SupabaseSettingsRepository },
      { SupabaseBakerRepository }
    ] = await Promise.all([
      import('./mock'),
      import('./repositories/supabase/gallery.repository'),
      import('./repositories/supabase/customer.repository'),
      import('./repositories/supabase/order.repository'),
      import('./repositories/supabase/settings.repository'),
      import('./repositories/supabase/baker.repository')
    ]);

    // Initialize Supabase repositories
    this.customers = new SupabaseCustomerRepository();
    this.gallery = new SupabaseGalleryRepository();
    this.orders = new SupabaseOrderRepository();
    this.settings = new SupabaseSettingsRepository();
    this.baker = new SupabaseBakerRepository();
    
    console.log('DataServiceManager: Supabase repositories initialized successfully');
  }
}

// Create singleton instance
export const dataServiceManager = new DataServiceManagerImpl();

// Legacy export for backwards compatibility
export const dataService = dataServiceManager;
export const currentMode = dataServiceManager.currentMode;
