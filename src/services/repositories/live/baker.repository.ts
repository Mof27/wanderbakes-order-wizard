import { BakingTask, CakeInventoryItem, ProductionLogEntry } from '@/types/baker';
import { BaseRepository } from '../base.repository';
import { Order } from '@/types';
import { supabase } from "@/integrations/supabase/client";
import { BakerRepository } from '../baker.repository';

export class LiveBakerRepository implements BakerRepository {
  async getAll(): Promise<BakingTask[]> {
    const { data: tasks, error } = await supabase
      .from('baking_tasks')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return tasks?.map(task => this.mapTaskFromDb(task)) || [];
  }

  async getById(id: string): Promise<BakingTask | undefined> {
    const { data: task, error } = await supabase
      .from('baking_tasks')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return undefined;
      throw error;
    }

    return this.mapTaskFromDb(task);
  }

  async create(taskData: Omit<BakingTask, 'id'>): Promise<BakingTask> {
    const { data: task, error } = await supabase
      .from('baking_tasks')
      .insert({
        cake_shape: taskData.cakeShape,
        cake_size: taskData.cakeSize,
        cake_flavor: taskData.cakeFlavor,
        height: taskData.height,
        quantity: taskData.quantity,
        quantity_completed: taskData.quantityCompleted || 0,
        due_date: taskData.dueDate,
        status: taskData.status,
        order_ids: taskData.orderIds,
        quality_checks: taskData.qualityChecks,
        cancellation_reason: taskData.cancellationReason,
        is_manual: taskData.isManual || false,
        is_priority: taskData.isPriority || false,
        notes: taskData.notes
      })
      .select()
      .single();

    if (error) throw error;

    return this.mapTaskFromDb(task);
  }

  async update(id: string, updates: Partial<BakingTask>): Promise<BakingTask> {
    const updateData: any = {};
    if (updates.quantity !== undefined) updateData.quantity = updates.quantity;
    if (updates.quantityCompleted !== undefined) updateData.quantity_completed = updates.quantityCompleted;
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.qualityChecks !== undefined) updateData.quality_checks = updates.qualityChecks;
    if (updates.cancellationReason !== undefined) updateData.cancellation_reason = updates.cancellationReason;
    if (updates.notes !== undefined) updateData.notes = updates.notes;
    if (updates.isPriority !== undefined) updateData.is_priority = updates.isPriority;
    if (updates.orderIds !== undefined) updateData.order_ids = updates.orderIds;

    const { data: task, error } = await supabase
      .from('baking_tasks')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return this.mapTaskFromDb(task);
  }

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('baking_tasks')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  }

  async getCakeInventory(): Promise<CakeInventoryItem[]> {
    const { data: inventory, error } = await supabase
      .from('cake_inventory')
      .select('*')
      .order('last_updated', { ascending: false });

    if (error) throw error;

    return inventory?.map(item => ({
      id: item.id,
      cakeShape: item.cake_shape,
      cakeSize: item.cake_size,
      cakeFlavor: item.cake_flavor,
      height: item.height,
      quantity: item.quantity,
      lastUpdated: new Date(item.last_updated)
    })) || [];
  }

  async getProductionLog(): Promise<ProductionLogEntry[]> {
    const { data: logs, error } = await supabase
      .from('production_log')
      .select('*')
      .order('completed_at', { ascending: false });

    if (error) throw error;

    return logs?.map(log => ({
      id: log.id,
      taskId: log.task_id,
      cakeShape: log.cake_shape,
      cakeSize: log.cake_size,
      cakeFlavor: log.cake_flavor,
      quantity: log.quantity,
      completedAt: new Date(log.completed_at),
      baker: log.baker,
      qualityChecks: log.quality_checks,
      notes: log.notes,
      cancelled: log.cancelled || false,
      cancellationReason: log.cancellation_reason,
      isManual: log.is_manual || false
    })) || [];
  }

  async createProductionEntry(entry: Omit<ProductionLogEntry, 'id'>): Promise<ProductionLogEntry> {
    const { data: log, error } = await supabase
      .from('production_log')
      .insert({
        task_id: entry.taskId,
        cake_shape: entry.cakeShape,
        cake_size: entry.cakeSize,
        cake_flavor: entry.cakeFlavor,
        quantity: entry.quantity,
        completed_at: entry.completedAt,
        baker: entry.baker,
        quality_checks: entry.qualityChecks,
        notes: entry.notes,
        cancelled: entry.cancelled || false,
        cancellation_reason: entry.cancellationReason,
        is_manual: entry.isManual || false
      })
      .select()
      .single();

    if (error) throw error;

    // Update inventory if not cancelled
    if (!entry.cancelled && entry.quantity > 0) {
      await this.updateInventoryForProduction(entry);
    }

    // Update task completion status
    if (entry.taskId) {
      await this.updateTaskProgress(entry.taskId, entry.quantity);
    }

    return {
      id: log.id,
      taskId: log.task_id,
      cakeShape: log.cake_shape,
      cakeSize: log.cake_size,
      cakeFlavor: log.cake_flavor,
      quantity: log.quantity,
      completedAt: new Date(log.completed_at),
      baker: log.baker,
      qualityChecks: log.quality_checks,
      notes: log.notes,
      cancelled: log.cancelled || false,
      cancellationReason: log.cancellation_reason,
      isManual: log.is_manual || false
    };
  }

  async updateInventory(item: Partial<CakeInventoryItem> & { id: string }): Promise<CakeInventoryItem> {
    const { data: inventory, error } = await supabase
      .from('cake_inventory')
      .update({
        quantity: item.quantity,
        last_updated: new Date().toISOString()
      })
      .eq('id', item.id)
      .select()
      .single();

    if (error) throw error;

    return {
      id: inventory.id,
      cakeShape: inventory.cake_shape,
      cakeSize: inventory.cake_size,
      cakeFlavor: inventory.cake_flavor,
      height: inventory.height,
      quantity: inventory.quantity,
      lastUpdated: new Date(inventory.last_updated)
    };
  }

  async aggregateOrdersIntoTasks(orders: Order[]): Promise<BakingTask[]> {
    // Filter relevant orders
    const relevantOrders = orders.filter(order => 
      order.status === 'in-kitchen' && order.kitchenStatus === 'waiting-baker'
    );

    // Get current tasks
    const currentTasks = await this.getAll();
    
    // Handle order changes and cancellations
    await this.handleOrderChanges(currentTasks, relevantOrders);

    // Group orders by cake specifications
    const groupedOrders = this.groupOrdersBySpecs(relevantOrders);

    // Create or update tasks
    const tasks: BakingTask[] = [];
    
    for (const [key, { orders: orderGroup, earliestDate }] of Object.entries(groupedOrders)) {
      const [cakeShape, cakeSize, cakeFlavor] = key.split('-');
      
      // Check if task exists
      const existingTask = currentTasks.find(
        t => t.cakeShape === cakeShape && 
        t.cakeSize === cakeSize && 
        t.cakeFlavor === cakeFlavor &&
        t.status !== 'completed' &&
        t.status !== 'cancelled'
      );

      if (existingTask) {
        // Update existing task
        const orderIds = [...new Set([
          ...(existingTask.orderIds || []),
          ...orderGroup.map(o => o.id)
        ])];

        const updatedTask = await this.update(existingTask.id, {
          quantity: Math.max(existingTask.quantity, orderGroup.length),
          orderIds,
          dueDate: earliestDate < existingTask.dueDate ? earliestDate : existingTask.dueDate,
          isPriority: this.isToday(earliestDate)
        });

        tasks.push(updatedTask);
      } else {
        // Create new task
        const newTask = await this.create({
          cakeShape,
          cakeSize,
          cakeFlavor,
          quantity: orderGroup.length,
          quantityCompleted: 0,
          dueDate: earliestDate,
          createdAt: new Date(),
          status: 'pending',
          orderIds: orderGroup.map(o => o.id),
          isPriority: this.isToday(earliestDate)
        });

        tasks.push(newTask);
      }
    }

    return tasks;
  }

  async acknowledgeCancelledTask(taskId: string, notes?: string): Promise<ProductionLogEntry> {
    const task = await this.getById(taskId);
    if (!task) throw new Error(`Task with id ${taskId} not found`);
    
    if (task.status !== 'cancelled') {
      throw new Error('Can only acknowledge cancelled tasks');
    }

    // Create production log entry
    const entry = await this.createProductionEntry({
      taskId: task.id,
      cakeShape: task.cakeShape,
      cakeSize: task.cakeSize,
      cakeFlavor: task.cakeFlavor,
      quantity: 0,
      completedAt: new Date(),
      cancelled: true,
      cancellationReason: task.cancellationReason,
      notes: notes || 'Task cancelled and acknowledged by baker',
      isManual: task.isManual
    });

    // Remove the task
    await this.delete(taskId);

    return entry;
  }

  async createManualTask(taskData: Pick<BakingTask, 'cakeShape' | 'cakeSize' | 'cakeFlavor' | 'quantity' | 'dueDate' | 'notes'>): Promise<BakingTask> {
    return this.create({
      ...taskData,
      quantityCompleted: 0,
      createdAt: new Date(),
      status: 'pending',
      isManual: true,
      isPriority: this.isToday(taskData.dueDate)
    });
  }

  async deleteManualTask(taskId: string): Promise<boolean> {
    const task = await this.getById(taskId);
    if (!task) throw new Error(`Task with id ${taskId} not found`);
    
    if (!task.isManual) {
      throw new Error('Only manual tasks can be deleted');
    }

    // Create deletion log
    await this.createProductionEntry({
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
    });

    return this.delete(taskId);
  }

  async cancelManualTask(taskId: string, reason: string): Promise<BakingTask> {
    const task = await this.getById(taskId);
    if (!task) throw new Error(`Task with id ${taskId} not found`);
    
    if (!task.isManual) {
      throw new Error('Only manual tasks can be cancelled this way');
    }

    return this.update(taskId, {
      status: 'cancelled',
      cancellationReason: reason || 'Cancelled by baker'
    });
  }

  private mapTaskFromDb(task: any): BakingTask {
    return {
      id: task.id,
      cakeShape: task.cake_shape,
      cakeSize: task.cake_size,
      cakeFlavor: task.cake_flavor,
      height: task.height,
      quantity: task.quantity,
      quantityCompleted: task.quantity_completed,
      dueDate: new Date(task.due_date),
      createdAt: new Date(task.created_at),
      updatedAt: task.updated_at ? new Date(task.updated_at) : undefined,
      status: task.status,
      orderIds: task.order_ids,
      qualityChecks: task.quality_checks,
      cancellationReason: task.cancellation_reason,
      isManual: task.is_manual || false,
      isPriority: task.is_priority || false,
      notes: task.notes
    };
  }

  private async updateInventoryForProduction(entry: Omit<ProductionLogEntry, 'id'>): Promise<void> {
    // Find existing inventory item
    const { data: existing, error: findError } = await supabase
      .from('cake_inventory')
      .select('*')
      .eq('cake_shape', entry.cakeShape)
      .eq('cake_size', entry.cakeSize)
      .eq('cake_flavor', entry.cakeFlavor)
      .maybeSingle();

    if (findError) throw findError;

    if (existing) {
      // Update existing inventory
      const { error } = await supabase
        .from('cake_inventory')
        .update({
          quantity: existing.quantity + entry.quantity,
          last_updated: new Date().toISOString()
        })
        .eq('id', existing.id);

      if (error) throw error;
    } else {
      // Create new inventory item
      const { error } = await supabase
        .from('cake_inventory')
        .insert({
          cake_shape: entry.cakeShape,
          cake_size: entry.cakeSize,
          cake_flavor: entry.cakeFlavor,
          quantity: entry.quantity,
          last_updated: new Date().toISOString()
        });

      if (error) throw error;
    }
  }

  private async updateTaskProgress(taskId: string, completedQuantity: number): Promise<void> {
    const task = await this.getById(taskId);
    if (!task) return;

    const newCompleted = task.quantityCompleted + completedQuantity;
    let newStatus = task.status;

    if (newCompleted >= task.quantity) {
      newStatus = 'completed';
    } else if (task.status === 'pending') {
      newStatus = 'in-progress';
    }

    await this.update(taskId, {
      quantityCompleted: newCompleted,
      status: newStatus
    });
  }

  private async handleOrderChanges(currentTasks: BakingTask[], relevantOrders: Order[]): Promise<void> {
    const currentOrderIds = relevantOrders.map(order => order.id);

    for (const task of currentTasks) {
      if (!task.orderIds || task.status === 'completed' || task.status === 'cancelled') {
        continue;
      }

      const modifiedOrderIds: string[] = [];
      
      for (const orderId of task.orderIds) {
        const currentOrder = relevantOrders.find(o => o.id === orderId);
        
        if (!currentOrder) {
          if (currentOrderIds.includes(orderId)) {
            modifiedOrderIds.push(orderId);
          }
          continue;
        }
        
        // Check if specifications changed
        if (currentOrder.cakeShape !== task.cakeShape ||
            currentOrder.cakeSize !== task.cakeSize ||
            currentOrder.cakeFlavor !== task.cakeFlavor) {
          modifiedOrderIds.push(orderId);
        }
      }

      if (modifiedOrderIds.length > 0) {
        const remainingOrderIds = task.orderIds.filter(id => !modifiedOrderIds.includes(id));
        
        if (remainingOrderIds.length === 0) {
          // Cancel the task
          await this.update(task.id, {
            status: 'cancelled',
            cancellationReason: `Order${modifiedOrderIds.length > 1 ? 's' : ''} ${modifiedOrderIds.join(', ')} modified`
          });
        } else {
          // Update task with remaining orders
          await this.update(task.id, {
            orderIds: remainingOrderIds,
            quantity: remainingOrderIds.length
          });
        }
      }
    }
  }

  private groupOrdersBySpecs(orders: Order[]): Record<string, { orders: Order[], earliestDate: Date }> {
    const grouped: Record<string, { orders: Order[], earliestDate: Date }> = {};
    
    orders.forEach(order => {
      const key = `${order.cakeShape}-${order.cakeSize}-${order.cakeFlavor}`;
      
      if (!grouped[key]) {
        grouped[key] = {
          orders: [],
          earliestDate: new Date(order.deliveryDate)
        };
      }
      
      grouped[key].orders.push(order);
      
      const orderDate = new Date(order.deliveryDate);
      if (orderDate < grouped[key].earliestDate) {
        grouped[key].earliestDate = orderDate;
      }
    });

    return grouped;
  }

  private isToday(date: Date): boolean {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  }
}