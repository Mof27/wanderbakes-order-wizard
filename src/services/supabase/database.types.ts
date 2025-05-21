
// This file will be replaced with the actual types generated from Supabase
// For now, we'll use a placeholder type definition

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
      orders: {
        Row: {}; // To be filled with actual order schema
        Insert: {}; 
        Update: {};
      };
      customers: {
        Row: {}; // To be filled with actual customer schema
        Insert: {};
        Update: {};
      };
      settings: {
        Row: {}; // To be filled with actual settings schema
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
