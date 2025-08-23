// Database type definitions for Supabase integration
// Generated from database schema - update when schema changes

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
          id: number
          clerk_id: string | null
          email: string
          name: string | null
          created_at: string | null
          updated_at: string | null
          deleted_at: string | null
        }
        Insert: {
          id?: number
          clerk_id?: string | null
          email: string
          name?: string | null
          created_at?: string | null
          updated_at?: string | null
          deleted_at?: string | null
        }
        Update: {
          id?: number
          clerk_id?: string | null
          email?: string
          name?: string | null
          created_at?: string | null
          updated_at?: string | null
          deleted_at?: string | null
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          id: number
          user_id: number | null
          clerk_id: string
          first_name: string | null
          age: number | null
          ethnicity: string | null
          rating: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: number
          user_id?: number | null
          clerk_id: string
          first_name?: string | null
          age?: number | null
          ethnicity?: string | null
          rating?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: number
          user_id?: number | null
          clerk_id?: string
          first_name?: string | null
          age?: number | null
          ethnicity?: string | null
          rating?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      user_interactions: {
        Row: {
          id: number
          user_id: number | null
          clerk_id: string
          profile_id: number | null
          date: string
          cost: string
          time_minutes: number
          nuts: number
          notes: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: number
          user_id?: number | null
          clerk_id: string
          profile_id?: number | null
          date: string
          cost: string
          time_minutes: number
          nuts: number
          notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: number
          user_id?: number | null
          clerk_id?: string
          profile_id?: number | null
          date?: string
          cost?: string
          time_minutes?: number
          nuts?: number
          notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_interactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_interactions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      teams: {
        Row: {
          id: number
          name: string
          created_at: string | null
          updated_at: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          stripe_product_id: string | null
          plan_name: string | null
          subscription_status: string | null
          trial_end: string | null
        }
        Insert: {
          id?: number
          name: string
          created_at?: string | null
          updated_at?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          stripe_product_id?: string | null
          plan_name?: string | null
          subscription_status?: string | null
          trial_end?: string | null
        }
        Update: {
          id?: number
          name?: string
          created_at?: string | null
          updated_at?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          stripe_product_id?: string | null
          plan_name?: string | null
          subscription_status?: string | null
          trial_end?: string | null
        }
        Relationships: []
      }
      team_members: {
        Row: {
          id: number
          user_id: number | null
          team_id: number | null
          role: string
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: number
          user_id?: number | null
          team_id?: number | null
          role: string
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: number
          user_id?: number | null
          team_id?: number | null
          role?: string
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "team_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          }
        ]
      }
      activity_logs: {
        Row: {
          id: number
          team_id: number | null
          user_id: number | null
          action: string
          timestamp: string | null
          ip_address: string | null
        }
        Insert: {
          id?: number
          team_id?: number | null
          user_id?: number | null
          action: string
          timestamp?: string | null
          ip_address?: string | null
        }
        Update: {
          id?: number
          team_id?: number | null
          user_id?: number | null
          action?: string
          timestamp?: string | null
          ip_address?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_logs_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      invitations: {
        Row: {
          id: number
          team_id: number | null
          email: string
          role: string
          invited_by: number | null
          invited_at: string | null
          status: string
        }
        Insert: {
          id?: number
          team_id?: number | null
          email: string
          role: string
          invited_by?: number | null
          invited_at?: string | null
          status: string
        }
        Update: {
          id?: number
          team_id?: number | null
          email?: string
          role?: string
          invited_by?: number | null
          invited_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "invitations_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invitations_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}