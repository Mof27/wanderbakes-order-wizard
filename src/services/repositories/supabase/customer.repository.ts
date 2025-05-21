
import { Customer, Address } from "@/types";
import { CustomerRepository } from "../customer.repository";
import { SupabaseBaseRepository } from "./base.repository";
import { supabase } from "../../supabase/client";

export class SupabaseCustomerRepository extends SupabaseBaseRepository implements CustomerRepository {
  constructor() {
    super('customers'); // Pass table name to base repository
  }

  async getAll(): Promise<Customer[]> {
    const { data: customers, error } = await this.getClient()
      .from('customers')
      .select('*, addresses(*)');

    if (error) {
      console.error('Error fetching customers:', error);
      throw error;
    }

    return this.mapDatabaseCustomers(customers || []);
  }

  async getById(id: string): Promise<Customer | undefined> {
    const { data, error } = await this.getClient()
      .from('customers')
      .select('*, addresses(*)')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Not found
        return undefined;
      }
      console.error(`Error fetching customer with ID ${id}:`, error);
      throw error;
    }

    return this.mapDatabaseCustomer(data);
  }

  async create(customer: Omit<Customer, 'id' | 'createdAt'>): Promise<Customer> {
    const { addresses, ...customerData } = customer;
    
    // Insert customer
    const { data, error } = await this.getClient()
      .from('customers')
      .insert({
        name: customerData.name,
        whatsappnumber: customerData.whatsappNumber,
        email: customerData.email || null
      })
      .select('*')
      .single();

    if (error) {
      console.error('Error creating customer:', error);
      throw error;
    }

    const createdCustomer = data;
    const mappedAddresses: Address[] = [];

    // Insert addresses if they exist
    if (addresses && addresses.length > 0) {
      for (const address of addresses) {
        const addressData = {
          customer_id: createdCustomer.id,
          text: address.text,
          area: address.area,
          delivery_notes: address.deliveryNotes || null
        };

        const { data: createdAddress, error: addressError } = await this.getClient()
          .from('addresses')
          .insert(addressData)
          .select('*')
          .single();

        if (addressError) {
          console.error('Error creating address:', addressError);
          // Continue with other addresses even if one fails
        } else if (createdAddress) {
          mappedAddresses.push(this.mapDatabaseAddress(createdAddress));
        }
      }
    }

    // Return the created customer with addresses
    return {
      id: createdCustomer.id,
      name: createdCustomer.name,
      whatsappNumber: createdCustomer.whatsappnumber,
      email: createdCustomer.email || undefined,
      addresses: mappedAddresses,
      createdAt: new Date(createdCustomer.created_at)
    };
  }

  async update(id: string, customerUpdate: Partial<Customer>): Promise<Customer> {
    const { addresses, ...customerData } = customerUpdate;
    
    // Prepare customer data for update
    const updateData: Record<string, any> = {};
    
    if (customerData.name !== undefined) updateData.name = customerData.name;
    if (customerData.email !== undefined) updateData.email = customerData.email;
    if (customerData.whatsappNumber !== undefined) updateData.whatsappnumber = customerData.whatsappNumber;

    // Only update customer if there are fields to update
    if (Object.keys(updateData).length > 0) {
      const { error } = await this.getClient()
        .from('customers')
        .update(updateData)
        .eq('id', id);

      if (error) {
        console.error(`Error updating customer with ID ${id}:`, error);
        throw error;
      }
    }

    // Handle address updates if provided
    if (addresses) {
      // Delete existing addresses for this customer and insert new ones
      const { error: deleteError } = await this.getClient()
        .from('addresses')
        .delete()
        .eq('customer_id', id);

      if (deleteError) {
        console.error(`Error deleting addresses for customer with ID ${id}:`, deleteError);
        throw deleteError;
      }

      for (const address of addresses) {
        const addressData = {
          customer_id: id,
          text: address.text,
          area: address.area,
          delivery_notes: address.deliveryNotes || null
        };

        const { error: addressError } = await this.getClient()
          .from('addresses')
          .insert(addressData);

        if (addressError) {
          console.error('Error creating address during update:', addressError);
          // Continue with other addresses even if one fails
        }
      }
    }

    // Fetch the updated customer
    const { data, error } = await this.getClient()
      .from('customers')
      .select('*, addresses(*)')
      .eq('id', id)
      .single();

    if (error) {
      console.error(`Error fetching updated customer with ID ${id}:`, error);
      throw error;
    }

    return this.mapDatabaseCustomer(data);
  }

  async delete(id: string): Promise<boolean> {
    // Note: Addresses will be deleted automatically due to ON DELETE CASCADE constraint
    const { error } = await this.getClient()
      .from('customers')
      .delete()
      .eq('id', id);

    if (error) {
      console.error(`Error deleting customer with ID ${id}:`, error);
      throw error;
    }

    return true;
  }

  async findByWhatsApp(whatsappNumber: string): Promise<Customer | undefined> {
    const { data, error } = await this.getClient()
      .from('customers')
      .select('*, addresses(*)')
      .eq('whatsappnumber', whatsappNumber)
      .maybeSingle();

    if (error) {
      console.error(`Error finding customer with WhatsApp number ${whatsappNumber}:`, error);
      throw error;
    }

    if (!data) {
      return undefined;
    }

    return this.mapDatabaseCustomer(data);
  }

  // Helper methods for mapping database objects to domain objects
  private mapDatabaseCustomers(customers: any[]): Customer[] {
    return customers.map(customer => this.mapDatabaseCustomer(customer));
  }

  private mapDatabaseCustomer(customer: any): Customer {
    return {
      id: customer.id,
      name: customer.name,
      whatsappNumber: customer.whatsappnumber,
      email: customer.email || undefined,
      addresses: Array.isArray(customer.addresses) 
        ? customer.addresses.map((a: any) => this.mapDatabaseAddress(a))
        : [],
      createdAt: new Date(customer.created_at),
      updatedAt: customer.updated_at ? new Date(customer.updated_at) : undefined
    };
  }

  private mapDatabaseAddress(address: any): Address {
    return {
      id: address.id,
      text: address.text,
      area: address.area,
      deliveryNotes: address.delivery_notes || undefined,
      createdAt: new Date(address.created_at)
    };
  }
}
