import React, { createContext, useState, useContext, ReactNode, useEffect } from "react";
import { ActivityAction, ActivityLog, Customer, FilterOption, Order, OrderStatus, ViewMode } from "../types";
import { statusFilterOptions, timeFilterOptions } from "../data/mockData";
import { toast } from "@/components/ui/sonner";
import { dataService } from "@/services";

interface AppContextProps {
  customers: Customer[];
  orders: Order[];
  activeStatusFilter: FilterOption;
  activeTimeFilter: FilterOption;
  viewMode: ViewMode;
  searchQuery: string;
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt'>) => Promise<Customer>;
  updateCustomer: (customer: Customer) => Promise<Customer>;
  findCustomerByWhatsApp: (whatsappNumber: string) => Promise<Customer | undefined>;
  addOrder: (order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Order>;
  updateOrder: (order: Order) => Promise<void>;
  deleteOrder: (orderId: string) => Promise<void>;
  setActiveStatusFilter: (filter: FilterOption) => void;
  setActiveTimeFilter: (filter: FilterOption) => void;
  setViewMode: (mode: ViewMode) => void;
  setSearchQuery: (query: string) => void;
  filteredOrders: Order[];
  isLoading: boolean;
  getOrderById: (id: string) => Order | undefined;
  logs: ActivityLog[];
  activeUser: string;
  setActiveUser: (userName: string) => void;
  getLogs: () => Promise<ActivityLog[]>;
  getLogsByEntityId: (entityId: string) => Promise<ActivityLog[]>;
  getLogsByAction: (action: ActivityAction) => Promise<ActivityLog[]>;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeStatusFilter, setActiveStatusFilter] = useState<FilterOption>(statusFilterOptions[0]);
  const [activeTimeFilter, setActiveTimeFilter] = useState<FilterOption>(timeFilterOptions[0]);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [activeUser, setActiveUser] = useState<string>(localStorage.getItem('activeUser') || 'Admin');
  
  // Save active user to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('activeUser', activeUser);
  }, [activeUser]);

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const customersData = await dataService.customers.getAll();
        const ordersData = await dataService.orders.getAll();
        const logsData = await dataService.logs.getAll();
        
        setCustomers(customersData);
        setOrders(ordersData);
        setLogs(logsData);
      } catch (error) {
        console.error("Failed to load initial data:", error);
        toast.error("Failed to load data");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadInitialData();
  }, []);

  // Log creation utility
  const createActivityLog = async (
    action: ActivityAction,
    entityType: 'order' | 'customer',
    entityId: string,
    details?: { field?: string; previousValue?: any; newValue?: any }
  ) => {
    try {
      const newLog = await dataService.logs.create({
        action,
        entityType,
        entityId,
        userName: activeUser,
        details
      });
      
      setLogs(prevLogs => [newLog, ...prevLogs]);
      return newLog;
    } catch (error) {
      console.error("Failed to log activity:", error);
      return null;
    }
  };

  // Customer functions
  const addCustomer = async (customerData: Omit<Customer, 'id' | 'createdAt'>) => {
    try {
      const newCustomer = await dataService.customers.create(customerData);
      setCustomers(prevCustomers => [...prevCustomers, newCustomer]);
      
      // Log customer creation
      await createActivityLog('create', 'customer', newCustomer.id);
      
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
      const oldCustomer = customers.find(c => c.id === updatedCustomer.id);
      const result = await dataService.customers.update(updatedCustomer.id, updatedCustomer);
      setCustomers(prevCustomers => 
        prevCustomers.map(customer => 
          customer.id === updatedCustomer.id ? result : customer
        )
      );
      
      // Log customer update
      await createActivityLog('update', 'customer', updatedCustomer.id, {
        field: 'customer',
        previousValue: oldCustomer,
        newValue: result
      });
      
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
      
      // Log order creation
      await createActivityLog('create', 'order', newOrder.id);
      
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
      const oldOrder = orders.find(o => o.id === updatedOrder.id);
      
      await dataService.orders.update(updatedOrder.id, updatedOrder);
      setOrders(prevOrders =>
        prevOrders.map(order => {
          if (order.id === updatedOrder.id) {
            return { ...updatedOrder, updatedAt: new Date() };
          }
          return order;
        })
      );
      
      // Check if status was changed
      if (oldOrder && oldOrder.status !== updatedOrder.status) {
        // Log status change specifically
        await createActivityLog('status-change', 'order', updatedOrder.id, {
          field: 'status',
          previousValue: oldOrder.status,
          newValue: updatedOrder.status
        });
      } else {
        // Log general update
        await createActivityLog('update', 'order', updatedOrder.id);
      }
      
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
      
      // Log order deletion
      await createActivityLog('delete', 'order', orderId);
      
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
    // Search query filtering
    if (searchQuery && !order.id.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

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
    searchQuery,
    addCustomer,
    updateCustomer,
    findCustomerByWhatsApp,
    addOrder,
    updateOrder,
    deleteOrder,
    setActiveStatusFilter,
    setActiveTimeFilter,
    setViewMode,
    setSearchQuery,
    filteredOrders,
    isLoading,
    getOrderById,
    logs,
    activeUser,
    setActiveUser,
    getLogs,
    getLogsByEntityId,
    getLogsByAction,
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
