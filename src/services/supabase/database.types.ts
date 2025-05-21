
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

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
  };
}
