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
          full_name: string | null
          phone: string | null
          role: 'admin' | 'owner'
          avatar_url: string | null
          onboarding_completed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          phone?: string | null
          role?: 'admin' | 'owner'
          avatar_url?: string | null
          onboarding_completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          phone?: string | null
          role?: 'admin' | 'owner'
          avatar_url?: string | null
          onboarding_completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      cities: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          hero_image: string | null
          is_featured: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          hero_image?: string | null
          is_featured?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          hero_image?: string | null
          is_featured?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      lounges: {
        Row: {
          id: string
          name: string
          city_id: string | null
          owner_id: string | null
          address: string | null
          phone: string | null
          website: string | null
          description: string | null
          lounge_type: 'Lounge' | 'Bar' | 'Retail' | 'Private Club' | null
          amenities: string[]
          images: string[]
          is_featured: boolean
          is_claimed: boolean
          is_verified: boolean
          status: 'pending' | 'approved' | 'rejected'
          subscription_plan_id: string | null
          subscription_status: 'none' | 'active' | 'canceled' | 'past_due'
          subscription_ends_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          city_id?: string | null
          owner_id?: string | null
          address?: string | null
          phone?: string | null
          website?: string | null
          description?: string | null
          lounge_type?: 'Lounge' | 'Bar' | 'Retail' | 'Private Club' | null
          amenities?: string[]
          images?: string[]
          is_featured?: boolean
          is_claimed?: boolean
          is_verified?: boolean
          status?: 'pending' | 'approved' | 'rejected'
          subscription_plan_id?: string | null
          subscription_status?: 'none' | 'active' | 'canceled' | 'past_due'
          subscription_ends_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          city_id?: string | null
          owner_id?: string | null
          address?: string | null
          phone?: string | null
          website?: string | null
          description?: string | null
          lounge_type?: 'Lounge' | 'Bar' | 'Retail' | 'Private Club' | null
          amenities?: string[]
          images?: string[]
          is_featured?: boolean
          is_claimed?: boolean
          is_verified?: boolean
          status?: 'pending' | 'approved' | 'rejected'
          subscription_plan_id?: string | null
          subscription_status?: 'none' | 'active' | 'canceled' | 'past_due'
          subscription_ends_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lounges_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lounges_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lounges_subscription_plan_id_fkey"
            columns: ["subscription_plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          }
        ]
      }
      subscription_plans: {
        Row: {
          id: string
          name: string
          slug: string
          price_monthly: number
          price_yearly: number
          features: Json
          is_active: boolean
          stripe_price_id_monthly: string | null
          stripe_price_id_yearly: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          price_monthly: number
          price_yearly: number
          features?: Json
          is_active?: boolean
          stripe_price_id_monthly?: string | null
          stripe_price_id_yearly?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          price_monthly?: number
          price_yearly?: number
          features?: Json
          is_active?: boolean
          stripe_price_id_monthly?: string | null
          stripe_price_id_yearly?: string | null
          created_at?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          id: string
          lounge_id: string | null
          plan_id: string | null
          stripe_subscription_id: string | null
          stripe_customer_id: string | null
          status: string
          current_period_start: string | null
          current_period_end: string | null
          created_at: string
        }
        Insert: {
          id?: string
          lounge_id?: string | null
          plan_id?: string | null
          stripe_subscription_id?: string | null
          stripe_customer_id?: string | null
          status: string
          current_period_start?: string | null
          current_period_end?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          lounge_id?: string | null
          plan_id?: string | null
          stripe_subscription_id?: string | null
          stripe_customer_id?: string | null
          status?: string
          current_period_start?: string | null
          current_period_end?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_lounge_id_fkey"
            columns: ["lounge_id"]
            isOneToOne: false
            referencedRelation: "lounges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          }
        ]
      }
      payments: {
        Row: {
          id: string
          lounge_id: string | null
          subscription_id: string | null
          stripe_payment_intent_id: string | null
          amount: number
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          lounge_id?: string | null
          subscription_id?: string | null
          stripe_payment_intent_id?: string | null
          amount: number
          status: string
          created_at?: string
        }
        Update: {
          id?: string
          lounge_id?: string | null
          subscription_id?: string | null
          stripe_payment_intent_id?: string | null
          amount?: number
          status?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_lounge_id_fkey"
            columns: ["lounge_id"]
            isOneToOne: false
            referencedRelation: "lounges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          }
        ]
      }
      activity_logs: {
        Row: {
          id: string
          user_id: string | null
          action: string
          entity_type: string | null
          entity_id: string | null
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          action: string
          entity_type?: string | null
          entity_id?: string | null
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          action?: string
          entity_type?: string | null
          entity_id?: string | null
          metadata?: Json
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database['public']

export type Tables<T extends keyof PublicSchema['Tables']> = PublicSchema['Tables'][T]['Row']
export type TablesInsert<T extends keyof PublicSchema['Tables']> = PublicSchema['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof PublicSchema['Tables']> = PublicSchema['Tables'][T]['Update']

export type Profile = Tables<'profiles'>
export type City = Tables<'cities'>
export type Lounge = Tables<'lounges'>
export type SubscriptionPlan = Tables<'subscription_plans'>
export type Subscription = Tables<'subscriptions'>
export type Payment = Tables<'payments'>
export type ActivityLog = Tables<'activity_logs'>
