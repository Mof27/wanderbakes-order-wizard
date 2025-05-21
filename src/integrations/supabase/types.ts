export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      addresses: {
        Row: {
          area: string
          created_at: string
          customer_id: string
          delivery_notes: string | null
          id: string
          text: string
          updated_at: string | null
        }
        Insert: {
          area: string
          created_at?: string
          customer_id: string
          delivery_notes?: string | null
          id?: string
          text: string
          updated_at?: string | null
        }
        Update: {
          area?: string
          created_at?: string
          customer_id?: string
          delivery_notes?: string | null
          id?: string
          text?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "addresses_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      baking_tasks: {
        Row: {
          cake_flavor: string
          cake_shape: string
          cake_size: string
          cancellation_reason: string | null
          created_at: string
          due_date: string
          height: string | null
          id: string
          is_manual: boolean | null
          is_priority: boolean | null
          notes: string | null
          order_ids: Json | null
          quality_checks: Json | null
          quantity: number
          quantity_completed: number
          status: string
          updated_at: string | null
        }
        Insert: {
          cake_flavor: string
          cake_shape: string
          cake_size: string
          cancellation_reason?: string | null
          created_at?: string
          due_date: string
          height?: string | null
          id?: string
          is_manual?: boolean | null
          is_priority?: boolean | null
          notes?: string | null
          order_ids?: Json | null
          quality_checks?: Json | null
          quantity: number
          quantity_completed?: number
          status: string
          updated_at?: string | null
        }
        Update: {
          cake_flavor?: string
          cake_shape?: string
          cake_size?: string
          cancellation_reason?: string | null
          created_at?: string
          due_date?: string
          height?: string | null
          id?: string
          is_manual?: boolean | null
          is_priority?: boolean | null
          notes?: string | null
          order_ids?: Json | null
          quality_checks?: Json | null
          quantity?: number
          quantity_completed?: number
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      cake_inventory: {
        Row: {
          cake_flavor: string
          cake_shape: string
          cake_size: string
          height: string | null
          id: string
          last_updated: string
          quantity: number
        }
        Insert: {
          cake_flavor: string
          cake_shape: string
          cake_size: string
          height?: string | null
          id?: string
          last_updated?: string
          quantity?: number
        }
        Update: {
          cake_flavor?: string
          cake_shape?: string
          cake_size?: string
          height?: string | null
          id?: string
          last_updated?: string
          quantity?: number
        }
        Relationships: []
      }
      customers: {
        Row: {
          created_at: string
          email: string | null
          id: string
          name: string
          updated_at: string | null
          whatsappnumber: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          name: string
          updated_at?: string | null
          whatsappnumber: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          updated_at?: string | null
          whatsappnumber?: string
        }
        Relationships: []
      }
      order_attachments: {
        Row: {
          created_at: string
          id: string
          order_id: string
          type: string
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          type: string
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          type?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_attachments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_cover_colors: {
        Row: {
          color: string | null
          colors: Json | null
          created_at: string
          id: string
          image_url: string | null
          notes: string | null
          order_id: string
          type: string
        }
        Insert: {
          color?: string | null
          colors?: Json | null
          created_at?: string
          id?: string
          image_url?: string | null
          notes?: string | null
          order_id: string
          type: string
        }
        Update: {
          color?: string | null
          colors?: Json | null
          created_at?: string
          id?: string
          image_url?: string | null
          notes?: string | null
          order_id?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_cover_colors_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_delivery_assignments: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          created_at: string
          driver_name: string | null
          driver_type: string
          id: string
          is_preliminary: boolean | null
          notes: string | null
          order_id: string
          status: string | null
          vehicle_info: string | null
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          created_at?: string
          driver_name?: string | null
          driver_type: string
          id?: string
          is_preliminary?: boolean | null
          notes?: string | null
          order_id: string
          status?: string | null
          vehicle_info?: string | null
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          created_at?: string
          driver_name?: string | null
          driver_type?: string
          id?: string
          is_preliminary?: boolean | null
          notes?: string | null
          order_id?: string
          status?: string | null
          vehicle_info?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_delivery_assignments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_ingredients: {
        Row: {
          created_at: string
          id: string
          name: string
          order_id: string
          quantity: number
          unit: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          order_id: string
          quantity: number
          unit: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          order_id?: string
          quantity?: number
          unit?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_ingredients_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_logs: {
        Row: {
          created_at: string
          id: string
          metadata: Json | null
          new_status: string | null
          note: string | null
          order_id: string
          previous_status: string | null
          timestamp: string
          type: string
          user_name: string | null
        }
        Insert: {
          created_at?: string
          id: string
          metadata?: Json | null
          new_status?: string | null
          note?: string | null
          order_id: string
          previous_status?: string | null
          timestamp?: string
          type: string
          user_name?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json | null
          new_status?: string | null
          note?: string | null
          order_id?: string
          previous_status?: string | null
          timestamp?: string
          type?: string
          user_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_logs_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_packing_items: {
        Row: {
          checked: boolean
          created_at: string
          id: string
          name: string
          order_id: string
        }
        Insert: {
          checked?: boolean
          created_at?: string
          id?: string
          name: string
          order_id: string
        }
        Update: {
          checked?: boolean
          created_at?: string
          id?: string
          name?: string
          order_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_packing_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_print_history: {
        Row: {
          id: string
          order_id: string
          timestamp: string
          type: string
          user_name: string | null
        }
        Insert: {
          id?: string
          order_id: string
          timestamp?: string
          type: string
          user_name?: string | null
        }
        Update: {
          id?: string
          order_id?: string
          timestamp?: string
          type?: string
          user_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_print_history_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_revision_history: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          order_id: string
          photos: Json
          requested_by: string | null
          timestamp: string
        }
        Insert: {
          created_at?: string
          id: string
          notes?: string | null
          order_id: string
          photos: Json
          requested_by?: string | null
          timestamp?: string
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          order_id?: string
          photos?: Json
          requested_by?: string | null
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_revision_history_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_tags: {
        Row: {
          created_at: string
          id: string
          order_id: string
          tag: string
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          tag: string
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          tag?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_tags_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_tier_details: {
        Row: {
          cover_type: string
          created_at: string
          custom_shape: string | null
          flavor: string | null
          height: string | null
          id: string
          order_id: string
          shape: string
          size: string
          tier: number
        }
        Insert: {
          cover_type: string
          created_at?: string
          custom_shape?: string | null
          flavor?: string | null
          height?: string | null
          id?: string
          order_id: string
          shape: string
          size: string
          tier: number
        }
        Update: {
          cover_type?: string
          created_at?: string
          custom_shape?: string | null
          flavor?: string | null
          height?: string | null
          id?: string
          order_id?: string
          shape?: string
          size?: string
          tier?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_tier_details_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          actual_delivery_time: string | null
          approval_date: string | null
          approved_by: string | null
          archived_date: string | null
          cake_design: string
          cake_flavor: string
          cake_price: number
          cake_shape: string
          cake_size: string
          cake_text: string | null
          cake_tier: number
          cover_type: string | null
          created_at: string
          custom_shape: string | null
          customer_feedback: string | null
          customer_id: string
          delivery_address: string
          delivery_address_notes: string | null
          delivery_area: string | null
          delivery_date: string
          delivery_method: string | null
          delivery_price: number | null
          delivery_time_slot: string | null
          greeting_card: string | null
          id: string
          kitchen_status: string | null
          notes: string | null
          order_date: string | null
          revision_count: number | null
          revision_notes: string | null
          status: string
          updated_at: string | null
          use_same_cover: boolean | null
          use_same_flavor: boolean
        }
        Insert: {
          actual_delivery_time?: string | null
          approval_date?: string | null
          approved_by?: string | null
          archived_date?: string | null
          cake_design: string
          cake_flavor: string
          cake_price: number
          cake_shape: string
          cake_size: string
          cake_text?: string | null
          cake_tier: number
          cover_type?: string | null
          created_at?: string
          custom_shape?: string | null
          customer_feedback?: string | null
          customer_id: string
          delivery_address: string
          delivery_address_notes?: string | null
          delivery_area?: string | null
          delivery_date: string
          delivery_method?: string | null
          delivery_price?: number | null
          delivery_time_slot?: string | null
          greeting_card?: string | null
          id: string
          kitchen_status?: string | null
          notes?: string | null
          order_date?: string | null
          revision_count?: number | null
          revision_notes?: string | null
          status: string
          updated_at?: string | null
          use_same_cover?: boolean | null
          use_same_flavor?: boolean
        }
        Update: {
          actual_delivery_time?: string | null
          approval_date?: string | null
          approved_by?: string | null
          archived_date?: string | null
          cake_design?: string
          cake_flavor?: string
          cake_price?: number
          cake_shape?: string
          cake_size?: string
          cake_text?: string | null
          cake_tier?: number
          cover_type?: string | null
          created_at?: string
          custom_shape?: string | null
          customer_feedback?: string | null
          customer_id?: string
          delivery_address?: string
          delivery_address_notes?: string | null
          delivery_area?: string | null
          delivery_date?: string
          delivery_method?: string | null
          delivery_price?: number | null
          delivery_time_slot?: string | null
          greeting_card?: string | null
          id?: string
          kitchen_status?: string | null
          notes?: string | null
          order_date?: string | null
          revision_count?: number | null
          revision_notes?: string | null
          status?: string
          updated_at?: string | null
          use_same_cover?: boolean | null
          use_same_flavor?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      production_log: {
        Row: {
          baker: string | null
          cake_flavor: string
          cake_shape: string
          cake_size: string
          cancellation_reason: string | null
          cancelled: boolean | null
          completed_at: string
          id: string
          is_manual: boolean | null
          notes: string | null
          quality_checks: Json | null
          quantity: number
          task_id: string | null
        }
        Insert: {
          baker?: string | null
          cake_flavor: string
          cake_shape: string
          cake_size: string
          cancellation_reason?: string | null
          cancelled?: boolean | null
          completed_at?: string
          id?: string
          is_manual?: boolean | null
          notes?: string | null
          quality_checks?: Json | null
          quantity: number
          task_id?: string | null
        }
        Update: {
          baker?: string | null
          cake_flavor?: string
          cake_shape?: string
          cake_size?: string
          cancellation_reason?: string | null
          cancelled?: boolean | null
          completed_at?: string
          id?: string
          is_manual?: boolean | null
          notes?: string | null
          quality_checks?: Json | null
          quantity?: number
          task_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "production_log_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "baking_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          first_name: string | null
          id: string
          last_name: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      settings: {
        Row: {
          created_at: string
          id: string
          key: string
          updated_at: string | null
          value: Json
        }
        Insert: {
          created_at?: string
          id?: string
          key: string
          updated_at?: string | null
          value: Json
        }
        Update: {
          created_at?: string
          id?: string
          key?: string
          updated_at?: string | null
          value?: Json
        }
        Relationships: []
      }
      tier_detail_cover_colors: {
        Row: {
          color: string | null
          colors: Json | null
          created_at: string
          id: string
          image_url: string | null
          notes: string | null
          tier_detail_id: string
          type: string
        }
        Insert: {
          color?: string | null
          colors?: Json | null
          created_at?: string
          id?: string
          image_url?: string | null
          notes?: string | null
          tier_detail_id: string
          type: string
        }
        Update: {
          color?: string | null
          colors?: Json | null
          created_at?: string
          id?: string
          image_url?: string | null
          notes?: string | null
          tier_detail_id?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "tier_detail_cover_colors_tier_detail_id_fkey"
            columns: ["tier_detail_id"]
            isOneToOne: false
            referencedRelation: "order_tier_details"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_roles: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["app_role"][]
      }
      has_role: {
        Args: { role_to_check: Database["public"]["Enums"]["app_role"] }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "kitchen" | "baker" | "delivery" | "sales"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "kitchen", "baker", "delivery", "sales"],
    },
  },
} as const
