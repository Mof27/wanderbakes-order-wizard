
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Order, Customer, DateRange, OrderStatus } from '@/types';
import { dataService } from '@/services';
import { toast } from 'sonner';
import { useAuth } from './AuthContext';

interface AppContextType {
  orders: Order[];
  customers: Customer[];
  dateRange: DateRange;
  setDateRange: (range: DateRange) => void;
  updateOrder: (order: Order) => Promise<void>;
  addOrder: (order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Order>;
  deleteOrder: (id: string) => Promise<void>;
  refreshOrders: () => Promise<void>;
  refreshCustomers: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const { profile } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [dateRange, setDateRange] = useState<DateRange>([null, null]);

  // Get current user display name for logging
  const getCurrentUserDisplayName = (): string => {
    if (!profile) {
      return "System";
    }
    return profile.display_name || profile.first_name || "Unknown User";
  };

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([refreshOrders(), refreshCustomers()]);
      } catch (error) {
        console.error('Failed to load initial data:', error);
        toast.error('Failed to load data');
      }
    };

    loadData();
  }, []);

  const refreshOrders = async () => {
    try {
      const fetchedOrders = await dataService.orders.getAll();
      setOrders(fetchedOrders);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      throw error;
    }
  };

  const refreshCustomers = async () => {
    try {
      const fetchedCustomers = await dataService.customers.getAll();
      setCustomers(fetchedCustomers);
    } catch (error) {
      console.error('Failed to fetch customers:', error);
      throw error;
    }
  };

  const updateOrder = async (updatedOrder: Order) => {
    try {
      // Check if status is changing to add user tracking
      const existingOrder = orders.find(o => o.id === updatedOrder.id);
      let orderToUpdate = updatedOrder;
      
      if (existingOrder && existingOrder.status !== updatedOrder.status) {
        // Status is changing, add user information to the log
        const orderLogs = [...(updatedOrder.orderLogs || [])];
        
        // Find the most recent status change log entry
        const recentStatusLog = orderLogs
          .filter(log => log.type === 'status-change')
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
        
        // Add user info to the most recent status change log if it doesn't have it
        if (recentStatusLog && !recentStatusLog.user) {
          recentStatusLog.user = getCurrentUserDisplayName();
        }
        
        orderToUpdate = {
          ...updatedOrder,
          orderLogs
        };
      }
      
      const result = await dataService.orders.update(updatedOrder.id, orderToUpdate);
      setOrders(prevOrders => 
        prevOrders.map(order => order.id === updatedOrder.id ? result : order)
      );
    } catch (error) {
      console.error('Failed to update order:', error);
      throw error;
    }
  };

  const addOrder = async (orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newOrder = await dataService.orders.create(orderData);
      setOrders(prevOrders => [newOrder, ...prevOrders]);
      return newOrder;
    } catch (error) {
      console.error('Failed to add order:', error);
      throw error;
    }
  };

  const deleteOrder = async (id: string) => {
    try {
      await dataService.orders.delete(id);
      setOrders(prevOrders => prevOrders.filter(order => order.id !== id));
    } catch (error) {
      console.error('Failed to delete order:', error);
      throw error;
    }
  };

  const value: AppContextType = {
    orders,
    customers,
    dateRange,
    setDateRange,
    updateOrder,
    addOrder,
    deleteOrder,
    refreshOrders,
    refreshCustomers,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
