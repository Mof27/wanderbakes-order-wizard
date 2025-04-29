import { Customer, Address } from "@/types";
import { BaseRepository } from "./base.repository";

export interface CustomerRepository extends BaseRepository<Customer> {
  findByWhatsApp(whatsappNumber: string): Promise<Customer | undefined>;
}

export class MockCustomerRepository implements CustomerRepository {
  private customers: Customer[] = [];

  constructor(initialData: Customer[] = []) {
    // Handle migration from old structure (single address) to new structure (multiple addresses)
    this.customers = initialData.map(customer => {
      // @ts-ignore - Handle old format with address property
      if (!Array.isArray(customer.addresses) && customer.addresses === undefined) {
        // Convert old format to new format
        return {
          ...customer,
          addresses: [
            // @ts-ignore - Handle old format with address property
            ...(customer.addresses ? [] : [])
          ],
        };
      }
      // Already in the new format
      return {
        ...customer,
        addresses: customer.addresses || []
      };
    });
  }

  async getAll(): Promise<Customer[]> {
    return [...this.customers];
  }

  async getById(id: string): Promise<Customer | undefined> {
    return this.customers.find(customer => customer.id === id);
  }

  async create(customer: Omit<Customer, 'id' | 'createdAt'>): Promise<Customer> {
    const newCustomer = {
      ...customer,
      id: `c${this.customers.length + 1}`,
      createdAt: new Date(),
      // Ensure addresses are properly initialized
      addresses: customer.addresses || [],
    };
    this.customers.push(newCustomer);
    return newCustomer;
  }

  async update(id: string, customer: Partial<Customer>): Promise<Customer> {
    const index = this.customers.findIndex(c => c.id === id);
    if (index === -1) throw new Error(`Customer with id ${id} not found`);
    
    this.customers[index] = {
      ...this.customers[index],
      ...customer,
      updatedAt: new Date()
    };
    
    return this.customers[index];
  }

  async delete(id: string): Promise<boolean> {
    const initialLength = this.customers.length;
    this.customers = this.customers.filter(c => c.id !== id);
    return initialLength !== this.customers.length;
  }

  async findByWhatsApp(whatsappNumber: string): Promise<Customer | undefined> {
    return this.customers.find(c => c.whatsappNumber === whatsappNumber);
  }
}
