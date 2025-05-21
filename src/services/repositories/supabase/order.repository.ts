
import { 
  Order, 
  OrderStatus, 
  PrintEvent, 
  OrderLogEvent, 
  CakeRevision, 
  DeliveryAssignment,
  TierDetail,
  Ingredient,
  PackingItem
} from "@/types";
import { OrderRepository } from "../order.repository";
import { SupabaseBaseRepository } from "./base.repository";
import { supabase } from "../../supabase/client";
import { PostgrestError } from "@supabase/supabase-js";

export class SupabaseOrderRepository extends SupabaseBaseRepository implements OrderRepository {
  constructor() {
    super('orders');
  }

  async getAll(): Promise<Order[]> {
    const { data: orders, error } = await this.getClient()
      .from('orders')
      .select(`
        *,
        customer:customers(*),
        order_cover_colors(*),
        order_tier_details(*),
        order_packing_items(*),
        order_ingredients(*),
        order_logs(*),
        order_print_history(*),
        order_revision_history(*),
        order_delivery_assignments(*),
        order_tags(*),
        order_attachments(*)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }

    return this.mapDatabaseOrders(orders || []);
  }

  async getById(id: string): Promise<Order | undefined> {
    const { data, error } = await this.getClient()
      .from('orders')
      .select(`
        *,
        customer:customers(*),
        order_cover_colors(*),
        order_tier_details(*, tier_detail_cover_colors(*)),
        order_packing_items(*),
        order_ingredients(*),
        order_logs(*),
        order_print_history(*),
        order_revision_history(*),
        order_delivery_assignments(*),
        order_tags(*),
        order_attachments(*)
      `)
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error(`Error fetching order with ID ${id}:`, error);
      throw error;
    }

    if (!data) {
      return undefined;
    }

    return this.mapDatabaseOrder(data);
  }

  async create(order: Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'printHistory'>): Promise<Order> {
    const now = new Date();
    
    // Generate a month-year based ID: MM-YY-XXX similar to the mock implementation
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = String(now.getFullYear()).slice(-2);
    
    // Count existing orders in this month/year to determine the sequence number
    const monthYearPrefix = `${month}-${year}`;
    
    const { count, error: countError } = await this.getClient()
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .like('id', `${monthYearPrefix}-%`);
    
    if (countError) {
      console.error(`Error counting orders with prefix ${monthYearPrefix}:`, countError);
      throw countError;
    }
    
    // Create sequence number with padding (e.g., 001, 002, etc.)
    const existingOrdersThisMonth = count || 0;
    const sequence = String(existingOrdersThisMonth + 1).padStart(3, '0');
    const orderId = `${monthYearPrefix}-${sequence}`;
    
    // Extract customer ID and other basic order properties
    const { 
      customer, 
      packingItems, 
      coverColor, 
      ingredients, 
      orderLogs, 
      revisionHistory, 
      deliveryAssignment, 
      tierDetails, 
      ...orderData 
    } = order;

    // Prepare order data for insertion
    const orderInsert = {
      id: orderId,
      customer_id: customer.id,
      ...orderData,
      status: orderData.status || 'incomplete',
      created_at: now.toISOString(),
      updated_at: now.toISOString()
    };

    // Start a transaction
    const { error: orderError } = await this.getClient()
      .from('orders')
      .insert(orderInsert);

    if (orderError) {
      console.error('Error creating order:', orderError);
      throw orderError;
    }

    // Insert related data
    await this.insertOrderRelatedData(orderId, order);

    // Fetch the complete order with all relations
    return this.getById(orderId) as Promise<Order>;
  }

  async update(id: string, orderUpdate: Partial<Order>): Promise<Order> {
    // Extract nested data from the update
    const {
      customer,
      packingItems,
      coverColor,
      ingredients,
      orderLogs,
      printHistory,
      revisionHistory,
      deliveryAssignment,
      tierDetails,
      ...orderData
    } = orderUpdate;

    // If status is changing, track the change in logs
    if (orderData.status) {
      const { data: existingOrder } = await this.getClient()
        .from('orders')
        .select('status')
        .eq('id', id)
        .single();

      if (existingOrder && existingOrder.status !== orderData.status) {
        // Add log entry for status change
        const logId = `log_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        
        await this.getClient()
          .from('order_logs')
          .insert({
            id: logId,
            order_id: id,
            type: 'status-change',
            previous_status: existingOrder.status,
            new_status: orderData.status,
            timestamp: new Date().toISOString()
          });
      }
    }

    // Update the main order record
    if (Object.keys(orderData).length > 0) {
      const { error: updateError } = await this.getClient()
        .from('orders')
        .update({
          ...orderData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (updateError) {
        console.error(`Error updating order ${id}:`, updateError);
        throw updateError;
      }
    }

    // Handle nested data updates if provided
    if (packingItems) {
      await this.replacePackingItems(id, packingItems);
    }

    if (coverColor) {
      await this.replaceCoverColor(id, coverColor);
    }

    if (ingredients) {
      await this.replaceIngredients(id, ingredients);
    }

    if (tierDetails) {
      await this.replaceTierDetails(id, tierDetails);
    }

    // Fetch the updated order with all relations
    return this.getById(id) as Promise<Order>;
  }

  async delete(id: string): Promise<boolean> {
    try {
      // Due to ON DELETE CASCADE constraints, deleting the order will delete all related records
      const { error } = await this.getClient()
        .from('orders')
        .delete()
        .eq('id', id);

      if (error) {
        console.error(`Error deleting order ${id}:`, error);
        return false;
      }

      return true;
    } catch (error) {
      console.error(`Exception deleting order ${id}:`, error);
      return false;
    }
  }

  async getByStatus(status: OrderStatus): Promise<Order[]> {
    const { data: orders, error } = await this.getClient()
      .from('orders')
      .select(`
        *,
        customer:customers(*),
        order_cover_colors(*),
        order_tier_details(*),
        order_packing_items(*),
        order_ingredients(*),
        order_logs(*),
        order_print_history(*),
        order_revision_history(*),
        order_delivery_assignments(*),
        order_tags(*),
        order_attachments(*)
      `)
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) {
      console.error(`Error fetching orders with status ${status}:`, error);
      throw error;
    }

    return this.mapDatabaseOrders(orders || []);
  }

  async getByCustomerId(customerId: string): Promise<Order[]> {
    const { data: orders, error } = await this.getClient()
      .from('orders')
      .select(`
        *,
        customer:customers(*),
        order_cover_colors(*),
        order_tier_details(*),
        order_packing_items(*),
        order_ingredients(*),
        order_logs(*),
        order_print_history(*),
        order_revision_history(*),
        order_delivery_assignments(*),
        order_tags(*),
        order_attachments(*)
      `)
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error(`Error fetching orders for customer ${customerId}:`, error);
      throw error;
    }

    return this.mapDatabaseOrders(orders || []);
  }

  async getByTimeFrame(timeFrame: 'today' | 'this-week' | 'this-month'): Promise<Order[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let startDate: Date;
    if (timeFrame === 'today') {
      startDate = today;
    } else if (timeFrame === 'this-week') {
      startDate = new Date(today);
      startDate.setDate(today.getDate() - today.getDay());
    } else { // this-month
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
    }
    
    const { data: orders, error } = await this.getClient()
      .from('orders')
      .select(`
        *,
        customer:customers(*),
        order_cover_colors(*),
        order_tier_details(*),
        order_packing_items(*),
        order_ingredients(*),
        order_logs(*),
        order_print_history(*),
        order_revision_history(*),
        order_delivery_assignments(*),
        order_tags(*),
        order_attachments(*)
      `)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false });

    if (error) {
      console.error(`Error fetching orders for timeframe ${timeFrame}:`, error);
      throw error;
    }

    return this.mapDatabaseOrders(orders || []);
  }

  async updatePrintHistory(orderId: string, printEvent: PrintEvent): Promise<Order> {
    try {
      // Insert the print event
      const { error: printError } = await this.getClient()
        .from('order_print_history')
        .insert({
          order_id: orderId,
          type: printEvent.type,
          timestamp: printEvent.timestamp.toISOString(),
          user_name: printEvent.user
        });

      if (printError) {
        console.error(`Error recording print history for order ${orderId}:`, printError);
        throw printError;
      }

      // Add log entry for print event
      const logId = `log_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      
      const { error: logError } = await this.getClient()
        .from('order_logs')
        .insert({
          id: logId,
          order_id: orderId,
          type: 'print',
          note: `Printed ${printEvent.type}`,
          timestamp: new Date().toISOString(),
          metadata: { printEvent }
        });

      if (logError) {
        console.error(`Error adding log for print event in order ${orderId}:`, logError);
      }

      // Update order's updated_at timestamp
      await this.getClient()
        .from('orders')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', orderId);

      // Return the updated order
      return this.getById(orderId) as Promise<Order>;
    } catch (error) {
      console.error(`Exception updating print history for order ${orderId}:`, error);
      throw error;
    }
  }

  async addOrderLog(orderId: string, logEvent: Omit<OrderLogEvent, 'id'>): Promise<Order> {
    try {
      // Generate ID for the log event
      const logId = `log_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

      // Insert the log event
      const { error } = await this.getClient()
        .from('order_logs')
        .insert({
          id: logId,
          order_id: orderId,
          type: logEvent.type,
          timestamp: logEvent.timestamp.toISOString(),
          note: logEvent.note,
          user_name: logEvent.user,
          previous_status: logEvent.previousStatus,
          new_status: logEvent.newStatus,
          metadata: logEvent.metadata
        });

      if (error) {
        console.error(`Error adding log to order ${orderId}:`, error);
        throw error;
      }

      // Update order's updated_at timestamp
      await this.getClient()
        .from('orders')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', orderId);

      // Return the updated order
      return this.getById(orderId) as Promise<Order>;
    } catch (error) {
      console.error(`Exception adding log to order ${orderId}:`, error);
      throw error;
    }
  }

  async addRevision(orderId: string, revision: Omit<CakeRevision, 'id'>): Promise<Order> {
    try {
      // Generate ID for the revision
      const revisionId = `rev_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

      // Insert the revision
      const { error: revisionError } = await this.getClient()
        .from('order_revision_history')
        .insert({
          id: revisionId,
          order_id: orderId,
          timestamp: revision.timestamp.toISOString(),
          photos: revision.photos,
          notes: revision.notes,
          requested_by: revision.requestedBy
        });

      if (revisionError) {
        console.error(`Error adding revision to order ${orderId}:`, revisionError);
        throw revisionError;
      }

      // Update revision count in orders table
      const { data: orderData, error: orderError } = await this.getClient()
        .from('orders')
        .select('revision_count')
        .eq('id', orderId)
        .single();

      if (orderError) {
        console.error(`Error getting revision count for order ${orderId}:`, orderError);
        throw orderError;
      }

      const revisionCount = (orderData.revision_count || 0) + 1;

      const { error: updateError } = await this.getClient()
        .from('orders')
        .update({
          revision_count: revisionCount,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (updateError) {
        console.error(`Error updating revision count for order ${orderId}:`, updateError);
        throw updateError;
      }

      // Return the updated order
      return this.getById(orderId) as Promise<Order>;
    } catch (error) {
      console.error(`Exception adding revision to order ${orderId}:`, error);
      throw error;
    }
  }

  async assignDriver(orderId: string, assignment: Omit<DeliveryAssignment, 'assignedAt'>): Promise<Order> {
    try {
      // Create the assignment
      const { error: assignError } = await this.getClient()
        .from('order_delivery_assignments')
        .insert({
          order_id: orderId,
          driver_type: assignment.driverType,
          driver_name: assignment.driverName,
          assigned_at: new Date().toISOString(),
          is_preliminary: assignment.isPreliminary,
          notes: assignment.notes,
          vehicle_info: assignment.vehicleInfo,
          status: assignment.status
        });

      if (assignError) {
        console.error(`Error assigning driver to order ${orderId}:`, assignError);
        throw assignError;
      }

      // Add log entry for driver assignment
      const logId = `log_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      
      const { error: logError } = await this.getClient()
        .from('order_logs')
        .insert({
          id: logId,
          order_id: orderId,
          type: 'driver-assigned',
          note: `${assignment.isPreliminary ? 'Pre-assigned' : 'Assigned'} to ${assignment.driverType}${assignment.driverName ? ` (${assignment.driverName})` : ''}`,
          timestamp: new Date().toISOString(),
          metadata: { assignment }
        });

      if (logError) {
        console.error(`Error adding log for driver assignment in order ${orderId}:`, logError);
      }

      // Update order's updated_at timestamp
      await this.getClient()
        .from('orders')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', orderId);

      // Return the updated order
      return this.getById(orderId) as Promise<Order>;
    } catch (error) {
      console.error(`Exception assigning driver to order ${orderId}:`, error);
      throw error;
    }
  }

  // Private helper methods for data manipulation
  
  private async insertOrderRelatedData(orderId: string, order: Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'printHistory'>) {
    // These methods will handle inserting all the nested objects
    
    if (order.coverColor) {
      await this.insertCoverColor(orderId, order.coverColor);
    }
    
    if (order.tierDetails && order.tierDetails.length > 0) {
      await this.insertTierDetails(orderId, order.tierDetails);
    }
    
    if (order.packingItems && order.packingItems.length > 0) {
      await this.insertPackingItems(orderId, order.packingItems);
    }
    
    if (order.ingredients && order.ingredients.length > 0) {
      await this.insertIngredients(orderId, order.ingredients);
    }
  }

  private async insertCoverColor(orderId: string, coverColor: any) {
    const colorInsert = {
      order_id: orderId,
      type: coverColor.type,
      color: coverColor.type === 'solid' ? coverColor.color : null,
      colors: coverColor.type === 'gradient' ? coverColor.colors : null,
      notes: coverColor.type === 'custom' ? coverColor.notes : null,
      image_url: coverColor.type === 'custom' ? coverColor.imageUrl : null
    };
    
    const { error } = await this.getClient()
      .from('order_cover_colors')
      .insert(colorInsert);
      
    if (error) {
      console.error(`Error inserting cover color for order ${orderId}:`, error);
      throw error;
    }
  }

  private async insertTierDetails(orderId: string, tierDetails: TierDetail[]) {
    for (const tier of tierDetails) {
      // Insert tier detail
      const { data: tierData, error: tierError } = await this.getClient()
        .from('order_tier_details')
        .insert({
          order_id: orderId,
          tier: tier.tier,
          shape: tier.shape,
          size: tier.size,
          height: tier.height,
          flavor: tier.flavor,
          cover_type: tier.coverType,
          custom_shape: tier.customShape
        })
        .select('id')
        .single();
        
      if (tierError) {
        console.error(`Error inserting tier details for order ${orderId}:`, tierError);
        throw tierError;
      }
      
      // Insert tier cover color if any
      if (tier.coverColor && tierData) {
        const tierColorInsert = {
          tier_detail_id: tierData.id,
          type: tier.coverColor.type,
          color: tier.coverColor.type === 'solid' ? tier.coverColor.color : null,
          colors: tier.coverColor.type === 'gradient' ? tier.coverColor.colors : null,
          notes: tier.coverColor.type === 'custom' ? tier.coverColor.notes : null,
          image_url: tier.coverColor.type === 'custom' ? tier.coverColor.imageUrl : null
        };
        
        const { error: colorsError } = await this.getClient()
          .from('tier_detail_cover_colors')
          .insert(tierColorInsert);
          
        if (colorsError) {
          console.error(`Error inserting tier cover color for tier ${tierData.id}:`, colorsError);
          throw colorsError;
        }
      }
    }
  }

  private async insertPackingItems(orderId: string, packingItems: PackingItem[]) {
    const itemInserts = packingItems.map(item => ({
      order_id: orderId,
      name: item.name,
      checked: item.checked || false
    }));
    
    const { error } = await this.getClient()
      .from('order_packing_items')
      .insert(itemInserts);
      
    if (error) {
      console.error(`Error inserting packing items for order ${orderId}:`, error);
      throw error;
    }
  }

  private async insertIngredients(orderId: string, ingredients: Ingredient[]) {
    const ingredientInserts = ingredients.map(ingredient => ({
      order_id: orderId,
      name: ingredient.name,
      quantity: ingredient.quantity,
      unit: ingredient.unit
    }));
    
    const { error } = await this.getClient()
      .from('order_ingredients')
      .insert(ingredientInserts);
      
    if (error) {
      console.error(`Error inserting ingredients for order ${orderId}:`, error);
      throw error;
    }
  }
  
  private async replacePackingItems(orderId: string, packingItems: PackingItem[]) {
    // Delete existing items
    await this.getClient()
      .from('order_packing_items')
      .delete()
      .eq('order_id', orderId);
      
    // Insert new items if any
    if (packingItems.length > 0) {
      await this.insertPackingItems(orderId, packingItems);
    }
  }
  
  private async replaceCoverColor(orderId: string, coverColor: any) {
    // Delete existing colors
    await this.getClient()
      .from('order_cover_colors')
      .delete()
      .eq('order_id', orderId);
      
    // Insert new color if any
    await this.insertCoverColor(orderId, coverColor);
  }
  
  private async replaceIngredients(orderId: string, ingredients: Ingredient[]) {
    // Delete existing ingredients
    await this.getClient()
      .from('order_ingredients')
      .delete()
      .eq('order_id', orderId);
      
    // Insert new ingredients if any
    if (ingredients.length > 0) {
      await this.insertIngredients(orderId, ingredients);
    }
  }
  
  private async replaceTierDetails(orderId: string, tierDetails: TierDetail[]) {
    // Get existing tier details to handle cover colors
    const { data: existingTiers } = await this.getClient()
      .from('order_tier_details')
      .select('id')
      .eq('order_id', orderId);
      
    if (existingTiers && existingTiers.length > 0) {
      // Delete tier cover colors first to avoid foreign key constraints
      for (const tier of existingTiers) {
        await this.getClient()
          .from('tier_detail_cover_colors')
          .delete()
          .eq('tier_detail_id', tier.id);
      }
    }
    
    // Delete existing tier details
    await this.getClient()
      .from('order_tier_details')
      .delete()
      .eq('order_id', orderId);
      
    // Insert new tier details if any
    if (tierDetails.length > 0) {
      await this.insertTierDetails(orderId, tierDetails);
    }
  }

  // Data mapping methods to convert database records to domain objects

  private mapDatabaseOrders(dbOrders: any[]): Order[] {
    return dbOrders.map(order => this.mapDatabaseOrder(order));
  }

  private mapDatabaseOrder(dbOrder: any): Order {
    // Map customer
    const customer = dbOrder.customer ? {
      id: dbOrder.customer.id,
      name: dbOrder.customer.name,
      whatsappNumber: dbOrder.customer.whatsappnumber,
      email: dbOrder.customer.email,
      addresses: [],  // Address will be handled separately if needed
      createdAt: new Date(dbOrder.customer.created_at)
    } : { 
      id: dbOrder.customer_id, 
      name: 'Unknown Customer', 
      whatsappNumber: '', 
      addresses: [], 
      createdAt: new Date() 
    };

    // Map cover color - pick the first one from order_cover_colors
    let coverColor;
    if (dbOrder.order_cover_colors && dbOrder.order_cover_colors.length > 0) {
      const color = dbOrder.order_cover_colors[0];
      if (color.type === 'solid') {
        coverColor = { type: 'solid', color: color.color };
      } else if (color.type === 'gradient') {
        coverColor = { type: 'gradient', colors: color.colors || [] };
      } else if (color.type === 'custom') {
        coverColor = { type: 'custom', notes: color.notes, imageUrl: color.image_url };
      }
    }

    // Map tier details
    const tierDetails = dbOrder.order_tier_details ?
      dbOrder.order_tier_details.map((tier: any) => {
        // Map tier cover color if available
        let coverColor;
        if (tier.tier_detail_cover_colors && tier.tier_detail_cover_colors.length > 0) {
          const color = tier.tier_detail_cover_colors[0];
          if (color.type === 'solid') {
            coverColor = { type: 'solid', color: color.color };
          } else if (color.type === 'gradient') {
            coverColor = { type: 'gradient', colors: color.colors || [] };
          } else if (color.type === 'custom') {
            coverColor = { type: 'custom', notes: color.notes, imageUrl: color.image_url };
          }
        }
          
        return {
          tier: tier.tier,
          shape: tier.shape,
          size: tier.size,
          height: tier.height,
          flavor: tier.flavor,
          coverType: tier.cover_type,
          customShape: tier.custom_shape,
          coverColor
        };
      }) : [];

    // Map packing items
    const packingItems = dbOrder.order_packing_items ?
      dbOrder.order_packing_items.map((item: any) => ({
        id: item.id,
        name: item.name,
        checked: item.checked
      })) : [];

    // Map ingredients
    const ingredients = dbOrder.order_ingredients ?
      dbOrder.order_ingredients.map((ingredient: any) => ({
        id: ingredient.id,
        name: ingredient.name,
        quantity: parseFloat(ingredient.quantity),
        unit: ingredient.unit
      })) : [];

    // Map order logs
    const orderLogs = dbOrder.order_logs ?
      dbOrder.order_logs.map((log: any) => ({
        id: log.id,
        type: log.type,
        timestamp: new Date(log.timestamp),
        note: log.note,
        user: log.user_name,
        previousStatus: log.previous_status,
        newStatus: log.new_status,
        metadata: log.metadata
      })) : [];

    // Map print history
    const printHistory = dbOrder.order_print_history ?
      dbOrder.order_print_history.map((print: any) => ({
        id: print.id,
        type: print.type,
        timestamp: new Date(print.timestamp),
        user: print.user_name
      })) : [];

    // Map revision history
    const revisionHistory = dbOrder.order_revision_history ?
      dbOrder.order_revision_history.map((revision: any) => ({
        id: revision.id,
        timestamp: new Date(revision.timestamp),
        photos: revision.photos,
        notes: revision.notes,
        requestedBy: revision.requested_by
      })) : [];

    // Map delivery assignment (take the most recent one)
    let deliveryAssignment: DeliveryAssignment | undefined;
    
    if (dbOrder.order_delivery_assignments && dbOrder.order_delivery_assignments.length > 0) {
      // Sort by assigned_at descending to get the most recent
      const sortedAssignments = [...dbOrder.order_delivery_assignments].sort(
        (a: any, b: any) => new Date(b.assigned_at).getTime() - new Date(a.assigned_at).getTime()
      );
      
      const latest = sortedAssignments[0];
      
      deliveryAssignment = {
        driverType: latest.driver_type,
        driverName: latest.driver_name,
        assignedAt: new Date(latest.assigned_at),
        assignedBy: latest.assigned_by,
        notes: latest.notes,
        status: latest.status,
        isPreliminary: latest.is_preliminary,
        vehicleInfo: latest.vehicle_info,
      };
    }

    // Construct and return the full order object
    return {
      id: dbOrder.id,
      status: dbOrder.status,
      kitchenStatus: dbOrder.kitchen_status,
      orderDate: dbOrder.order_date ? new Date(dbOrder.order_date) : undefined,
      createdAt: new Date(dbOrder.created_at),
      updatedAt: dbOrder.updated_at ? new Date(dbOrder.updated_at) : undefined,
      deliveryDate: new Date(dbOrder.delivery_date),
      deliveryAddress: dbOrder.delivery_address,
      deliveryAddressNotes: dbOrder.delivery_address_notes,
      deliveryArea: dbOrder.delivery_area,
      cakeDesign: dbOrder.cake_design,
      cakeFlavor: dbOrder.cake_flavor,
      cakeSize: dbOrder.cake_size,
      cakeShape: dbOrder.cake_shape,
      customShape: dbOrder.custom_shape,
      cakeTier: dbOrder.cake_tier,
      useSameFlavor: dbOrder.use_same_flavor,
      useSameCover: dbOrder.use_same_cover,
      cakeText: dbOrder.cake_text,
      greetingCard: dbOrder.greeting_card,
      notes: dbOrder.notes,
      cakePrice: parseFloat(dbOrder.cake_price),
      deliveryMethod: dbOrder.delivery_method,
      deliveryTimeSlot: dbOrder.delivery_time_slot,
      deliveryPrice: dbOrder.delivery_price ? parseFloat(dbOrder.delivery_price) : undefined,
      actualDeliveryTime: dbOrder.actual_delivery_time ? new Date(dbOrder.actual_delivery_time) : undefined,
      customerFeedback: dbOrder.customer_feedback,
      archivedDate: dbOrder.archived_date ? new Date(dbOrder.archived_date) : undefined,
      coverType: dbOrder.cover_type,
      revisionCount: dbOrder.revision_count || 0,
      revisionNotes: dbOrder.revision_notes,
      approvedBy: dbOrder.approved_by,
      approvalDate: dbOrder.approval_date ? new Date(dbOrder.approval_date) : undefined,
      
      // Nested objects
      customer,
      coverColor,
      tierDetails,
      packingItems,
      ingredients,
      orderLogs,
      printHistory,
      revisionHistory,
      deliveryAssignment
    };
  }
}
