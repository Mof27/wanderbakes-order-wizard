import { BakingTask, CakeInventoryItem, ProductionLogEntry, QualityCheck } from '@/types/baker';
import { BakerRepository } from '../baker.repository';
import { SupabaseBaseRepository } from './base.repository';
import { Order } from '@/types';

// Helper functions for data conversion
const mapBakingTaskFromSupabase = (task: any): BakingTask => {
  return {
    id: task.id,
    cakeShape: task.cake_shape,
    cakeSize: task.cake_size,
    cakeFlavor: task.cake_flavor,
    height: task.height || undefined,
    quantity: task.quantity,
    quantityCompleted: task.quantity_completed,
    dueDate: new Date(task.due_date),
    createdAt: new Date(task.created_at),
    updatedAt: task.updated_at ? new Date(task.updated_at) : undefined,
    status: task.status as 'pending' | 'in-progress' | 'completed' | 'cancelled',
    orderIds: task.order_ids ? (task.order_ids as string[]) : undefined,
    qualityChecks: task.quality_checks as QualityCheck,
    cancellationReason: task.cancellation_reason || undefined,
    isManual: task.is_manual || false,
    isPriority: task.is_priority || false,
    notes: task.notes || undefined
  };
};

const mapInventoryItemFromSupabase = (item: any): CakeInventoryItem => {
  return {
    id: item.id,
    cakeShape: item.cake_shape,
    cakeSize: item.cake_size,
    cakeFlavor: item.cake_flavor,
    height: item.height || undefined,
    quantity: item.quantity,
    lastUpdated: new Date(item.last_updated)
  };
};

const mapProductionLogEntryFromSupabase = (entry: any): ProductionLogEntry => {
  return {
    id: entry.id,
    cakeShape: entry.cake_shape,
    cakeSize: entry.cake_size,
    cakeFlavor: entry.cake_flavor,
    quantity: entry.quantity,
    completedAt: new Date(entry.completed_at),
    baker: entry.baker || undefined,
    qualityChecks: entry.quality_checks as QualityCheck,
    notes: entry.notes || undefined,
    taskId: entry.task_id,
    cancelled: entry.cancelled || false,
    cancellationReason: entry.cancellation_reason || undefined,
    isManual: entry.is_manual || false
  };
};

export class SupabaseBakerRepository extends SupabaseBaseRepository implements BakerRepository {
  constructor() {
    super('baking_tasks'); // Initialize with the base table name
  }

  // Basic CRUD operations
  async getAll(): Promise<BakingTask[]> {
    const { data, error } = await this.getClient()
      .from('baking_tasks')
      .select('*')
      .order('due_date', { ascending: true });
    
    if (error) {
      console.error('Error fetching baking tasks:', error);
      throw error;
    }
    
    return data.map(mapBakingTaskFromSupabase);
  }

  async getById(id: string): Promise<BakingTask | undefined> {
    const { data, error } = await this.getClient()
      .from('baking_tasks')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') { // Row not found
        return undefined;
      }
      console.error('Error fetching baking task by id:', error);
      throw error;
    }
    
    return mapBakingTaskFromSupabase(data);
  }

  async create(task: Omit<BakingTask, 'id' | 'createdAt' | 'updatedAt'>): Promise<BakingTask> {
    // Transform into database format
    const taskData = {
      cake_shape: task.cakeShape,
      cake_size: task.cakeSize,
      cake_flavor: task.cakeFlavor,
      height: task.height,
      quantity: task.quantity,
      quantity_completed: task.quantityCompleted || 0,
      due_date: task.dueDate.toISOString(),
      status: task.status,
      order_ids: task.orderIds,
      quality_checks: task.qualityChecks,
      cancellation_reason: task.cancellationReason,
      is_manual: task.isManual || false,
      is_priority: task.isPriority || false,
      notes: task.notes
    };
    
    const { data, error } = await this.getClient()
      .from('baking_tasks')
      .insert(taskData)
      .select('*')
      .single();
    
    if (error) {
      console.error('Error creating baking task:', error);
      throw error;
    }
    
    return mapBakingTaskFromSupabase(data);
  }

  async update(id: string, task: Partial<BakingTask>): Promise<BakingTask> {
    // Transform into database format
    const taskData: Record<string, any> = {};
    
    if (task.cakeShape !== undefined) taskData.cake_shape = task.cakeShape;
    if (task.cakeSize !== undefined) taskData.cake_size = task.cakeSize;
    if (task.cakeFlavor !== undefined) taskData.cake_flavor = task.cakeFlavor;
    if (task.height !== undefined) taskData.height = task.height;
    if (task.quantity !== undefined) taskData.quantity = task.quantity;
    if (task.quantityCompleted !== undefined) taskData.quantity_completed = task.quantityCompleted;
    if (task.dueDate !== undefined) taskData.due_date = task.dueDate.toISOString();
    if (task.status !== undefined) taskData.status = task.status;
    if (task.orderIds !== undefined) taskData.order_ids = task.orderIds;
    if (task.qualityChecks !== undefined) taskData.quality_checks = task.qualityChecks;
    if (task.cancellationReason !== undefined) taskData.cancellation_reason = task.cancellationReason;
    if (task.isManual !== undefined) taskData.is_manual = task.isManual;
    if (task.isPriority !== undefined) taskData.is_priority = task.isPriority;
    if (task.notes !== undefined) taskData.notes = task.notes;
    
    const { data, error } = await this.getClient()
      .from('baking_tasks')
      .update(taskData)
      .eq('id', id)
      .select('*')
      .single();
    
    if (error) {
      console.error('Error updating baking task:', error);
      throw error;
    }
    
    return mapBakingTaskFromSupabase(data);
  }

  async delete(id: string): Promise<boolean> {
    const { error } = await this.getClient()
      .from('baking_tasks')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting baking task:', error);
      throw error;
    }
    
    return true;
  }

  // Specialized methods
  async getCakeInventory(): Promise<CakeInventoryItem[]> {
    const { data, error } = await this.getClient()
      .from('cake_inventory')
      .select('*')
      .order('last_updated', { ascending: false });
    
    if (error) {
      console.error('Error fetching cake inventory:', error);
      throw error;
    }
    
    return data.map(mapInventoryItemFromSupabase);
  }

  async getProductionLog(): Promise<ProductionLogEntry[]> {
    const { data, error } = await this.getClient()
      .from('production_log')
      .select('*')
      .order('completed_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching production log:', error);
      throw error;
    }
    
    return data.map(mapProductionLogEntryFromSupabase);
  }

  async createProductionEntry(entry: Omit<ProductionLogEntry, 'id'>): Promise<ProductionLogEntry> {
    // Transform into database format
    const entryData = {
      cake_shape: entry.cakeShape,
      cake_size: entry.cakeSize,
      cake_flavor: entry.cakeFlavor,
      quantity: entry.quantity,
      completed_at: entry.completedAt.toISOString(),
      baker: entry.baker,
      quality_checks: entry.qualityChecks,
      notes: entry.notes,
      task_id: entry.taskId,
      cancelled: entry.cancelled || false,
      cancellation_reason: entry.cancellationReason,
      is_manual: entry.isManual || false
    };
    
    // Create the production log entry
    const { data, error } = await this.getClient()
      .from('production_log')
      .insert(entryData)
      .select('*')
      .single();
    
    if (error) {
      console.error('Error creating production entry:', error);
      throw error;
    }
    
    // If this is tied to a task, update the task completion status
    if (entry.taskId) {
      const { data: taskData } = await this.getClient()
        .from('baking_tasks')
        .select('quantity, quantity_completed')
        .eq('id', entry.taskId)
        .single();
      
      if (taskData) {
        const newCompletedCount = taskData.quantity_completed + entry.quantity;
        const status = newCompletedCount >= taskData.quantity ? 'completed' : 'in-progress';
        
        await this.getClient()
          .from('baking_tasks')
          .update({ 
            quantity_completed: newCompletedCount,
            status: status
          })
          .eq('id', entry.taskId);
      }
    }
    
    // Update the inventory
    const { data: existingItem } = await this.getClient()
      .from('cake_inventory')
      .select('*')
      .eq('cake_shape', entry.cakeShape)
      .eq('cake_size', entry.cakeSize)
      .eq('cake_flavor', entry.cakeFlavor);
    
    if (existingItem && existingItem.length > 0) {
      // Update existing inventory item
      await this.getClient()
        .from('cake_inventory')
        .update({
          quantity: existingItem[0].quantity + entry.quantity,
          last_updated: new Date().toISOString()
        })
        .eq('id', existingItem[0].id);
    } else {
      // Create new inventory item
      await this.getClient()
        .from('cake_inventory')
        .insert({
          cake_shape: entry.cakeShape,
          cake_size: entry.cakeSize,
          cake_flavor: entry.cakeFlavor,
          quantity: entry.quantity
        });
    }
    
    return mapProductionLogEntryFromSupabase(data);
  }

  async updateInventory(item: Partial<CakeInventoryItem> & { id: string }): Promise<CakeInventoryItem> {
    // Transform into database format
    const itemData: Record<string, any> = {};
    
    if (item.cakeShape !== undefined) itemData.cake_shape = item.cakeShape;
    if (item.cakeSize !== undefined) itemData.cake_size = item.cakeSize;
    if (item.cakeFlavor !== undefined) itemData.cake_flavor = item.cakeFlavor;
    if (item.height !== undefined) itemData.height = item.height;
    if (item.quantity !== undefined) itemData.quantity = item.quantity;
    itemData.last_updated = new Date().toISOString();
    
    const { data, error } = await this.getClient()
      .from('cake_inventory')
      .update(itemData)
      .eq('id', item.id)
      .select('*')
      .single();
    
    if (error) {
      console.error('Error updating inventory item:', error);
      throw error;
    }
    
    return mapInventoryItemFromSupabase(data);
  }

  async acknowledgeCancelledTask(taskId: string, notes?: string): Promise<ProductionLogEntry> {
    // First, get the task details
    const task = await this.getById(taskId);
    if (!task) {
      throw new Error(`Task with id ${taskId} not found`);
    }
    
    if (task.status !== 'cancelled') {
      throw new Error('Can only acknowledge cancelled tasks');
    }
    
    // Create a production log entry for the cancelled task
    const entryData = {
      cake_shape: task.cakeShape,
      cake_size: task.cakeSize,
      cake_flavor: task.cakeFlavor,
      quantity: 0, // No cakes were produced
      task_id: task.id,
      cancelled: true,
      cancellation_reason: task.cancellationReason,
      notes: notes || 'Task cancelled and acknowledged by baker',
      is_manual: task.isManual
    };
    
    const { data, error } = await this.getClient()
      .from('production_log')
      .insert(entryData)
      .select('*')
      .single();
    
    if (error) {
      console.error('Error acknowledging cancelled task:', error);
      throw error;
    }
    
    // Remove the task from the active tasks list
    await this.delete(taskId);
    
    return mapProductionLogEntryFromSupabase(data);
  }

  async createManualTask(taskData: Pick<BakingTask, 'cakeShape' | 'cakeSize' | 'cakeFlavor' | 'quantity' | 'dueDate' | 'notes'>): Promise<BakingTask> {
    // Create new task with isManual flag
    const today = new Date();
    const dueDate = taskData.dueDate || today;
    
    // Check if it's due today for setting priority
    const isPriority = dueDate.getDate() === today.getDate() &&
                        dueDate.getMonth() === today.getMonth() &&
                        dueDate.getFullYear() === today.getFullYear();
    
    const data = {
      cake_shape: taskData.cakeShape,
      cake_size: taskData.cakeSize,
      cake_flavor: taskData.cakeFlavor,
      quantity: taskData.quantity,
      quantity_completed: 0,
      due_date: dueDate.toISOString(),
      status: 'pending',
      is_manual: true,
      is_priority: isPriority,
      notes: taskData.notes
    };
    
    const { data: newTask, error } = await this.getClient()
      .from('baking_tasks')
      .insert(data)
      .select('*')
      .single();
    
    if (error) {
      console.error('Error creating manual task:', error);
      throw error;
    }
    
    return mapBakingTaskFromSupabase(newTask);
  }

  async deleteManualTask(taskId: string): Promise<boolean> {
    const task = await this.getById(taskId);
    if (!task) {
      throw new Error(`Task with id ${taskId} not found`);
    }
    
    if (!task.isManual) {
      throw new Error('Only manual tasks can be deleted');
    }
    
    // Create a log entry to track the deletion
    const deletionLog = {
      cake_shape: task.cakeShape,
      cake_size: task.cakeSize,
      cake_flavor: task.cakeFlavor,
      quantity: 0,
      task_id: task.id,
      cancelled: true,
      cancellation_reason: 'Manual task deleted by baker',
      notes: 'Task deleted manually',
      is_manual: true
    };
    
    const { error: logError } = await this.getClient()
      .from('production_log')
      .insert(deletionLog);
    
    if (logError) {
      console.error('Error creating log entry for deleted task:', logError);
    }
    
    // Delete the task
    return this.delete(taskId);
  }

  async cancelManualTask(taskId: string, reason: string): Promise<BakingTask> {
    const task = await this.getById(taskId);
    if (!task) {
      throw new Error(`Task with id ${taskId} not found`);
    }
    
    if (!task.isManual) {
      throw new Error('Only manual tasks can be cancelled this way');
    }
    
    // Update task status
    return this.update(taskId, {
      status: 'cancelled',
      cancellationReason: reason || 'Cancelled by baker',
      updatedAt: new Date()
    });
  }

  async aggregateOrdersIntoTasks(orders: Order[]): Promise<BakingTask[]> {
    // Filter relevant orders 
    const relevantOrders = orders.filter(order => 
      order.status === 'in-kitchen' && order.kitchenStatus === 'waiting-baker'
    );
    console.log("Filtered orders for baker tasks:", relevantOrders.length);

    // Track all order IDs currently in the system
    const currentOrderIds = relevantOrders.map(order => order.id);
    
    // Get all current tasks that are neither completed nor cancelled
    const { data: currentTasks, error: tasksError } = await this.getClient()
      .from('baking_tasks')
      .select('*')
      .not('status', 'in', '("completed", "cancelled")');

    if (tasksError) {
      console.error('Error fetching active baking tasks:', tasksError);
      throw tasksError;
    }
    
    // Handle tasks with orders that have been modified
    const tasksToUpdate: BakingTask[] = [];
    
    for (const task of currentTasks) {
      if (!task.order_ids) {
        continue;
      }

      // Check if any orders in this task have been modified or removed
      const modifiedOrderIds: string[] = [];
      
      for (const orderId of task.order_ids) {
        const currentOrder = relevantOrders.find(o => o.id === orderId);
        
        if (!currentOrder) {
          if (currentOrderIds.includes(orderId)) {
            modifiedOrderIds.push(orderId);
          }
          continue;
        }
        
        // Check if specifications changed
        if (currentOrder.cakeShape !== task.cake_shape ||
            currentOrder.cakeSize !== task.cake_size ||
            currentOrder.cakeFlavor !== task.cake_flavor) {
          modifiedOrderIds.push(orderId);
        }
      }
      
      // Handle modified orders
      if (modifiedOrderIds.length > 0) {
        const remainingOrderIds = task.order_ids.filter(id => !modifiedOrderIds.includes(id));
        
        if (remainingOrderIds.length === 0) {
          // All orders have been modified, cancel the task
          await this.getClient()
            .from('baking_tasks')
            .update({
              status: 'cancelled',
              cancellation_reason: `Order${modifiedOrderIds.length > 1 ? 's' : ''} ${modifiedOrderIds.join(', ')} modified`
            })
            .eq('id', task.id);
          
          task.status = 'cancelled';
          task.cancellation_reason = `Order${modifiedOrderIds.length > 1 ? 's' : ''} ${modifiedOrderIds.join(', ')} modified`;
          tasksToUpdate.push(mapBakingTaskFromSupabase(task));
        } else {
          // Some orders have been modified, update with remaining orders
          await this.getClient()
            .from('baking_tasks')
            .update({
              order_ids: remainingOrderIds,
              quantity: remainingOrderIds.length
            })
            .eq('id', task.id);
          
          task.order_ids = remainingOrderIds;
          task.quantity = remainingOrderIds.length;
          tasksToUpdate.push(mapBakingTaskFromSupabase(task));
        }
      }
    }
    
    // Group orders by cake specifications
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
    
    // Create or update tasks
    const tasks: BakingTask[] = [];
    
    for (const [key, { orders, earliestDate }] of Object.entries(groupedOrders)) {
      const [cakeShape, cakeSize, cakeFlavor] = key.split('-');
      const orderIds = orders.map(o => o.id);
      
      // Check if a task for this specification already exists
      const existingTaskIndex = currentTasks.findIndex(
        t => t.cake_shape === cakeShape && 
        t.cake_size === cakeSize && 
        t.cake_flavor === cakeFlavor &&
        t.status !== 'completed' &&
        t.status !== 'cancelled'
      );
      
      if (existingTaskIndex >= 0) {
        // Update existing task
        const existingTask = currentTasks[existingTaskIndex];
        
        // Combine order IDs, avoiding duplicates
        const existingOrderIds = existingTask.order_ids || [];
        const combinedOrderIds = [...new Set([...existingOrderIds, ...orderIds])];
        
        // Update task
        const { data: updatedTask, error } = await this.getClient()
          .from('baking_tasks')
          .update({
            quantity: Math.max(existingTask.quantity, orders.length),
            order_ids: combinedOrderIds,
            due_date: earliestDate < new Date(existingTask.due_date) 
              ? earliestDate.toISOString() 
              : existingTask.due_date
          })
          .eq('id', existingTask.id)
          .select('*')
          .single();
        
        if (error) {
          console.error('Error updating baking task during aggregation:', error);
          continue;
        }
        
        tasks.push(mapBakingTaskFromSupabase(updatedTask));
      } else {
        // Create new task
        const { data: newTask, error } = await this.getClient()
          .from('baking_tasks')
          .insert({
            cake_shape: cakeShape,
            cake_size: cakeSize,
            cake_flavor: cakeFlavor,
            quantity: orders.length,
            quantity_completed: 0,
            due_date: earliestDate.toISOString(),
            status: 'pending',
            order_ids: orderIds
          })
          .select('*')
          .single();
        
        if (error) {
          console.error('Error creating baking task during aggregation:', error);
          continue;
        }
        
        tasks.push(mapBakingTaskFromSupabase(newTask));
      }
    }
    
    return [...tasksToUpdate, ...tasks];
  }
}
