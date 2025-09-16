import { Customer, Address } from "@/types";
import { BaseRepository } from "../base.repository";
import { supabase } from "@/integrations/supabase/client";
import { CustomerRepository } from "../customer.repository";

export class LiveCustomerRepository implements CustomerRepository {
  async getAll(): Promise<Customer[]> {
    const { data: customers, error } = await supabase
      .from('customers')
      .select(`
        *,
        addresses (*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return customers?.map(customer => ({
      id: customer.id,
      name: customer.name,
      whatsappNumber: customer.whatsappnumber,
      email: customer.email,
      addresses: customer.addresses || [],
      createdAt: new Date(customer.created_at),
      updatedAt: customer.updated_at ? new Date(customer.updated_at) : undefined
    })) || [];
  }

  async getById(id: string): Promise<Customer | undefined> {
    const { data: customer, error } = await supabase
      .from('customers')
      .select(`
        *,
        addresses (*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return undefined;
      throw error;
    }

    return {
      id: customer.id,
      name: customer.name,
      whatsappNumber: customer.whatsappnumber,
      email: customer.email,
      addresses: customer.addresses || [],
      createdAt: new Date(customer.created_at),
      updatedAt: customer.updated_at ? new Date(customer.updated_at) : undefined
    };
  }

  async create(customerData: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>): Promise<Customer> {
    // Start a transaction to create customer and addresses
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .insert({
        name: customerData.name,
        whatsappnumber: customerData.whatsappNumber,
        email: customerData.email
      })
      .select()
      .single();

    if (customerError) throw customerError;

    // Create addresses if provided
    if (customerData.addresses && customerData.addresses.length > 0) {
      const { error: addressError } = await supabase
        .from('addresses')
        .insert(
          customerData.addresses.map(address => ({
            customer_id: customer.id,
            text: address.text,
            area: address.area,
            delivery_notes: address.deliveryNotes
          }))
        );

      if (addressError) throw addressError;
    }

    // Fetch the complete customer with addresses
    return this.getById(customer.id) as Promise<Customer>;
  }

  async update(id: string, updates: Partial<Customer>): Promise<Customer> {
    // Update customer basic info
    const customerUpdates: any = {};
    if (updates.name !== undefined) customerUpdates.name = updates.name;
    if (updates.whatsappNumber !== undefined) customerUpdates.whatsappnumber = updates.whatsappNumber;
    if (updates.email !== undefined) customerUpdates.email = updates.email;

    if (Object.keys(customerUpdates).length > 0) {
      const { error } = await supabase
        .from('customers')
        .update(customerUpdates)
        .eq('id', id);

      if (error) throw error;
    }

    // Handle addresses if provided
    if (updates.addresses !== undefined) {
      // Delete existing addresses
      await supabase
        .from('addresses')
        .delete()
        .eq('customer_id', id);

      // Insert new addresses
      if (updates.addresses.length > 0) {
        const { error: addressError } = await supabase
          .from('addresses')
          .insert(
            updates.addresses.map(address => ({
              customer_id: id,
              text: address.text,
              area: address.area,
              delivery_notes: address.deliveryNotes
            }))
          );

        if (addressError) throw addressError;
      }
    }

    return this.getById(id) as Promise<Customer>;
  }

  async delete(id: string): Promise<boolean> {
    // Addresses will be deleted automatically due to foreign key constraint
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  }

  async findByWhatsApp(whatsappNumber: string): Promise<Customer | undefined> {
    const { data: customer, error } = await supabase
      .from('customers')
      .select(`
        *,
        addresses (*)
      `)
      .eq('whatsappnumber', whatsappNumber)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return undefined;
      throw error;
    }

    return {
      id: customer.id,
      name: customer.name,
      whatsappNumber: customer.whatsappnumber,
      email: customer.email,
      addresses: customer.addresses || [],
      createdAt: new Date(customer.created_at),
      updatedAt: customer.updated_at ? new Date(customer.updated_at) : undefined
    };
  }
}