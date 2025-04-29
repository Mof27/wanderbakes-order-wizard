
import React, { createContext, useState, useContext, ReactNode } from "react";
import { Customer, FilterOption, Order, ViewMode } from "../types";
import { mockCustomers, mockOrders, statusFilterOptions, timeFilterOptions } from "../data/mockData";
import { toast } from "@/components/ui/sonner";

interface AppContextProps {
  customers: Customer[];
  orders: Order[];
  activeStatusFilter: FilterOption;
  activeTimeFilter: FilterOption;
  viewMode: ViewMode;
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt'>) => Customer;
  updateCustomer: (customer: Customer) => void;
  findCustomerByWhatsApp: (whatsappNumber: string) => Customer | undefined;
  addOrder: (order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) => Order;
  updateOrder: (order: Order) => void;
  deleteOrder: (orderId: string) => void;
  setActiveStatusFilter: (filter: FilterOption) => void;
  setActiveTimeFilter: (filter: FilterOption) => void;
  setViewMode: (mode: ViewMode) => void;
  filteredOrders: Order[];
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers);
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [activeStatusFilter, setActiveStatusFilter] = useState<FilterOption>(statusFilterOptions[0]);
  const [activeTimeFilter, setActiveTimeFilter] = useState<FilterOption>(timeFilterOptions[0]);
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  // Customer functions
  const addCustomer = (customerData: Omit<Customer, 'id' | 'createdAt'>) => {
    const newCustomer = {
      ...customerData,
      id: `c${customers.length + 1}`,
      createdAt: new Date(),
    };
    setCustomers([...customers, newCustomer]);
    toast.success("Customer added successfully");
    return newCustomer;
  };

  const updateCustomer = (updatedCustomer: Customer) => {
    setCustomers(
      customers.map((customer) => 
        customer.id === updatedCustomer.id ? updatedCustomer : customer
      )
    );
    toast.success("Customer updated successfully");
  };

  const findCustomerByWhatsApp = (whatsappNumber: string) => {
    return customers.find((customer) => customer.whatsappNumber === whatsappNumber);
  };

  // Order functions
  const addOrder = (orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date();
    const newOrder = {
      ...orderData,
      id: `o${orders.length + 1}`,
      createdAt: now,
      updatedAt: now,
    };
    setOrders([newOrder, ...orders]);
    toast.success("Order created successfully");
    return newOrder;
  };

  const updateOrder = (updatedOrder: Order) => {
    setOrders(
      orders.map((order) => {
        if (order.id === updatedOrder.id) {
          return { ...updatedOrder, updatedAt: new Date() };
        }
        return order;
      })
    );
    toast.success("Order updated successfully");
  };

  const deleteOrder = (orderId: string) => {
    setOrders(orders.filter((order) => order.id !== orderId));
    toast.success("Order deleted successfully");
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
