
import { Customer } from "@/types";
import { SupabaseBaseRepository } from "./base.repository";
import { CustomerRepository } from "../customer.repository";
import { supabase, isSupabaseConfigured } from "../../supabase/client";
import { config } from "@/config";

/**
 * Supabase implementation of the Customer Repository
 */
export class SupabaseCustomerRepository extends SupabaseBaseRepository implements CustomerRepository {
  constructor() {
    super('customers'); // Table name in Supabase
  }

  async getAll(): Promise<Customer[]> {
    try {
      // Get customers with their addresses using Supabase's foreign key relationships
      const { data, error } = await this.getClient()
        .from(this.tableName)
        .select(`
          *,
          addresses(*)
        `);

      if (error) {
        throw error;
      }

      // Transform the data to match our Customer type
      return data.map(this.mapCustomerFromSupabase);
    } catch (error) {
      console.error("Failed to get customers:", error);
      throw error;
    }
  }

  async getById(id: string): Promise<Customer | undefined> {
    try {
      const { data, error } = await this.getClient()
        .from(this.tableName)
        .select(`
          *,
          addresses(*)
        `)
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') { // Record not found error
          return undefined;
        }
        throw error;
      }

      return this.mapCustomerFromSupabase(data);
    } catch (error) {
      console.error(`Failed to get customer with id ${id}:`, error);
      throw error;
    }
  }

  async create(customer: Omit<Customer, 'id' | 'createdAt'>): Promise<Customer> {
    try {
      // Extract addresses to handle separately
      const { addresses, ...customerData } = customer;
      
      // Create customer record
      const { data: newCustomer, error } = await this.getClient()
        .from(this.tableName)
        .insert([{
          name: customerData.name,
          whatsappNumber: customerData.whatsappNumber,
          email: customerData.email || null,
          // createdAt is handled by Supabase using NOW()
        }])
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Create address records if any
      if (addresses && addresses.length > 0) {
        const addressesToInsert = addresses.map(address => ({
          customer_id: newCustomer.id,
          text: address.text,
          delivery_notes: address.deliveryNotes || null,
          area: address.area,
          // createdAt is handled by Supabase using NOW()
        }));

        const { error: addressError } = await this.getClient()
          .from('addresses')
          .insert(addressesToInsert);

        if (addressError) {
          throw addressError;
        }
      }

      // Get the full customer with addresses
      return await this.getById(newCustomer.id) as Customer;
    } catch (error) {
      console.error("Failed to create customer:", error);
      throw error;
    }
  }

  async update(id: string, customerUpdate: Partial<Customer>): Promise<Customer> {
    try {
      // Extract addresses to handle separately
      const { addresses, ...customerData } = customerUpdate;
      
      // Update customer record
      if (Object.keys(customerData).length > 0) {
        const { error } = await this.getClient()
          .from(this.tableName)
          .update({
            name: customerData.name,
            whatsappNumber: customerData.whatsappNumber,
            email: customerData.email,
            // updatedAt is handled by Supabase using NOW()
          })
          .eq('id', id);

        if (error) {
          throw error;
        }
      }

      // Handle address updates if provided
      if (addresses) {
        // In a real implementation, you'd need to handle address creation, updates, and deletion
        // This is a simplified version that would replace all addresses
        const { error: deleteError } = await this.getClient()
          .from('addresses')
          .delete()
          .eq('customer_id', id);

        if (deleteError) {
          throw deleteError;
        }

        if (addresses.length > 0) {
          const addressesToInsert = addresses.map(address => ({
            customer_id: id,
            text: address.text,
            delivery_notes: address.deliveryNotes || null,
            area: address.area,
          }));

          const { error: insertError } = await this.getClient()
            .from('addresses')
            .insert(addressesToInsert);

          if (insertError) {
            throw insertError;
          }
        }
      }

      // Get the updated customer with addresses
      return await this.getById(id) as Customer;
    } catch (error) {
      console.error(`Failed to update customer with id ${id}:`, error);
      throw error;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      // Delete addresses first (cascading delete should handle this, but being explicit)
      const { error: addressError } = await this.getClient()
        .from('addresses')
        .delete()
        .eq('customer_id', id);

      if (addressError) {
        throw addressError;
      }

      // Delete the customer
      const { error } = await this.getClient()
        .from(this.tableName)
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      return true;
    } catch (error) {
      console.error(`Failed to delete customer with id ${id}:`, error);
      throw error;
    }
  }

  async findByWhatsApp(whatsappNumber: string): Promise<Customer | undefined> {
    try {
      const { data, error } = await this.getClient()
        .from(this.tableName)
        .select(`
          *,
          addresses(*)
        `)
        .eq('whatsappNumber', whatsappNumber)
        .single();

      if (error) {
        if (error.code === 'PGRST116') { // Record not found error
          return undefined;
        }
        throw error;
      }

      return this.mapCustomerFromSupabase(data);
    } catch (error) {
      console.error(`Failed to find customer with WhatsApp number ${whatsappNumber}:`, error);
      throw error;
    }
  }

  /**
   * Maps Supabase customer data to our Customer type
   */
  private mapCustomerFromSupabase(data: any): Customer {
    return {
      id: data.id,
      name: data.name,
      whatsappNumber: data.whatsappNumber,
      email: data.email || undefined,
      addresses: Array.isArray(data.addresses) 
        ? data.addresses.map((address: any) => ({
            id: address.id,
            text: address.text,
            deliveryNotes: address.delivery_notes || undefined,
            area: address.area,
            createdAt: new Date(address.created_at),
            updatedAt: address.updated_at ? new Date(address.updated_at) : undefined,
          }))
        : [],
      createdAt: new Date(data.created_at),
      updatedAt: data.updated_at ? new Date(data.updated_at) : undefined,
    };
  }
}
