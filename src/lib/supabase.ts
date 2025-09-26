import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/auth` : undefined,
    persistSession: true,
    detectSessionInUrl: true
  }
})

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
      hackathons: {
        Row: {
          id: string
          name: string
          description: string | null
          start_at: string
          end_at: string
          status: string
          max_team_size: number
          created_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          start_at: string
          end_at: string
          status?: string
          max_team_size?: number
          created_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          start_at?: string
          end_at?: string
          status?: string
          max_team_size?: number
          created_at?: string
          created_by?: string | null
        }
      }
      hackathon_participants: {
        Row: {
          id: string
          hackathon_id: string
          user_id: string
          display_name: string
          role: string
          join_code: string | null
          created_at: string
        }
        Insert: {
          id?: string
          hackathon_id: string
          user_id: string
          display_name: string
          role?: string
          join_code?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          hackathon_id?: string
          user_id?: string
          display_name?: string
          role?: string
          join_code?: string | null
          created_at?: string
        }
      }
      teams: {
        Row: {
          id: string
          hackathon_id: string
          name: string
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          hackathon_id: string
          name: string
          created_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          hackathon_id?: string
          name?: string
          created_by?: string | null
          created_at?: string
        }
      }
      team_members: {
        Row: {
          id: string
          team_id: string
          user_id: string
          joined_at: string
        }
        Insert: {
          id?: string
          team_id: string
          user_id: string
          joined_at?: string
        }
        Update: {
          id?: string
          team_id?: string
          user_id?: string
          joined_at?: string
        }
      }
      submissions: {
        Row: {
          id: string
          hackathon_id: string
          team_id: string
          title: string
          description: string | null
          repo_url: string | null
          demo_url: string | null
          submitted_by: string | null
          submitted_at: string
        }
        Insert: {
          id?: string
          hackathon_id: string
          team_id: string
          title: string
          description?: string | null
          repo_url?: string | null
          demo_url?: string | null
          submitted_by?: string | null
          submitted_at?: string
        }
        Update: {
          id?: string
          hackathon_id?: string
          team_id?: string
          title?: string
          description?: string | null
          repo_url?: string | null
          demo_url?: string | null
          submitted_by?: string | null
          submitted_at?: string
        }
      }
      judges: {
        Row: {
          id: string
          hackathon_id: string
          user_id: string | null
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          hackathon_id: string
          user_id?: string | null
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          hackathon_id?: string
          user_id?: string | null
          name?: string
          created_at?: string
        }
      }
      scores: {
        Row: {
          id: string
          submission_id: string
          judge_id: string
          criteria: string
          score: number
          created_at: string
        }
        Insert: {
          id?: string
          submission_id: string
          judge_id: string
          criteria: string
          score: number
          created_at?: string
        }
        Update: {
          id?: string
          submission_id?: string
          judge_id?: string
          criteria?: string
          score?: number
          created_at?: string
        }
      }
      reviews: {
        Row: {
          id: string
          submission_id: string
          judge_id: string
          rating: number
          comments: string | null
          created_at: string
        }
        Insert: {
          id?: string
          submission_id: string
          judge_id: string
          rating: number
          comments?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          submission_id?: string
          judge_id?: string
          rating?: number
          comments?: string | null
          created_at?: string
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
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}