import type { Database } from './database'
import type { ConsentAction } from '@/lib/utils'

export type ConsentSession = Database['public']['Tables']['consent_sessions']['Row']
export type ConsentParticipant = Database['public']['Tables']['consent_participants']['Row']
export type Profile = Database['public']['Tables']['profiles']['Row']
export type ConsentStatusView = Database['public']['Views']['v_current_consent_status']['Row']

export interface PairingPayload {
  c: string
  u: string
  n: string
  a: string
  i?: string | null
}

export interface PairingPartnerProfile {
  id: string
  display_name: string
  avatar_color: string
  avatar_url: string | null
}

export interface ParticipantWithProfile extends ConsentParticipant {
  profile: PairingPartnerProfile
  currentStatus: ConsentAction | null
  lastActionAt: string | null
}

export interface SessionMetrics {
  confirmed_count: number
  any_revoked: boolean
}

export interface SessionWithParticipants extends ConsentSession {
  participants: ParticipantWithProfile[]
  myStatus: ConsentAction | null
  confirmedCount: number
  allConfirmed: boolean
  anyRevoked: boolean
}
