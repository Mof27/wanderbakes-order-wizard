import React, { createContext, useState, useContext, ReactNode, useEffect } from "react";
import { Customer, FilterOption, Order, ViewMode, DriverType } from "../types";
import { DeliveryTrip, OrderSelectionState } from "../types/trip";
import { statusFilterOptions, timeFilterOptions } from "../data/mockData";
import { toast } from "@/components/ui/sonner";
import { dataService } from "@/services";

interface AppContextProps {
  customers: Customer[];
  orders: Order[];
  trips: DeliveryTrip[];
  activeStatusFilter: FilterOption;
  activeTimeFilter: FilterOption;
  viewMode: ViewMode;
  searchQuery: string;
  dateRange: [Date | null, Date | null];
  activeStatusFilters: FilterOption[];
  orderSelection: OrderSelectionState;
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt'>) => Promise<Customer>;
  updateCustomer: (customer: Customer) => Promise<Customer>;
  findCustomerByWhatsApp: (whatsappNumber: string) => Promise<Customer | undefined>;
  addOrder: (order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Order>;
  updateOrder: (order: Order) => Promise<void>;
  deleteOrder: (orderId: string) => Promise<void>;
  createTrip: (trip: Omit<DeliveryTrip, 'id' | 'createdAt' | 'updatedAt'>) => Promise<DeliveryTrip>;
  updateTrip: (trip: DeliveryTrip) => Promise<void>;
  deleteTrip: (tripId: string) => Promise<void>;
  getTripForOrder: (orderId: string) => Promise<DeliveryTrip | undefined>;
  setActiveStatusFilter: (filter: FilterOption) => void;
  setActiveTimeFilter: (filter: FilterOption) => void;
  setViewMode: (mode: ViewMode) => void;
  setSearchQuery: (query: string) => void;
  setDateRange: (range: [Date | null, Date | null]) => void;
  setActiveStatusFilters: (filters: FilterOption[]) => void;
  resetFilters: () => void;
  toggleOrderSelection: (orderId: string) => void;
  toggleSelectionMode: () => void;
  clearOrderSelection: () => void;
  filteredOrders: Order[];
  isLoading: boolean;
  getOrderById: (id: string) => Order | undefined;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [trips, setTrips] = useState<DeliveryTrip[]>([]);
  const [activeStatusFilter, setActiveStatusFilter] = useState<FilterOption>(statusFilterOptions[0]);
  const [activeTimeFilter, setActiveTimeFilter] = useState<FilterOption>(timeFilterOptions[0]);
  const [activeStatusFilters, setActiveStatusFilters] = useState<FilterOption[]>([statusFilterOptions[0]]);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [orderSelection, setOrderSelection] = useState<OrderSelectionState>({
    selectedOrderIds: [],
    isSelectionMode: false
  });

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const customersData = await dataService.customers.getAll();
        const ordersData = await dataService.orders.getAll();
        const tripsData = await dataService.trips.getAll();
        
        setCustomers(customersData);
        setOrders(ordersData);
        setTrips(tripsData);
      } catch (error) {
        console.error("Failed to load initial data:", error);
        toast.error("Failed to load data");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadInitialData();
  }, []);

  // Reset all filters to default values
  const resetFilters = () => {
    setActiveStatusFilter(statusFilterOptions[0]);
    setActiveTimeFilter(timeFilterOptions[0]);
    setActiveStatusFilters([statusFilterOptions[0]]);
    setDateRange([null, null]);
    setSearchQuery('');
  };

  // Order selection functions
  const toggleOrderSelection = (orderId: string) => {
    setOrderSelection(prev => {
      const selectedOrderIds = prev.selectedOrderIds.includes(orderId)
        ? prev.selectedOrderIds.filter(id => id !== orderId)
        : [...prev.selectedOrderIds, orderId];
      
      return {
        ...prev,
        selectedOrderIds
      };
    });
  };

  const toggleSelectionMode = () => {
    setOrderSelection(prev => ({
      ...prev,
      isSelectionMode: !prev.isSelectionMode,
      selectedOrderIds: prev.isSelectionMode ? [] : prev.selectedOrderIds
    }));
  };

  const clearOrderSelection = () => {
    setOrderSelection(prev => ({
      ...prev,
      selectedOrderIds: []
    }));
  };

  // Customer functions
  const addCustomer = async (customerData: Omit<Customer, 'id' | 'createdAt'>) => {
    try {
      const newCustomer = await dataService.customers.create(customerData);
      setCustomers(prevCustomers => [...prevCustomers, newCustomer]);
      toast.success("Customer added successfully");
      return newCustomer;
    } catch (error) {
      console.error("Failed to add customer:", error);
      toast.error("Failed to add customer");
      throw error;
    }
  };

  const updateCustomer = async (updatedCustomer: Customer) => {
    try {
      const result = await dataService.customers.update(updatedCustomer.id, updatedCustomer);
      setCustomers(prevCustomers => 
        prevCustomers.map(customer => 
          customer.id === updatedCustomer.id ? result : customer
        )
      );
      toast.success("Customer updated successfully");
      return result;
    } catch (error) {
      console.error("Failed to update customer:", error);
      toast.error("Failed to update customer");
      throw error;
    }
  };

  const findCustomerByWhatsApp = async (whatsappNumber: string) => {
    return await dataService.customers.findByWhatsApp(whatsappNumber);
  };

  // Order functions
  const addOrder = async (orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newOrder = await dataService.orders.create(orderData);
      setOrders(prevOrders => [newOrder, ...prevOrders]);
      toast.success("Order created successfully");
      return newOrder;
    } catch (error) {
      console.error("Failed to add order:", error);
      toast.error("Failed to add order");
      throw error;
    }
  };

  const updateOrder = async (updatedOrder: Order) => {
    try {
      await dataService.orders.update(updatedOrder.id, updatedOrder);
      setOrders(prevOrders =>
        prevOrders.map(order => {
          if (order.id === updatedOrder.id) {
            return { ...updatedOrder, updatedAt: new Date() };
          }
          return order;
        })
      );
      toast.success("Order updated successfully");
    } catch (error) {
      console.error("Failed to update order:", error);
      toast.error("Failed to update order");
      throw error;
    }
  };

  const deleteOrder = async (orderId: string) => {
    try {
      await dataService.orders.delete(orderId);
      setOrders(prevOrders => prevOrders.filter(order => order.id !== orderId));
      toast.success("Order deleted successfully");
    } catch (error) {
      console.error("Failed to delete order:", error);
      toast.error("Failed to delete order");
      throw error;
    }
  };

  // Get a specific order by ID
  const getOrderById = (id: string): Order | undefined => {
    return orders.find(order => order.id === id);
  };

  // Trip functions
  const createTrip = async (tripData: Omit<DeliveryTrip, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newTrip = await dataService.trips.create(tripData);
      setTrips(prevTrips => [...prevTrips, newTrip]);
      toast.success("Trip created successfully");
      return newTrip;
    } catch (error) {
      console.error("Failed to create trip:", error);
      toast.error("Failed to create trip");
      throw error;
    }
  };

  const updateTrip = async (updatedTrip: DeliveryTrip) => {
    try {
      await dataService.trips.update(updatedTrip.id, updatedTrip);
      setTrips(prevTrips =>
        prevTrips.map(trip => {
          if (trip.id === updatedTrip.id) {
            return { ...updatedTrip, updatedAt: new Date() };
          }
          return trip;
        })
      );
      toast.success("Trip updated successfully");
    } catch (error) {
      console.error("Failed to update trip:", error);
      toast.error("Failed to update trip");
      throw error;
    }
  };

  const deleteTrip = async (tripId: string) => {
    try {
      await dataService.trips.delete(tripId);
      setTrips(prevTrips => prevTrips.filter(trip => trip.id !== tripId));
      toast.success("Trip deleted successfully");
    } catch (error) {
      console.error("Failed to delete trip:", error);
      toast.error("Failed to delete trip");
      throw error;
    }
  };

  const getTripForOrder = async (orderId: string): Promise<DeliveryTrip | undefined> => {
    try {
      return await dataService.trips.getByOrderId(orderId);
    } catch (error) {
      console.error("Failed to get trip for order:", error);
      return undefined;
    }
  };

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    // Search query filtering
    if (searchQuery && !order.id.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !order.customer.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    // Status filtering - now using single-select status filter
    if (activeStatusFilter.value !== 'all' && order.status !== activeStatusFilter.value) {
      return false;
    }

    // Date range filtering
    if (dateRange[0] && dateRange[1]) {
      const orderDate = new Date(order.createdAt);
      const startDate = new Date(dateRange[0]);
      const endDate = new Date(dateRange[1]);
      
      // Set time to beginning and end of day for proper comparison
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
      
      if (orderDate < startDate || orderDate > endDate) {
        return false;
      }
    }

    return true;
  });

  const value = {
    customers,
    orders,
    trips,
    activeStatusFilter,
    activeTimeFilter,
    viewMode,
    searchQuery,
    dateRange,
    activeStatusFilters,
    orderSelection,
    addCustomer,
    updateCustomer,
    findCustomerByWhatsApp,
    addOrder,
    updateOrder,
    deleteOrder,
    createTrip,
    updateTrip,
    deleteTrip,
    getTripForOrder,
    setActiveStatusFilter,
    setActiveTimeFilter,
    setViewMode,
    setSearchQuery,
    setDateRange,
    setActiveStatusFilters,
    resetFilters,
    toggleOrderSelection,
    toggleSelectionMode,
    clearOrderSelection,
    filteredOrders,
    isLoading,
    getOrderById,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = (): AppContextProps => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
