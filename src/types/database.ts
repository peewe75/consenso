export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          display_name: string
          avatar_color: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          display_name: string
          avatar_color?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          display_name?: string
          avatar_color?: string
          updated_at?: string
        }
        Relationships: []
      }
      pairing_codes: {
        Row: {
          id: string
          creator_id: string
          code: string
          expires_at: string
          used_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          creator_id: string
          code: string
          expires_at?: string
          used_at?: string | null
          created_at?: string
        }
        Update: {
          used_at?: string | null
        }
        Relationships: []
      }
      consent_sessions: {
        Row: {
          id: string
          status: 'pending' | 'active' | 'confirmed' | 'revoked' | 'expired'
          initiated_at: string
          confirmed_at: string | null
          revoked_at: string | null
          expires_at: string
          revoked_by: string | null
          integrity_hash: string
          participant_count: number
          created_at: string
        }
        Insert: {
          id?: string
          status?: 'pending' | 'active' | 'confirmed' | 'revoked' | 'expired'
          initiated_at?: string
          confirmed_at?: string | null
          revoked_at?: string | null
          expires_at?: string
          revoked_by?: string | null
          integrity_hash?: string
          participant_count?: number
          created_at?: string
        }
        Update: {
          status?: 'pending' | 'active' | 'confirmed' | 'revoked' | 'expired'
          confirmed_at?: string | null
          revoked_at?: string | null
          expires_at?: string
          revoked_by?: string | null
          integrity_hash?: string
          participant_count?: number
        }
        Relationships: []
      }
      consent_participants: {
        Row: {
          id: string
          session_id: string
          user_id: string
          joined_at: string
          role: 'initiator' | 'participant'
        }
        Insert: {
          id?: string
          session_id: string
          user_id: string
          joined_at?: string
          role?: 'initiator' | 'participant'
        }
        Update: {
          role?: 'initiator' | 'participant'
        }
        Relationships: []
      }
      consent_confirmations: {
        Row: {
          id: string
          session_id: string
          user_id: string
          action: 'confirmed' | 'revoked'
          actioned_at: string
          action_hash: string
        }
        Insert: {
          id?: string
          session_id: string
          user_id: string
          action: 'confirmed' | 'revoked'
          actioned_at?: string
          action_hash?: string
        }
        Update: {
          action_hash?: string
        }
        Relationships: []
      }
    }
    Views: {
      v_current_consent_status: {
        Row: {
          session_id: string
          user_id: string
          current_status: 'confirmed' | 'revoked'
          last_action_at: string
        }
        Relationships: []
      }
    }
    Functions: {
      create_consent_session: {
        Args: { p_participant_ids: string[]; p_integrity_hash?: string }
        Returns: string
      }
      record_consent_action: {
        Args: { p_session_id: string; p_action: string; p_action_hash?: string }
        Returns: undefined
      }
      expire_stale_sessions: {
        Args: Record<string, never>
        Returns: number
      }
      generate_pairing_code: {
        Args: Record<string, never>
        Returns: string
      }
      get_session_metrics: {
        Args: { p_session_id: string }
        Returns: {
          confirmed_count: number
          any_revoked: boolean
        }[]
      }
      get_session_profiles: {
        Args: { p_session_id: string }
        Returns: {
          user_id: string
          display_name: string
          avatar_color: string
        }[]
      }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
