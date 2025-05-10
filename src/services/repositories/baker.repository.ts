
import { BakingTask, CakeInventoryItem, ProductionLogEntry } from '@/types/baker';
import { BaseRepository } from './base.repository';
import { Order } from '@/types';

export interface BakerRepository extends BaseRepository<BakingTask> {
  getCakeInventory(): Promise<CakeInventoryItem[]>;
  getProductionLog(): Promise<ProductionLogEntry[]>;
  createProductionEntry(entry: Omit<ProductionLogEntry, 'id'>): Promise<ProductionLogEntry>;
  updateInventory(item: Partial<CakeInventoryItem> & { id: string }): Promise<CakeInventoryItem>;
  aggregateOrdersIntoTasks(orders: Order[]): Promise<BakingTask[]>;
  acknowledgeCancelledTask(taskId: string, notes?: string): Promise<ProductionLogEntry>;
  createManualTask(task: Pick<BakingTask, 'cakeShape' | 'cakeSize' | 'cakeFlavor' | 'quantity' | 'dueDate' | 'notes'>): Promise<BakingTask>;
  deleteManualTask(taskId: string): Promise<boolean>;
  cancelManualTask(taskId: string, reason: string): Promise<BakingTask>;
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
  
  async acknowledgeCancelledTask(taskId: string, notes?: string): Promise<ProductionLogEntry> {
    const task = await this.getById(taskId);
    if (!task) throw new Error(`Task with id ${taskId} not found`);
    
    if (task.status !== 'cancelled') {
      throw new Error('Can only acknowledge cancelled tasks');
    }

    // Create a production log entry for the cancelled task
    const newEntry: ProductionLogEntry = {
      id: `log${this.productionLog.length + 1}`,
      taskId: task.id,
      cakeShape: task.cakeShape,
      cakeSize: task.cakeSize,
      cakeFlavor: task.cakeFlavor,
      quantity: 0, // No cakes were produced
      completedAt: new Date(),
      cancelled: true,
      cancellationReason: task.cancellationReason,
      notes: notes || 'Task cancelled and acknowledged by baker',
      isManual: task.isManual
    };

    this.productionLog.push(newEntry);
    
    // Remove the task from the active tasks list
    await this.delete(taskId);
    
    return newEntry;
  }
  
  async createManualTask(taskData: Omit<BakingTask, 'id' | 'createdAt' | 'status' | 'quantityCompleted' | 'isManual'>): Promise<BakingTask> {
    // Create new task with isManual flag
    const newTask: BakingTask = {
      ...taskData,
      id: `task${this.bakingTasks.length + 1}_manual`,
      createdAt: new Date(),
      status: 'pending',
      quantityCompleted: 0,
      isManual: true,
      // We'll use today's date as due date for calculating priority
      dueDate: taskData.dueDate || new Date()
    };
    
    // Check if the delivery is today to set priority
    const today = new Date();
    if (newTask.dueDate && 
        newTask.dueDate.getDate() === today.getDate() &&
        newTask.dueDate.getMonth() === today.getMonth() &&
        newTask.dueDate.getFullYear() === today.getFullYear()) {
      newTask.isPriority = true;
    }
    
    this.bakingTasks.push(newTask);
    return newTask;
  }
  
  async deleteManualTask(taskId: string): Promise<boolean> {
    const task = await this.getById(taskId);
    if (!task) throw new Error(`Task with id ${taskId} not found`);
    
    if (!task.isManual) {
      throw new Error('Only manual tasks can be deleted');
    }
    
    // Create a log entry to track the deletion
    const deletionLog: ProductionLogEntry = {
      id: `log${this.productionLog.length + 1}`,
      taskId: task.id,
      cakeShape: task.cakeShape,
      cakeSize: task.cakeSize,
      cakeFlavor: task.cakeFlavor,
      quantity: 0,
      completedAt: new Date(),
      cancelled: true,
      cancellationReason: 'Manual task deleted by baker',
      notes: 'Task deleted manually',
      isManual: true
    };
    
    this.productionLog.push(deletionLog);
    
    // Remove from tasks
    return this.delete(taskId);
  }
  
  async cancelManualTask(taskId: string, reason: string): Promise<BakingTask> {
    const task = await this.getById(taskId);
    if (!task) throw new Error(`Task with id ${taskId} not found`);
    
    if (!task.isManual) {
      throw new Error('Only manual tasks can be cancelled this way');
    }
    
    // Update task status
    const updatedTask = await this.update(taskId, {
      status: 'cancelled',
      cancellationReason: reason || 'Cancelled by baker',
      updatedAt: new Date()
    });
    
    return updatedTask;
  }

  async aggregateOrdersIntoTasks(orders: Order[]): Promise<BakingTask[]> {
    // Only include orders that are "in-kitchen" AND "waiting-baker"
    const relevantOrders = orders.filter(order => 
      order.status === 'in-kitchen' && order.kitchenStatus === 'waiting-baker'
    );
    console.log("Filtered orders for baker tasks:", relevantOrders.length);

    // Track all order IDs that are currently in the system
    const currentOrderIds = relevantOrders.map(order => order.id);
    
    // First, handle tasks with orders that have been modified
    const tasksToUpdate: BakingTask[] = [];
    
    for (const task of this.bakingTasks) {
      if (!task.orderIds || task.status === 'completed' || task.status === 'cancelled') {
        continue;
      }

      // Check if any orders in this task have been modified or removed
      const modifiedOrderIds: string[] = [];
      
      for (const orderId of task.orderIds) {
        // Find the current order
        const currentOrder = relevantOrders.find(o => o.id === orderId);
        
        // If order doesn't exist anymore or specifications changed
        if (!currentOrder) {
          if (currentOrderIds.includes(orderId)) {
            // Order still exists but is no longer in the relevant status
            modifiedOrderIds.push(orderId);
          }
          continue;
        }
        
        // Check if cake specifications changed
        if (currentOrder.cakeShape !== task.cakeShape ||
            currentOrder.cakeSize !== task.cakeSize ||
            currentOrder.cakeFlavor !== task.cakeFlavor) {
          modifiedOrderIds.push(orderId);
        }
      }
      
      // If orders have been modified, cancel the task
      if (modifiedOrderIds.length > 0) {
        const remainingOrderIds = task.orderIds.filter(id => !modifiedOrderIds.includes(id));
        
        if (remainingOrderIds.length === 0) {
          // All orders in this task have been modified, cancel the task
          task.status = 'cancelled';
          task.cancellationReason = `Order${modifiedOrderIds.length > 1 ? 's' : ''} ${modifiedOrderIds.join(', ')} modified`;
          task.updatedAt = new Date();
          tasksToUpdate.push(task);
        } else {
          // Some orders have been modified, update the task with remaining orders
          task.orderIds = remainingOrderIds;
          task.quantity = remainingOrderIds.length;
          task.updatedAt = new Date();
          tasksToUpdate.push(task);
        }
      }
    }
    
    // Now process all current orders to create or update tasks
    const groupedOrders: Record<string, { orders: Order[], earliestDate: Date }> = {};
    
    relevantOrders.forEach(order => {
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
        t.status !== 'completed' &&
        t.status !== 'cancelled'
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
    
    // Update all tasks that needed modification
    for (const task of tasksToUpdate) {
      const index = this.bakingTasks.findIndex(t => t.id === task.id);
      if (index !== -1) {
        this.bakingTasks[index] = task;
      }
    }
    
    return tasks;
  }
}
