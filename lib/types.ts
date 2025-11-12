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
          name: string
          email: string
          global_role: 'member' | 'admin' | 'super'
          created_at: string
        }
        Insert: {
          id: string
          name: string
          email: string
          global_role?: 'member' | 'admin' | 'super'
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          global_role?: 'member' | 'admin' | 'super'
          created_at?: string
        }
      }
      states: {
        Row: {
          id: number
          name: string
        }
        Insert: {
          id?: number
          name: string
        }
        Update: {
          id?: number
          name?: string
        }
      }
      districts: {
        Row: {
          id: number
          state_id: number
          name: string
        }
        Insert: {
          id?: number
          state_id: number
          name: string
        }
        Update: {
          id?: number
          state_id?: number
          name?: string
        }
      }
      institutions: {
        Row: {
          id: number
          district_id: number
          name: string
          status: 'approved' | 'pending'
        }
        Insert: {
          id?: number
          district_id: number
          name: string
          status?: 'approved' | 'pending'
        }
        Update: {
          id?: number
          district_id?: number
          name?: string
          status?: 'approved' | 'pending'
        }
      }
      clubs: {
        Row: {
          id: number
          name: string
          slug: string
          state_id: number
          district_id: number
          institution_id: number
          created_by_user: string
          status: 'pending' | 'approved' | 'rejected'
          created_at: string
        }
        Insert: {
          id?: number
          name: string
          slug: string
          state_id: number
          district_id: number
          institution_id: number
          created_by_user: string
          status?: 'pending' | 'approved' | 'rejected'
          created_at?: string
        }
        Update: {
          id?: number
          name?: string
          slug?: string
          state_id?: number
          district_id?: number
          institution_id?: number
          created_by_user?: string
          status?: 'pending' | 'approved' | 'rejected'
          created_at?: string
        }
      }
      club_admins: {
        Row: {
          club_id: number
          user_id: string
          active: boolean
        }
        Insert: {
          club_id: number
          user_id: string
          active?: boolean
        }
        Update: {
          club_id?: number
          user_id?: string
          active?: boolean
        }
      }
      club_members: {
        Row: {
          id: number
          club_id: number
          user_id: string
          status: 'pending' | 'approved' | 'rejected'
          is_organizer: boolean
          joined_at: string
        }
        Insert: {
          id?: number
          club_id: number
          user_id: string
          status?: 'pending' | 'approved' | 'rejected'
          is_organizer?: boolean
          joined_at?: string
        }
        Update: {
          id?: number
          club_id?: number
          user_id?: string
          status?: 'pending' | 'approved' | 'rejected'
          is_organizer?: boolean
          joined_at?: string
        }
      }
      levels: {
        Row: {
          id: number
          club_id: number
          number: number
          title: string
          description: string
        }
        Insert: {
          id?: number
          club_id: number
          number: number
          title: string
          description: string
        }
        Update: {
          id?: number
          club_id?: number
          number?: number
          title?: string
          description?: string
        }
      }
      meetings: {
        Row: {
          id: number
          club_id: number
          level_id: number
          title: string
          scheduled_at: string
          venue: string
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: number
          club_id: number
          level_id: number
          title: string
          scheduled_at: string
          venue: string
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          club_id?: number
          level_id?: number
          title?: string
          scheduled_at?: string
          venue?: string
          notes?: string | null
          created_at?: string
        }
      }
      tasks: {
        Row: {
          id: number
          meeting_id: number
          level_id: number
          title: string
          description: string
          evaluator_user_id: string | null
        }
        Insert: {
          id?: number
          meeting_id: number
          level_id: number
          title: string
          description: string
          evaluator_user_id?: string | null
        }
        Update: {
          id?: number
          meeting_id?: number
          level_id?: number
          title?: string
          description?: string
          evaluator_user_id?: string | null
        }
      }
      roles: {
        Row: {
          id: number
          club_id: number
          name: string
          description: string
        }
        Insert: {
          id?: number
          club_id: number
          name: string
          description: string
        }
        Update: {
          id?: number
          club_id?: number
          name?: string
          description?: string
        }
      }
      role_requests: {
        Row: {
          id: number
          meeting_id: number
          user_id: string
          role_id: number
          status: 'pending' | 'approved' | 'rejected'
          decided_by: string | null
          decided_at: string | null
          created_at: string
        }
        Insert: {
          id?: number
          meeting_id: number
          user_id: string
          role_id: number
          status?: 'pending' | 'approved' | 'rejected'
          decided_by?: string | null
          decided_at?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          meeting_id?: number
          user_id?: string
          role_id?: number
          status?: 'pending' | 'approved' | 'rejected'
          decided_by?: string | null
          decided_at?: string | null
          created_at?: string
        }
      }
      achievement_requests: {
        Row: {
          id: number
          user_id: string
          level_id: number
          meeting_id: number
          status: 'pending' | 'approved' | 'rejected'
          decided_by: string | null
          decided_at: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: number
          user_id: string
          level_id: number
          meeting_id: number
          status?: 'pending' | 'approved' | 'rejected'
          decided_by?: string | null
          decided_at?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          level_id?: number
          meeting_id?: number
          status?: 'pending' | 'approved' | 'rejected'
          decided_by?: string | null
          decided_at?: string | null
          notes?: string | null
          created_at?: string
        }
      }
      certificates: {
        Row: {
          id: number
          user_id: string
          level_id: number
          club_id: number
          file_url: string
          issued_by: string
          issued_at: string
          sha256_hash: string
        }
        Insert: {
          id?: number
          user_id: string
          level_id: number
          club_id: number
          file_url: string
          issued_by: string
          issued_at?: string
          sha256_hash: string
        }
        Update: {
          id?: number
          user_id?: string
          level_id?: number
          club_id?: number
          file_url?: string
          issued_by?: string
          issued_at?: string
          sha256_hash?: string
        }
      }
      club_requests: {
        Row: {
          id: number
          requested_by_user: string
          club_name: string
          state_id: number
          district_id: number
          institution_text: string
          status: 'pending' | 'approved' | 'rejected'
          decided_by: string | null
          decided_at: string | null
          created_at: string
        }
        Insert: {
          id?: number
          requested_by_user: string
          club_name: string
          state_id: number
          district_id: number
          institution_text: string
          status?: 'pending' | 'approved' | 'rejected'
          decided_by?: string | null
          decided_at?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          requested_by_user?: string
          club_name?: string
          state_id?: number
          district_id?: number
          institution_text?: string
          status?: 'pending' | 'approved' | 'rejected'
          decided_by?: string | null
          decided_at?: string | null
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: number
          user_id: string
          type: string
          message: string
          payload_json: Json | null
          channel: 'in_app' | 'email'
          sent_at: string | null
          read_at: string | null
          created_at: string
        }
        Insert: {
          id?: number
          user_id: string
          type: string
          message: string
          payload_json?: Json | null
          channel?: 'in_app' | 'email'
          sent_at?: string | null
          read_at?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          type?: string
          message?: string
          payload_json?: Json | null
          channel?: 'in_app' | 'email'
          sent_at?: string | null
          read_at?: string | null
          created_at?: string
        }
      }
      audit_log: {
        Row: {
          id: number
          actor_user: string
          action: string
          target_table: string
          target_id: string
          payload_json: Json | null
          created_at: string
        }
        Insert: {
          id?: number
          actor_user: string
          action: string
          target_table: string
          target_id: string
          payload_json?: Json | null
          created_at?: string
        }
        Update: {
          id?: number
          actor_user?: string
          action?: string
          target_table?: string
          target_id?: string
          payload_json?: Json | null
          created_at?: string
        }
      }
    }
    Views: {
      v_leaderboard: {
        Row: {
          club_id: number
          user_id: string
          approved_achievements_count: number
        }
      }
      v_club_activity: {
        Row: {
          club_id: number
          meetings_count: number
          members_count: number
          pending_approvals: number
        }
      }
    }
  }
}