import { Order, OrderStatus, PrintEvent, OrderLogEvent, CakeRevision, DeliveryAssignment, CakeColor } from "@/types";
import { BaseRepository } from "../base.repository";
import { supabase } from "@/integrations/supabase/client";
import { OrderRepository } from "../order.repository";

export class LiveOrderRepository implements OrderRepository {
  async getAll(): Promise<Order[]> {
    const { data: orders, error } = await supabase
      .from('orders')
      .select(`
        *,
        customers (*),
        order_logs (*),
        order_print_history (*),
        order_tier_details (*),
        order_cover_colors (*),
        tier_detail_cover_colors (*),
        order_packing_items (*),
        order_revision_history (*),
        order_delivery_assignments (*),
        order_attachments (*),
        order_tags (*),
        order_ingredients (*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return orders?.map(order => this.mapOrderFromDb(order)) || [];
  }

  async getById(id: string): Promise<Order | undefined> {
    const { data: order, error } = await supabase
      .from('orders')
      .select(`
        *,
        customers (*),
        order_logs (*),
        order_print_history (*),
        order_tier_details (*),
        order_cover_colors (*),
        tier_detail_cover_colors (*),
        order_packing_items (*),
        order_revision_history (*),
        order_delivery_assignments (*),
        order_attachments (*),
        order_tags (*),
        order_ingredients (*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return undefined;
      throw error;
    }

    return this.mapOrderFromDb(order);
  }

  async create(orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<Order> {
    // Generate order ID in format MM-YY-XXX
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = String(now.getFullYear()).slice(-2);
    
    // Get count of orders this month to generate sequence
    const { count } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .like('id', `${month}-${year}-%`);
    
    const sequence = String((count || 0) + 1).padStart(3, '0');
    const orderId = `${month}-${year}-${sequence}`;

    // Create the main order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        id: orderId,
        customer_id: orderData.customer.id,
        status: orderData.status,
        kitchen_status: orderData.kitchenStatus,
        order_date: orderData.orderDate,
        delivery_date: orderData.deliveryDate,
        delivery_address: orderData.deliveryAddress,
        delivery_address_notes: orderData.deliveryAddressNotes,
        delivery_area: orderData.deliveryArea,
        delivery_method: orderData.deliveryMethod,
        delivery_time_slot: orderData.deliveryTimeSlot,
        cake_design: orderData.cakeDesign,
        cake_flavor: orderData.cakeFlavor,
        cake_size: orderData.cakeSize,
        cake_shape: orderData.cakeShape,
        custom_shape: orderData.customShape,
        cake_tier: orderData.cakeTier,
        cover_type: orderData.coverType,
        use_same_flavor: orderData.useSameFlavor,
        use_same_cover: orderData.useSameCover,
        cake_text: orderData.cakeText,
        greeting_card: orderData.greetingCard,
        notes: orderData.notes,
        cake_price: orderData.cakePrice,
        delivery_price: orderData.deliveryPrice,
        revision_count: 0
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // Create related data in parallel
    await Promise.all([
      // Tier details
      orderData.tierDetails && orderData.tierDetails.length > 0 ? 
        supabase.from('order_tier_details').insert(
          orderData.tierDetails.map(tier => ({
            order_id: orderId,
            tier: tier.tier,
            shape: tier.shape,
            size: tier.size,
            height: tier.height,
            flavor: tier.flavor,
            cover_type: tier.coverType,
            custom_shape: tier.customShape
          }))
        ) : Promise.resolve(),

      // Cover color
      orderData.coverColor ?
        supabase.from('order_cover_colors').insert([{
          order_id: orderId,
          type: orderData.coverColor.type,
          color: 'color' in orderData.coverColor ? orderData.coverColor.color : undefined,
          colors: 'colors' in orderData.coverColor ? orderData.coverColor.colors : undefined,
          image_url: 'imageUrl' in orderData.coverColor ? orderData.coverColor.imageUrl : undefined,
          notes: 'notes' in orderData.coverColor ? orderData.coverColor.notes : undefined
        }]) : Promise.resolve(),

      // Packing items
      orderData.packingItems && orderData.packingItems.length > 0 ?
        supabase.from('order_packing_items').insert(
          orderData.packingItems.map(item => ({
            order_id: orderId,
            name: item.name,
            checked: item.checked
          }))
        ) : Promise.resolve(),

      // Ingredients
      orderData.ingredients && orderData.ingredients.length > 0 ?
        supabase.from('order_ingredients').insert(
          orderData.ingredients.map(ingredient => ({
            order_id: orderId,
            name: ingredient.name,
            quantity: ingredient.quantity,
            unit: ingredient.unit
          }))
        ) : Promise.resolve()
    ]);

    return this.getById(orderId) as Promise<Order>;
  }

  async update(id: string, updates: Partial<Order>): Promise<Order> {
    // Prepare order updates
    const orderUpdates: any = {};
    if (updates.status !== undefined) orderUpdates.status = updates.status;
    if (updates.kitchenStatus !== undefined) orderUpdates.kitchen_status = updates.kitchenStatus;
    if (updates.deliveryDate !== undefined) orderUpdates.delivery_date = updates.deliveryDate;
    if (updates.cakePrice !== undefined) orderUpdates.cake_price = updates.cakePrice;
    if (updates.deliveryPrice !== undefined) orderUpdates.delivery_price = updates.deliveryPrice;
    if (updates.notes !== undefined) orderUpdates.notes = updates.notes;
    if (updates.revisionCount !== undefined) orderUpdates.revision_count = updates.revisionCount;
    if (updates.approvalDate !== undefined) orderUpdates.approval_date = updates.approvalDate;
    if (updates.approvedBy !== undefined) orderUpdates.approved_by = updates.approvedBy;

    if (Object.keys(orderUpdates).length > 0) {
      const { error } = await supabase
        .from('orders')
        .update(orderUpdates)
        .eq('id', id);

      if (error) throw error;
    }

    // If status is changing, add a log entry
    if (updates.status !== undefined) {
      const current = await this.getById(id);
      if (current && current.status !== updates.status) {
        await this.addOrderLog(id, {
          type: 'status-change',
          previousStatus: current.status,
          newStatus: updates.status,
          timestamp: new Date()
        });
      }
    }

    return this.getById(id) as Promise<Order>;
  }

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  }

  async getByStatus(status: OrderStatus): Promise<Order[]> {
    const { data: orders, error } = await supabase
      .from('orders')
      .select(`
        *,
        customers (*),
        order_logs (*),
        order_print_history (*),
        order_tier_details (*),
        order_cover_colors (*),
        tier_detail_cover_colors (*),
        order_packing_items (*),
        order_revision_history (*),
        order_delivery_assignments (*),
        order_attachments (*),
        order_tags (*),
        order_ingredients (*)
      `)
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return orders?.map(order => this.mapOrderFromDb(order)) || [];
  }

  async getByCustomerId(customerId: string): Promise<Order[]> {
    const { data: orders, error } = await supabase
      .from('orders')
      .select(`
        *,
        customers (*),
        order_logs (*),
        order_print_history (*),
        order_tier_details (*),
        order_cover_colors (*),
        tier_detail_cover_colors (*),
        order_packing_items (*),
        order_revision_history (*),
        order_delivery_assignments (*),
        order_attachments (*),
        order_tags (*),
        order_ingredients (*)
      `)
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return orders?.map(order => this.mapOrderFromDb(order)) || [];
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
    } else {
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
    }

    const { data: orders, error } = await supabase
      .from('orders')
      .select(`
        *,
        customers (*),
        order_logs (*),
        order_print_history (*),
        order_tier_details (*),
        order_cover_colors (*),
        tier_detail_cover_colors (*),
        order_packing_items (*),
        order_revision_history (*),
        order_delivery_assignments (*),
        order_attachments (*),
        order_tags (*),
        order_ingredients (*)
      `)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false });

    if (error) throw error;

    return orders?.map(order => this.mapOrderFromDb(order)) || [];
  }

  async updatePrintHistory(orderId: string, printEvent: PrintEvent): Promise<Order> {
    // Add to print history table
    const { error } = await supabase
      .from('order_print_history')
      .insert({
        order_id: orderId,
        type: printEvent.type,
        timestamp: printEvent.timestamp,
        user_name: printEvent.user
      });

    if (error) throw error;

    // Add log entry
    await this.addOrderLog(orderId, {
      type: 'print',
      note: `Printed ${printEvent.type}`,
      timestamp: new Date(),
      metadata: { printEvent }
    });

    return this.getById(orderId) as Promise<Order>;
  }

  async addOrderLog(orderId: string, logEvent: Omit<OrderLogEvent, 'id'>): Promise<Order> {
    const { error } = await supabase
      .from('order_logs')
      .insert({
        id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        order_id: orderId,
        type: logEvent.type,
        previous_status: logEvent.previousStatus,
        new_status: logEvent.newStatus,
        note: logEvent.note,
        user_name: logEvent.user,
        timestamp: logEvent.timestamp,
        metadata: logEvent.metadata
      });

    if (error) throw error;

    return this.getById(orderId) as Promise<Order>;
  }

  async addRevision(orderId: string, revision: Omit<CakeRevision, 'id'>): Promise<Order> {
    const revisionId = `rev_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    const { error } = await supabase
      .from('order_revision_history')
      .insert({
        id: revisionId,
        order_id: orderId,
        notes: revision.notes,
        requested_by: revision.requestedBy,
        photos: revision.photos,
        timestamp: revision.timestamp
      });

    if (error) throw error;

    // Update revision count
    const current = await this.getById(orderId);
    const { error: updateError } = await supabase
      .from('orders')
      .update({ 
        revision_count: (current?.revisionCount || 0) + 1
      })
      .eq('id', orderId);

    if (updateError) throw updateError;

    return this.getById(orderId) as Promise<Order>;
  }

  async assignDriver(orderId: string, assignment: Omit<DeliveryAssignment, 'assignedAt'>): Promise<Order> {
    const { error } = await supabase
      .from('order_delivery_assignments')
      .insert({
        order_id: orderId,
        driver_type: assignment.driverType,
        driver_name: assignment.driverName,
        assigned_by: assignment.assignedBy,
        notes: assignment.notes,
        status: assignment.status,
        vehicle_info: assignment.vehicleInfo,
        is_preliminary: assignment.isPreliminary
      });

    if (error) throw error;

    // Add log entry
    await this.addOrderLog(orderId, {
      type: 'driver-assigned',
      note: `${assignment.isPreliminary ? 'Pre-assigned' : 'Assigned'} to ${assignment.driverType}${assignment.driverName ? ` (${assignment.driverName})` : ''}`,
      timestamp: new Date(),
      metadata: { assignment }
    });

    return this.getById(orderId) as Promise<Order>;
  }

  private mapOrderFromDb(order: any): Order {
    return {
      id: order.id,
      status: order.status,
      kitchenStatus: order.kitchen_status,
      customer: {
        id: order.customers.id,
        name: order.customers.name,
        whatsappNumber: order.customers.whatsappnumber,
        email: order.customers.email,
        addresses: [], // Not needed for orders
        createdAt: new Date(order.customers.created_at)
      },
      orderDate: order.order_date ? new Date(order.order_date) : undefined,
      deliveryDate: new Date(order.delivery_date),
      deliveryAddress: order.delivery_address,
      deliveryAddressNotes: order.delivery_address_notes,
      deliveryArea: order.delivery_area,
      deliveryMethod: order.delivery_method,
      deliveryTimeSlot: order.delivery_time_slot,
      cakeDesign: order.cake_design,
      cakeFlavor: order.cake_flavor,
      cakeSize: order.cake_size,
      cakeShape: order.cake_shape,
      customShape: order.custom_shape,
      cakeTier: order.cake_tier,
      coverType: order.cover_type,
      useSameFlavor: order.use_same_flavor,
      useSameCover: order.use_same_cover,
      cakeText: order.cake_text,
      greetingCard: order.greeting_card,
      notes: order.notes,
      cakePrice: order.cake_price,
      deliveryPrice: order.delivery_price,
      createdAt: new Date(order.created_at),
      updatedAt: order.updated_at ? new Date(order.updated_at) : undefined,
      revisionCount: order.revision_count || 0,
      approvalDate: order.approval_date ? new Date(order.approval_date) : undefined,
      approvedBy: order.approved_by,

      // Map related data
      orderLogs: order.order_logs?.map((log: any) => ({
        id: log.id,
        type: log.type,
        previousStatus: log.previous_status,
        newStatus: log.new_status,
        note: log.note,
        user: log.user_name,
        timestamp: new Date(log.timestamp),
        metadata: log.metadata
      })) || [],

      printHistory: order.order_print_history?.map((print: any) => ({
        type: print.type,
        timestamp: new Date(print.timestamp),
        user: print.user_name
      })) || [],

      tierDetails: order.order_tier_details?.map((tier: any) => ({
        tier: tier.tier,
        shape: tier.shape,
        size: tier.size,
        height: tier.height,
        flavor: tier.flavor,
        coverType: tier.cover_type,
        customShape: tier.custom_shape,
        coverColor: order.tier_detail_cover_colors?.find((color: any) => color.tier_detail_id === tier.id) ? {
          type: order.tier_detail_cover_colors.find((color: any) => color.tier_detail_id === tier.id).type,
          ...(order.tier_detail_cover_colors.find((color: any) => color.tier_detail_id === tier.id).color && { 
            color: order.tier_detail_cover_colors.find((color: any) => color.tier_detail_id === tier.id).color 
          }),
          ...(order.tier_detail_cover_colors.find((color: any) => color.tier_detail_id === tier.id).colors && { 
            colors: order.tier_detail_cover_colors.find((color: any) => color.tier_detail_id === tier.id).colors 
          }),
          ...(order.tier_detail_cover_colors.find((color: any) => color.tier_detail_id === tier.id).image_url && { 
            imageUrl: order.tier_detail_cover_colors.find((color: any) => color.tier_detail_id === tier.id).image_url 
          }),
          ...(order.tier_detail_cover_colors.find((color: any) => color.tier_detail_id === tier.id).notes && { 
            notes: order.tier_detail_cover_colors.find((color: any) => color.tier_detail_id === tier.id).notes 
          })
        } as CakeColor : { type: 'solid', color: '#ffffff' } as CakeColor
      })) || [],

      coverColor: order.order_cover_colors?.[0] ? {
        type: order.order_cover_colors[0].type,
        ...(order.order_cover_colors[0].color && { color: order.order_cover_colors[0].color }),
        ...(order.order_cover_colors[0].colors && { colors: order.order_cover_colors[0].colors }),
        ...(order.order_cover_colors[0].image_url && { imageUrl: order.order_cover_colors[0].image_url }),
        ...(order.order_cover_colors[0].notes && { notes: order.order_cover_colors[0].notes })
      } as CakeColor : { type: 'solid', color: '#ffffff' } as CakeColor,

      packingItems: order.order_packing_items?.map((item: any) => ({
        name: item.name,
        checked: item.checked
      })) || [],

      revisionHistory: order.order_revision_history?.map((revision: any) => ({
        id: revision.id,
        notes: revision.notes,
        requestedBy: revision.requested_by,
        photos: revision.photos,
        timestamp: new Date(revision.timestamp)
      })) || [],

      deliveryAssignment: order.order_delivery_assignments?.[0] ? {
        driverType: order.order_delivery_assignments[0].driver_type,
        driverName: order.order_delivery_assignments[0].driver_name,
        assignedBy: order.order_delivery_assignments[0].assigned_by,
        notes: order.order_delivery_assignments[0].notes,
        status: order.order_delivery_assignments[0].status,
        vehicleInfo: order.order_delivery_assignments[0].vehicle_info,
        isPreliminary: order.order_delivery_assignments[0].is_preliminary,
        assignedAt: new Date(order.order_delivery_assignments[0].assigned_at)
      } : undefined,

      ingredients: order.order_ingredients?.map((ingredient: any) => ({
        name: ingredient.name,
        quantity: ingredient.quantity,
        unit: ingredient.unit
      })) || []
    };
  }
}