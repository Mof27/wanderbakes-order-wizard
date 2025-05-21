
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
}
