import React, { createContext, useState, useContext, ReactNode, useEffect } from "react";
import { Customer, FilterOption, Order, ViewMode } from "../types";
import { statusFilterOptions, timeFilterOptions } from "../data/mockData";
import { toast } from "@/components/ui/sonner";
import { dataService } from "@/services";

interface AppContextProps {
  customers: Customer[];
  orders: Order[];
  activeStatusFilter: FilterOption;
  activeTimeFilter: FilterOption;
  viewMode: ViewMode;
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt'>) => Promise<Customer>;
  updateCustomer: (customer: Customer) => Promise<Customer>;
  findCustomerByWhatsApp: (whatsappNumber: string) => Promise<Customer | undefined>;
  addOrder: (order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Order>;
  updateOrder: (order: Order) => Promise<void>;
  deleteOrder: (orderId: string) => Promise<void>;
  setActiveStatusFilter: (filter: FilterOption) => void;
  setActiveTimeFilter: (filter: FilterOption) => void;
  setViewMode: (mode: ViewMode) => void;
  filteredOrders: Order[];
  isLoading: boolean;
  getOrderById: (id: string) => Order | undefined;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeStatusFilter, setActiveStatusFilter] = useState<FilterOption>(statusFilterOptions[0]);
  const [activeTimeFilter, setActiveTimeFilter] = useState<FilterOption>(timeFilterOptions[0]);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const customersData = await dataService.customers.getAll();
        const ordersData = await dataService.orders.getAll();
        
        setCustomers(customersData);
        setOrders(ordersData);
      } catch (error) {
        console.error("Failed to load initial data:", error);
        toast.error("Failed to load data");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadInitialData();
  }, []);

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

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    // Status filtering
    if (activeStatusFilter.value !== 'all' && order.status !== activeStatusFilter.value) {
      return false;
    }

    // Time filtering
    if (activeTimeFilter.value !== 'all') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const orderDate = new Date(order.createdAt);
      orderDate.setHours(0, 0, 0, 0);

      if (activeTimeFilter.value === 'today' && orderDate.getTime() !== today.getTime()) {
        return false;
      }

      if (activeTimeFilter.value === 'this-week') {
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        if (orderDate < startOfWeek) {
          return false;
        }
      }

      if (activeTimeFilter.value === 'this-month') {
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        if (orderDate < startOfMonth) {
          return false;
        }
      }
    }

    return true;
  });

  const value = {
    customers,
    orders,
    activeStatusFilter,
    activeTimeFilter,
    viewMode,
    addCustomer,
    updateCustomer,
    findCustomerByWhatsApp,
    addOrder,
    updateOrder,
    deleteOrder,
    setActiveStatusFilter,
    setActiveTimeFilter,
    setViewMode,
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
