import { BakingTask, CakeInventoryItem, ProductionLogEntry } from '@/types/baker';
import { BaseRepository } from './base.repository';
import { Order } from '@/types';

export interface BakerRepository extends BaseRepository<BakingTask> {
  getCakeInventory(): Promise<CakeInventoryItem[]>;
  getProductionLog(): Promise<ProductionLogEntry[]>;
  createProductionEntry(entry: Omit<ProductionLogEntry, 'id'>): Promise<ProductionLogEntry>;
  updateInventory(item: Partial<CakeInventoryItem> & { id: string }): Promise<CakeInventoryItem>;
  aggregateOrdersIntoTasks(orders: Order[]): Promise<BakingTask[]>;
}

export class MockBakerRepository implements BakerRepository {
  private bakingTasks: BakingTask[] = [];
  private cakeInventory: CakeInventoryItem[] = [];
  private productionLog: ProductionLogEntry[] = [];

  constructor(initialData: { 
    bakingTasks?: BakingTask[],
    cakeInventory?: CakeInventoryItem[],
    productionLog?: ProductionLogEntry[]
  } = {}) {
    this.bakingTasks = initialData.bakingTasks || [
      {
        id: 'task1',
        cakeShape: 'Round',
        cakeSize: '16 CM',
        cakeFlavor: 'Vanilla',
        quantity: 4,
        quantityCompleted: 0,
        dueDate: new Date(Date.now() + 86400000), // Tomorrow
        createdAt: new Date(),
        status: 'pending'
      },
      {
        id: 'task2',
        cakeShape: 'Square',
        cakeSize: '18 CM',
        cakeFlavor: 'Chocolate',
        quantity: 3,
        quantityCompleted: 1,
        dueDate: new Date(Date.now() + 172800000), // Day after tomorrow
        createdAt: new Date(),
        status: 'in-progress'
      }
    ];
    
    this.cakeInventory = initialData.cakeInventory || [
      {
        id: 'inv1',
        cakeShape: 'Round',
        cakeSize: '16 CM',
        cakeFlavor: 'Vanilla',
        quantity: 2,
        lastUpdated: new Date()
      },
      {
        id: 'inv2',
        cakeShape: 'Square',
        cakeSize: '18 CM',
        cakeFlavor: 'Chocolate',
        quantity: 1,
        lastUpdated: new Date()
      }
    ];
    
    this.productionLog = initialData.productionLog || [
      {
        id: 'log1',
        cakeShape: 'Round',
        cakeSize: '16 CM',
        cakeFlavor: 'Vanilla',
        quantity: 2,
        completedAt: new Date(Date.now() - 86400000), // Yesterday
        baker: 'John Doe',
        qualityChecks: {
          properlyBaked: true,
          correctSize: true,
          goodTexture: true
        },
        notes: 'Good batch',
        taskId: 'task1'
      }
    ];
  }

  async getAll(): Promise<BakingTask[]> {
    return [...this.bakingTasks];
  }

  async getById(id: string): Promise<BakingTask | undefined> {
    return this.bakingTasks.find(task => task.id === id);
  }

  async create(task: Omit<BakingTask, 'id'>): Promise<BakingTask> {
    const newTask = {
      ...task,
      id: `task${this.bakingTasks.length + 1}`,
      createdAt: new Date()
    };
    this.bakingTasks.push(newTask);
    return newTask;
  }

  async update(id: string, task: Partial<BakingTask>): Promise<BakingTask> {
    const index = this.bakingTasks.findIndex(t => t.id === id);
    if (index === -1) throw new Error(`Task with id ${id} not found`);
    
    this.bakingTasks[index] = {
      ...this.bakingTasks[index],
      ...task,
      updatedAt: new Date()
    };
    
    return this.bakingTasks[index];
  }

  async delete(id: string): Promise<boolean> {
    const initialLength = this.bakingTasks.length;
    this.bakingTasks = this.bakingTasks.filter(t => t.id !== id);
    return initialLength !== this.bakingTasks.length;
  }

  async getCakeInventory(): Promise<CakeInventoryItem[]> {
    return [...this.cakeInventory];
  }

  async getProductionLog(): Promise<ProductionLogEntry[]> {
    return [...this.productionLog].sort((a, b) => 
      b.completedAt.getTime() - a.completedAt.getTime()
    );
  }

  async createProductionEntry(entry: Omit<ProductionLogEntry, 'id'>): Promise<ProductionLogEntry> {
    const newEntry = {
      ...entry,
      id: `log${this.productionLog.length + 1}`,
    };
    this.productionLog.push(newEntry);
    
    // Update inventory
    const inventoryItem = this.cakeInventory.find(
      item => item.cakeShape === entry.cakeShape && 
      item.cakeSize === entry.cakeSize && 
      item.cakeFlavor === entry.cakeFlavor
    );
    
    if (inventoryItem) {
      inventoryItem.quantity += entry.quantity;
      inventoryItem.lastUpdated = new Date();
    } else {
      this.cakeInventory.push({
        id: `inv${this.cakeInventory.length + 1}`,
        cakeShape: entry.cakeShape,
        cakeSize: entry.cakeSize,
        cakeFlavor: entry.cakeFlavor,
        quantity: entry.quantity,
        lastUpdated: new Date()
      });
    }
    
    // Update task completion status
    const task = this.bakingTasks.find(t => t.id === entry.taskId);
    if (task) {
      task.quantityCompleted += entry.quantity;
      if (task.quantityCompleted >= task.quantity) {
        task.status = 'completed';
      } else if (task.status === 'pending') {
        task.status = 'in-progress';
      }
      task.updatedAt = new Date();
    }
    
    return newEntry;
  }

  async updateInventory(item: Partial<CakeInventoryItem> & { id: string }): Promise<CakeInventoryItem> {
    const index = this.cakeInventory.findIndex(i => i.id === item.id);
    if (index === -1) throw new Error(`Inventory item with id ${item.id} not found`);
    
    this.cakeInventory[index] = {
      ...this.cakeInventory[index],
      ...item,
      lastUpdated: new Date()
    };
    
    return this.cakeInventory[index];
  }
  
  async aggregateOrdersIntoTasks(orders: Order[]): Promise<BakingTask[]> {
    // Group orders by cake specifications
    const groupedOrders: Record<string, { orders: Order[], earliestDate: Date }> = {};
    
    orders.filter(order => order.status === 'in-queue' || 
                           (order.status === 'in-kitchen' && 
                            order.kitchenStatus === 'waiting-baker'))
          .forEach(order => {
            const key = `${order.cakeShape}-${order.cakeSize}-${order.cakeFlavor}`;
            
            if (!groupedOrders[key]) {
              groupedOrders[key] = { 
                orders: [], 
                earliestDate: new Date(order.deliveryDate) 
              };
            }
            
            groupedOrders[key].orders.push(order);
            
            // Keep track of earliest delivery date
            const orderDate = new Date(order.deliveryDate);
            if (orderDate < groupedOrders[key].earliestDate) {
              groupedOrders[key].earliestDate = orderDate;
            }
          });
    
    // Create tasks from grouped orders
    const tasks: BakingTask[] = [];
    Object.entries(groupedOrders).forEach(([key, { orders, earliestDate }], index) => {
      const [cakeShape, cakeSize, cakeFlavor] = key.split('-');
      
      // Check if task already exists for these specifications
      const existingTaskIndex = this.bakingTasks.findIndex(
        t => t.cakeShape === cakeShape && 
        t.cakeSize === cakeSize && 
        t.cakeFlavor === cakeFlavor &&
        t.status !== 'completed'
      );
      
      if (existingTaskIndex >= 0) {
        // Update existing task
        const orderIds = orders.map(o => o.id);
        const existingTask = this.bakingTasks[existingTaskIndex];
        
        // Combine order IDs, avoiding duplicates
        const combinedOrderIds = [...new Set([
          ...(existingTask.orderIds || []),
          ...orderIds
        ])];
        
        // Update quantity if needed based on new orders
        const updatedTask = {
          ...existingTask,
          quantity: Math.max(existingTask.quantity, orders.length),
          orderIds: combinedOrderIds,
          dueDate: earliestDate < existingTask.dueDate ? earliestDate : existingTask.dueDate,
          updatedAt: new Date()
        };
        
        this.bakingTasks[existingTaskIndex] = updatedTask;
        tasks.push(updatedTask);
      } else {
        // Create new task
        const newTask: BakingTask = {
          id: `task${this.bakingTasks.length + index + 1}`,
          cakeShape,
          cakeSize,
          cakeFlavor,
          quantity: orders.length,
          quantityCompleted: 0,
          dueDate: earliestDate,
          createdAt: new Date(),
          status: 'pending',
          orderIds: orders.map(o => o.id)
        };
        
        this.bakingTasks.push(newTask);
        tasks.push(newTask);
      }
    });
    
    return tasks;
  }
}
