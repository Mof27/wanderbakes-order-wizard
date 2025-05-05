
import { Order, OrderStatus, PrintEvent, OrderLogEvent, CakeRevision } from "@/types";
import { BaseRepository } from "./base.repository";

export interface OrderRepository extends BaseRepository<Order> {
  getByStatus(status: OrderStatus): Promise<Order[]>;
  getByCustomerId(customerId: string): Promise<Order[]>;
  getByTimeFrame(timeFrame: 'today' | 'this-week' | 'this-month'): Promise<Order[]>;
  updatePrintHistory(orderId: string, printEvent: PrintEvent): Promise<Order>;
  addOrderLog(orderId: string, logEvent: Omit<OrderLogEvent, 'id'>): Promise<Order>;
  addRevision(orderId: string, revision: Omit<CakeRevision, 'id'>): Promise<Order>; // New method
}

export class MockOrderRepository implements OrderRepository {
  private orders: Order[] = [];

  constructor(initialData: Order[] = []) {
    // First, transform any legacy data
    const transformedOrders = initialData.map(order => {
      // Handle conversion from totalPrice to cakePrice
      let updatedOrder = order;
      if (!updatedOrder.cakePrice && (updatedOrder as any).totalPrice) {
        updatedOrder = {
          ...updatedOrder,
          cakePrice: (updatedOrder as any).totalPrice
        };
      }
      
      // Ensure printHistory exists
      if (!updatedOrder.printHistory) {
        updatedOrder = {
          ...updatedOrder,
          printHistory: []
        };
      }
      
      // Convert old order ID format (o1, o2, etc.) to the new MM-YY-XXX format
      if (updatedOrder.id && (updatedOrder.id.startsWith('o') || !updatedOrder.id.includes('-'))) {
        const createdAt = updatedOrder.createdAt || new Date();
        const month = String(createdAt.getMonth() + 1).padStart(2, '0');
        const year = String(createdAt.getFullYear()).slice(-2);
        
        // Extract number from old format or use index if not available
        let sequenceNum = 1;
        if (updatedOrder.id.startsWith('o')) {
          sequenceNum = parseInt(updatedOrder.id.substring(1)) || 1;
        }
        
        const sequence = String(sequenceNum).padStart(3, '0');
        updatedOrder = {
          ...updatedOrder,
          id: `${month}-${year}-${sequence}`
        };
      }
      
      return updatedOrder;
    });
    
    // Sort by createdAt to ensure newer orders come first
    this.orders = transformedOrders.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getAll(): Promise<Order[]> {
    return [...this.orders];
  }

  async getById(id: string): Promise<Order | undefined> {
    return this.orders.find(order => order.id === id);
  }

  async create(order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<Order> {
    const now = new Date();
    
    // Generate a month-year based ID: MM-YY-XXX
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = String(now.getFullYear()).slice(-2);
    
    // Count existing orders in this month/year to determine the sequence number
    const monthYearPrefix = `${month}-${year}`;
    const existingOrdersThisMonth = this.orders.filter(o => 
      o.id.startsWith(monthYearPrefix)
    ).length;
    
    // Create sequence number with padding (e.g., 001, 002, etc.)
    const sequence = String(existingOrdersThisMonth + 1).padStart(3, '0');
    const orderId = `${monthYearPrefix}-${sequence}`;
    
    const newOrder = {
      ...order,
      id: orderId,
      createdAt: now,
      updatedAt: now,
      printHistory: []
    };
    
    this.orders.unshift(newOrder); // Add to the beginning for newest first
    return newOrder;
  }

  async update(id: string, order: Partial<Order>): Promise<Order> {
    const index = this.orders.findIndex(o => o.id === id);
    if (index === -1) throw new Error(`Order with id ${id} not found`);
    
    // Track status change in logs if status is changing
    const existingOrder = this.orders[index];
    if (order.status && order.status !== existingOrder.status) {
      // Initialize logs array if it doesn't exist
      const orderLogs = existingOrder.orderLogs || [];
      
      // Add log entry for status change
      orderLogs.push({
        id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        timestamp: new Date(),
        type: 'status-change',
        previousStatus: existingOrder.status,
        newStatus: order.status,
      });
      
      // Include updated logs in the order update
      order.orderLogs = orderLogs;
    }
    
    this.orders[index] = {
      ...this.orders[index],
      ...order,
      updatedAt: new Date()
    };
    
    return this.orders[index];
  }

  async updatePrintHistory(orderId: string, printEvent: PrintEvent): Promise<Order> {
    const index = this.orders.findIndex(o => o.id === orderId);
    if (index === -1) throw new Error(`Order with id ${orderId} not found`);
    
    // Get existing print history or initialize empty array
    const printHistory = [...(this.orders[index].printHistory || []), printEvent];
    
    // Add log entry for print event
    const orderLogs = [...(this.orders[index].orderLogs || [])];
    orderLogs.push({
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      timestamp: new Date(),
      type: 'print',
      note: `Printed ${printEvent.type}`,
      metadata: { printEvent }
    });
    
    this.orders[index] = {
      ...this.orders[index],
      printHistory,
      orderLogs,
      updatedAt: new Date()
    };
    
    return this.orders[index];
  }
  
  async addOrderLog(orderId: string, logEvent: Omit<OrderLogEvent, 'id'>): Promise<Order> {
    const index = this.orders.findIndex(o => o.id === orderId);
    if (index === -1) throw new Error(`Order with id ${orderId} not found`);
    
    // Generate ID for the log event
    const logId = `log_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    // Get existing logs or initialize empty array
    const orderLogs = [...(this.orders[index].orderLogs || [])];
    
    // Add new log event
    orderLogs.push({
      ...logEvent,
      id: logId
    });
    
    // Update order with new logs
    this.orders[index] = {
      ...this.orders[index],
      orderLogs,
      updatedAt: new Date()
    };
    
    return this.orders[index];
  }
  
  async addRevision(orderId: string, revision: Omit<CakeRevision, 'id'>): Promise<Order> {
    const index = this.orders.findIndex(o => o.id === orderId);
    if (index === -1) throw new Error(`Order with id ${orderId} not found`);
    
    // Generate ID for the revision
    const revisionId = `rev_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    // Get existing revisions or initialize empty array
    const revisionHistory = [...(this.orders[index].revisionHistory || [])];
    
    // Add new revision event
    revisionHistory.push({
      ...revision,
      id: revisionId
    });
    
    // Update revisionCount
    const revisionCount = (this.orders[index].revisionCount || 0) + 1;
    
    // Update order with new revision history
    this.orders[index] = {
      ...this.orders[index],
      revisionHistory,
      revisionCount,
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
