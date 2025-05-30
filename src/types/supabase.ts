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
      teams: {
        Row: {
          id: string
          name: string
          description: string | null
          created_by: string
          invite_code: string
          rto_policy: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          created_by: string
          invite_code: string
          rto_policy: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          created_by?: string
          invite_code?: string
          rto_policy?: Json
          created_at?: string
          updated_at?: string
        }
      }
      team_members: {
        Row: {
          id: string
          team_id: string
          user_id: string
          role: 'leader' | 'member'
          joined_at: string
        }
        Insert: {
          id?: string
          team_id: string
          user_id: string
          role: 'leader' | 'member'
          joined_at?: string
        }
        Update: {
          id?: string
          team_id?: string
          user_id?: string
          role?: 'leader' | 'member'
          joined_at?: string
        }
      }
      work_schedules: {
        Row: {
          id: string
          user_id: string
          date: string
          work_type: 'office' | 'remote' | 'flexible'
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          work_type: 'office' | 'remote' | 'flexible'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          work_type?: 'office' | 'remote' | 'flexible'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      user_badges: {
        Row: {
          id: string
          user_id: string
          badge_id: string
          awarded_at: string
        }
        Insert: {
          id?: string
          user_id: string
          badge_id: string
          awarded_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          badge_id?: string
          awarded_at?: string
        }
      }
      user_engagement: {
        Row: {
          id: string
          user_id: string
          office_days_count: number
          remote_days_count: number
          office_day_streak: number
          last_office_day: string | null
          compliance_rate: number
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          office_days_count?: number
          remote_days_count?: number
          office_day_streak?: number
          last_office_day?: string | null
          compliance_rate?: number
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          office_days_count?: number
          remote_days_count?: number
          office_day_streak?: number
          last_office_day?: string | null
          compliance_rate?: number
          updated_at?: string
        }
      }
      team_engagement: {
        Row: {
          id: string
          team_id: string
          average_compliance_rate: number
          highest_streak: number
          lowest_streak: number
          most_common_office_day: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          team_id: string
          average_compliance_rate?: number
          highest_streak?: number
          lowest_streak?: number
          most_common_office_day?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          team_id?: string
          average_compliance_rate?: number
          highest_streak?: number
          lowest_streak?: number
          most_common_office_day?: string | null
          updated_at?: string
        }
      }
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      team_schedules: {
        Row: {
          team_id: string
          date: string
          office_count: number
          remote_count: number
          flexible_count: number
          members: Json[]
        }
      }
      team_compliance: {
        Row: {
          team_id: string
          user_id: string
          compliance_rate: number
          total_office_days: number
          required_days: number
        }
      }
    }
    Functions: {
      calculate_user_compliance: {
        Args: { user_id: string, team_id: string, start_date: string, end_date: string }
        Returns: number
      }
    }
  }
}