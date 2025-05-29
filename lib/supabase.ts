import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables")
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side client for admin operations
export const createServerSupabaseClient = () => {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey) {
    console.warn("Service role key not available, using anon key")
    return createClient(supabaseUrl, supabaseAnonKey)
  }
  return createClient(supabaseUrl, serviceRoleKey)
}

// Database schema types
export interface Database {
  public: {
    Tables: {
      books: {
        Row: {
          id: string
          title: string
          author: string
          category: string
          price: number
          stock_quantity: number
          rating: number
          description: string
          image_url: string
          isbn: string
          publisher: string
          publication_date: string
          pages: number
          language: string
          format: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          author: string
          category: string
          price: number
          stock_quantity: number
          rating?: number
          description?: string
          image_url?: string
          isbn?: string
          publisher?: string
          publication_date?: string
          pages?: number
          language?: string
          format?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          author?: string
          category?: string
          price?: number
          stock_quantity?: number
          rating?: number
          description?: string
          image_url?: string
          isbn?: string
          publisher?: string
          publication_date?: string
          pages?: number
          language?: string
          format?: string
          updated_at?: string
        }
      }
      system_logs: {
        Row: {
          id: string
          event_type: string
          user_id: string | null
          user_email: string | null
          ip_address: string | null
          user_agent: string | null
          session_id: string | null
          event_data: any
          severity: "info" | "warning" | "error" | "critical"
          timestamp: string
          module: string
          action: string
          status: "success" | "failure" | "pending"
          metadata: any | null
          created_at: string
        }
        Insert: {
          id?: string
          event_type: string
          user_id?: string | null
          user_email?: string | null
          ip_address?: string | null
          user_agent?: string | null
          session_id?: string | null
          event_data?: any
          severity: "info" | "warning" | "error" | "critical"
          timestamp: string
          module: string
          action: string
          status: "success" | "failure" | "pending"
          metadata?: any | null
          created_at?: string
        }
      }
      auth_logs: {
        Row: {
          id: string
          user_id: string | null
          email: string
          event_type: string
          ip_address: string | null
          user_agent: string | null
          failure_reason: string | null
          timestamp: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          email: string
          event_type: string
          ip_address?: string | null
          user_agent?: string | null
          failure_reason?: string | null
          timestamp: string
          created_at?: string
        }
      }
      payment_logs: {
        Row: {
          id: string
          user_id: string
          order_id: string
          payment_method: string
          amount: number
          currency: string
          transaction_id: string | null
          card_last_four: string | null
          billing_address: any
          status: "pending" | "completed" | "failed" | "refunded"
          timestamp: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          order_id: string
          payment_method: string
          amount: number
          currency: string
          transaction_id?: string | null
          card_last_four?: string | null
          billing_address: any
          status: "pending" | "completed" | "failed" | "refunded"
          timestamp: string
          created_at?: string
        }
      }
      shipping_logs: {
        Row: {
          id: string
          user_id: string
          order_id: string
          shipping_method: string
          shipping_address: any
          tracking_number: string | null
          estimated_delivery: string | null
          cost: number
          timestamp: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          order_id: string
          shipping_method: string
          shipping_address: any
          tracking_number?: string | null
          estimated_delivery?: string | null
          cost: number
          timestamp: string
          created_at?: string
        }
      }
    }
  }
}
