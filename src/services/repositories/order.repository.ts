
import { Order, OrderStatus } from "@/types";
import { BaseRepository } from "./base.repository";

export interface OrderRepository extends BaseRepository<Order> {
  getByStatus(status: OrderStatus): Promise<Order[]>;
  getByCustomerId(customerId: string): Promise<Order[]>;
  getByTimeFrame(timeFrame: 'today' | 'this-week' | 'this-month'): Promise<Order[]>;
}

export class MockOrderRepository implements OrderRepository {
  private orders: Order[] = [];

  constructor(initialData: Order[] = []) {
    this.orders = [...initialData];
    
    // Transform any legacy data
    this.orders = this.orders.map(order => {
      // Handle conversion from totalPrice to cakePrice
      if (!order.cakePrice && (order as any).totalPrice) {
        return {
          ...order,
          cakePrice: (order as any).totalPrice
        };
      }
      return order;
    });
  }

  async getAll(): Promise<Order[]> {
    return [...this.orders];
  }

  async getById(id: string): Promise<Order | undefined> {
    return this.orders.find(order => order.id === id);
  }

  async create(order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<Order> {
    const now = new Date();
    const newOrder = {
      ...order,
      id: `o${this.orders.length + 1}`,
      createdAt: now,
      updatedAt: now,
    };
    this.orders.unshift(newOrder); // Add to the beginning for newest first
    return newOrder;
  }

  async update(id: string, order: Partial<Order>): Promise<Order> {
    const index = this.orders.findIndex(o => o.id === id);
    if (index === -1) throw new Error(`Order with id ${id} not found`);
    
    this.orders[index] = {
      ...this.orders[index],
      ...order,
      updatedAt: new Date()
    };
    
    return this.orders[index];
  }

  async delete(id: string): Promise<boolean> {
    const initialLength = this.orders.length;
    this.orders = this.orders.filter(o => o.id !== id);
    return initialLength !== this.orders.length;
  }

  async getByStatus(status: OrderStatus): Promise<Order[]> {
    return this.orders.filter(order => order.status === status);
  }

  async getByCustomerId(customerId: string): Promise<Order[]> {
    return this.orders.filter(order => order.customer.id === customerId);
  }

  async getByTimeFrame(timeFrame: 'today' | 'this-week' | 'this-month'): Promise<Order[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return this.orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      orderDate.setHours(0, 0, 0, 0);

      if (timeFrame === 'today') {
        return orderDate.getTime() === today.getTime();
      }
      
      if (timeFrame === 'this-week') {
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        return orderDate >= startOfWeek;
      }
      
      if (timeFrame === 'this-month') {
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        return orderDate >= startOfMonth;
      }

      return true;
    });
  }
}
