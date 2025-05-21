
import { supabase, isSupabaseConfigured } from '../../supabase/client';

export class SupabaseBaseRepository {
  protected tableName: string;
  
  constructor(tableName: string) {
    this.tableName = tableName;
  }
  
  protected getClient() {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase is not configured properly. Please check your environment variables.');
    }
    return supabase;
  }
  
  protected async getAll<T>(): Promise<T[]> {
    const { data, error } = await this.getClient()
      .from(this.tableName)
      .select('*');
      
    if (error) {
      throw error;
    }
    
    return data as T[];
  }
  
  protected async getById<T>(id: string): Promise<T | null> {
    const { data, error } = await this.getClient()
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) {
      if (error.code === 'PGRST116') { // Record not found error
        return null;
      }
      throw error;
    }
    
    return data as T;
  }
  
  protected async create<T extends { id?: string }>(item: T): Promise<T> {
    const { data, error } = await this.getClient()
      .from(this.tableName)
      .insert([item])
      .select()
      .single();
      
    if (error) {
      throw error;
    }
    
    return data as T;
  }
  
  protected async update<T extends { id: string }>(item: T): Promise<T> {
    const { data, error } = await this.getClient()
      .from(this.tableName)
      .update(item)
      .eq('id', item.id)
      .select()
      .single();
      
    if (error) {
      throw error;
    }
    
    return data as T;
  }
  
  protected async delete(id: string): Promise<void> {
    const { error } = await this.getClient()
      .from(this.tableName)
      .delete()
      .eq('id', id);
      
    if (error) {
      throw error;
    }
  }
}
