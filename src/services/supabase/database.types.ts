
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type AppRole = 'admin' | 'kitchen' | 'baker' | 'delivery' | 'sales';

export interface Database {
  public: {
    Tables: {
      customers: {
        Row: {
          id: string;
          name: string;
          whatsappNumber: string;
          email: string | null;
          created_at: string;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          whatsappNumber: string;
          email?: string | null;
          created_at?: string;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          whatsappNumber?: string;
          email?: string | null;
          created_at?: string;
          updated_at?: string | null;
        };
      };
      addresses: {
        Row: {
          id: string;
          customer_id: string;
          text: string;
          delivery_notes: string | null;
          area: string;
          created_at: string;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          customer_id: string;
          text: string;
          delivery_notes?: string | null;
          area: string;
          created_at?: string;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          customer_id?: string;
          text?: string;
          delivery_notes?: string | null;
          area?: string;
          created_at?: string;
          updated_at?: string | null;
        };
      };
      profiles: {
        Row: {
          id: string;
          first_name: string | null;
          last_name: string | null;
          display_name: string | null;
          avatar_url: string | null;
          pin_hash: string | null;
          failed_pin_attempts: number | null;
          locked_until: string | null;
          created_at: string;
          updated_at: string | null;
        };
        Insert: {
          id: string;
          first_name?: string | null;
          last_name?: string | null;
          display_name?: string | null;
          avatar_url?: string | null;
          pin_hash?: string | null;
          failed_pin_attempts?: number | null;
          locked_until?: string | null;
          created_at?: string;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          first_name?: string | null;
          last_name?: string | null;
          display_name?: string | null;
          avatar_url?: string | null;
          pin_hash?: string | null;
          failed_pin_attempts?: number | null;
          locked_until?: string | null;
          created_at?: string;
          updated_at?: string | null;
        };
      };
      user_roles: {
        Row: {
          id: string;
          user_id: string;
          role: AppRole;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          role: AppRole;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          role?: AppRole;
          created_at?: string;
        };
      };
      orders: {
        Row: {}; // To be filled later
        Insert: {};
        Update: {};
      };
      settings: {
        Row: {}; // To be filled later
        Insert: {};
        Update: {};
      };
      gallery: {
        Row: {}; // To be filled with actual gallery schema
        Insert: {};
        Update: {};
      };
    };
    Functions: {
      get_user_roles: {
        Returns: AppRole[];
      };
      has_role: {
        Args: {
          role_to_check: AppRole;
        };
        Returns: boolean;
      };
      create_pin_user: {
        Args: {
          first_name: string;
          last_name: string;
          display_name: string;
          pin: string;
          roles: AppRole[];
        };
        Returns: string;
      };
      verify_pin: {
        Args: {
          user_id: string;
          pin: string;
        };
        Returns: boolean;
      };
      hash_pin: {
        Args: {
          pin: string;
        };
        Returns: string;
      };
    };
  };
}
