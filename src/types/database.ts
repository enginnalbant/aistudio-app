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
      users: {
        Row: {
          id: string
          firebase_uid: string | null
          email: string
          full_name: string | null
          role: 'admin' | 'user' | 'viewer'
          avatar_url: string | null
          created_at: string | null
          updated_at: string | null
          deleted_at: string | null
        }
        Insert: {
          id?: string
          firebase_uid?: string | null
          email: string
          full_name?: string | null
          role?: 'admin' | 'user' | 'viewer'
          avatar_url?: string | null
          created_at?: string | null
          updated_at?: string | null
          deleted_at?: string | null
        }
        Update: {
          id?: string
          firebase_uid?: string | null
          email?: string
          full_name?: string | null
          role?: 'admin' | 'user' | 'viewer'
          avatar_url?: string | null
          created_at?: string | null
          updated_at?: string | null
          deleted_at?: string | null
        }
      }
      accounts: {
        Row: {
          id: string
          user_id: string | null
          account_type: string | null
          company_name: string | null
          contact_name: string | null
          email: string | null
          phone: string | null
          address: string | null
          payment_terms: string | null
          balance: number | null
          metadata: Json | null
          created_at: string | null
          updated_at: string | null
          deleted_at: string | null
          // Turkish columns
          "Cari Kodu"?: string | null
          "Cari İsmi"?: string | null
          "Adres"?: string | null
          "İlçe"?: string | null
          "İl"?: string | null
          "Posta Kodu"?: string | null
          "Vergi Dairesi"?: string | null
          "Vergi Numarası"?: string | null
          "TC Kimlik No"?: string | null
          "Vade Günü"?: number | null
          "Telefon"?: string | null
          "Email"?: string | null
          "İskonto Oranı"?: number | null
          "Döviz Tipi"?: string | null
        }
        Insert: {
          [key: string]: any
        }
        Update: {
          [key: string]: any
        }
      }
      stock: {
        Row: {
          "Stok İsmi": string
          "Stok Kodu": string
          quantity: number | null
          reserved_quantity: number | null
          available_quantity: number | null
          avg_cost: number | null
          total_value: number | null
          lot_number: string | null
          serial_number: string | null
          expiry_date: string | null
          last_counted_at: string | null
          updated_at: string | null
        }
        Insert: {
          [key: string]: any
        }
        Update: {
          [key: string]: any
        }
      }
      stocks: {
        Row: {
          id: string
          user_id: string | null
          code: string
          name: string
          category: string | null
          unit: string
          critical_level: number
          created_at: string | null
          updated_at: string | null
        }
      }
      jobs: {
        Row: {
          id: string
          account_id: string
          date: string
          type: string
          status: string
          user_id: string | null
          created_at: string | null
        }
        Insert: {
          [key: string]: any
        }
        Update: {
          [key: string]: any
        }
      }
      job_items: {
        Row: {
          id: string
          job_id: string
          stock_id: string | null
          qty: number
          price: number
          user_id: string | null
        }
        Insert: {
          [key: string]: any
        }
        Update: {
          [key: string]: any
        }
      }
      payments: {
        Row: {
          id: string
          account_id: string
          amount: number
          type: string
          date: string
          user_id: string | null
        }
        Insert: {
          [key: string]: any
        }
        Update: {
          [key: string]: any
        }
      }
      stock_movements: {
        Row: {
          id: string
          stock_id: string
          type: string
          qty: number
          user_id: string | null
          created_at: string | null
        }
        Insert: {
          [key: string]: any
        }
        Update: {
          [key: string]: any
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: 'admin' | 'user' | 'viewer'
      job_status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
      job_type: 'production' | 'service' | 'custom'
      account_type: 'customer' | 'supplier' | 'both'
      payment_method: 'cash' | 'credit_card' | 'bank_transfer' | 'check'
      movement_type: 'in' | 'out' | 'adjustment' | 'count'
      shipment_status: 'pending' | 'in_transit' | 'delivered' | 'cancelled'
      task_status: 'todo' | 'in_progress' | 'done' | 'archived'
      task_priority: 'low' | 'medium' | 'high' | 'urgent'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
