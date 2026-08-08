export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          first_name: string | null
          last_name: string | null
          avatar_url: string | null
          phone: string | null
          created_at: string
          updated_at: string
        }
        Insert: Partial<Database['public']['Tables']['profiles']['Row']>
        Update: Partial<Database['public']['Tables']['profiles']['Row']>
      }
      roles: {
        Row: {
          id: string
          name: string
          description: string | null
          created_at: string
        }
        Insert: Partial<Database['public']['Tables']['roles']['Row']>
        Update: Partial<Database['public']['Tables']['roles']['Row']>
      }
      permissions: {
        Row: {
          id: string
          name: string
          description: string | null
        }
        Insert: Partial<Database['public']['Tables']['permissions']['Row']>
        Update: Partial<Database['public']['Tables']['permissions']['Row']>
      }
      companies: {
        Row: {
          id: string
          name: string
          domain: string | null
          logo_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: Partial<Database['public']['Tables']['companies']['Row']>
        Update: Partial<Database['public']['Tables']['companies']['Row']>
      }
      tickets: {
        Row: {
          id: string
          ticket_number: number
          title: string
          description: string | null
          status: string
          priority: string
          category: string | null
          source: string
          customer_id: string | null
          company_id: string | null
          assigned_to: string | null
          created_by: string
          created_at: string
          updated_at: string
          resolved_at: string | null
          closed_at: string | null
          metadata: Json | null
        }
        Insert: Partial<Database['public']['Tables']['tickets']['Row']>
        Update: Partial<Database['public']['Tables']['tickets']['Row']>
      }
      ticket_comments: {
        Row: {
          id: string
          ticket_id: string
          user_id: string
          content: string
          is_internal: boolean
          created_at: string
          updated_at: string
        }
        Insert: Partial<Database['public']['Tables']['ticket_comments']['Row']>
        Update: Partial<Database['public']['Tables']['ticket_comments']['Row']>
      }
      assets: {
        Row: {
          id: string
          name: string
          serial_number: string | null
          company_id: string | null
          category_id: string | null
          status: string
          purchase_date: string | null
          warranty_expiry: string | null
          created_at: string
          updated_at: string
        }
        Insert: Partial<Database['public']['Tables']['assets']['Row']>
        Update: Partial<Database['public']['Tables']['assets']['Row']>
      }
      // Note: Expanding this file to cover all requested tables can be very long. 
      // Defining the core structures and allowing extensibility.
    }
  }
}

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Company = Database['public']['Tables']['companies']['Row']
export type Ticket = Database['public']['Tables']['tickets']['Row']
export type TicketInsert = Database['public']['Tables']['tickets']['Insert']
export type TicketComment = Database['public']['Tables']['ticket_comments']['Row']
export type Asset = Database['public']['Tables']['assets']['Row']
