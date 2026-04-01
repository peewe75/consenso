import { useCallback, useEffect, useState } from 'react'
import { buildActionHash } from '@/lib/crypto'
import { withRetry } from '@/lib/retry'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'
import { useSessionStore } from '@/stores/sessionStore'
import type { ParticipantWithProfile, SessionWithParticipants } from '@/types/session'

export function useSession(sessionId: string | null) {
  const { user } = useAuthStore()
  const { currentSession, setCurrentSession } = useSessionStore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadSession = useCallback(async () => {
    if (!sessionId || !user) return

    setLoading(true)
    setError(null)
    setCurrentSession(null)

    try {
      const [{ data: session, error: sessionError }, { data: participants, error: participantsError }, { data: myStatuses, error: statusError }, { data: metrics, error: metricsError }, { data: profileRows, error: profileError }] = await Promise.all([
        supabase.from('consent_sessions').select('*').eq('id', sessionId).single(),
        supabase.from('consent_participants').select('*').eq('session_id', sessionId).order('joined_at', { ascending: true }),
        supabase.from('v_current_consent_status').select('*').eq('session_id', sessionId),
        supabase.rpc('get_session_metrics', { p_session_id: sessionId }),
        supabase.rpc('get_session_profiles', { p_session_id: sessionId }),
      ])

      if (sessionError) throw sessionError
      if (participantsError) throw participantsError
      if (statusError) throw statusError
      if (metricsError) throw metricsError
      if (profileError) throw profileError

      const profileMap = new Map((profileRows ?? []).map((row) => [row.user_id, row]))
      const statusMap = new Map((myStatuses ?? []).map((row) => [row.user_id, row]))
      const sessionMetrics = metrics?.[0] ?? { confirmed_count: 0, any_revoked: false }

      const mappedParticipants: ParticipantWithProfile[] = (participants ?? []).map((participant) => {
        const profile = profileMap.get(participant.user_id)
        const myStatus = statusMap.get(participant.user_id)

        return {
          ...participant,
          profile: {
            id: participant.user_id,
            display_name: profile?.display_name ?? 'Partecipante',
            avatar_color: profile?.avatar_color ?? '#6366F1',
            avatar_url: profile?.avatar_url ?? null,
          },
          currentStatus: participant.user_id === user.id ? myStatus?.current_status ?? null : null,
          lastActionAt: participant.user_id === user.id ? myStatus?.last_action_at ?? null : null,
        }
      })

      const nextSession: SessionWithParticipants = {
        ...session,
        participants: mappedParticipants,
        myStatus: statusMap.get(user.id)?.current_status ?? null,
        confirmedCount: sessionMetrics.confirmed_count,
        allConfirmed: sessionMetrics.confirmed_count >= session.participant_count,
        anyRevoked: sessionMetrics.any_revoked,
      }

      setCurrentSession(nextSession)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Impossibile caricare la sessione')
    } finally {
      setLoading(false)
    }
  }, [sessionId, setCurrentSession, user])

  useEffect(() => {
    void loadSession()
  }, [loadSession])

  const confirmConsent = useCallback(async () => {
    if (!sessionId || !user) return

    const timestamp = new Date().toISOString()
    const hash = await buildActionHash(sessionId, user.id, 'confirmed', timestamp)

    await withRetry(
      async () => {
        const { error: rpcError } = await supabase.rpc('record_consent_action', {
          p_session_id: sessionId,
          p_action: 'confirmed',
          p_action_hash: hash,
        })
        if (rpcError) throw rpcError
      },
      { retries: 2, delayMs: 500 },
    )

    await loadSession()
  }, [loadSession, sessionId, user])

  const revokeConsent = useCallback(async () => {
    if (!sessionId || !user) return

    const timestamp = new Date().toISOString()
    const hash = await buildActionHash(sessionId, user.id, 'revoked', timestamp)

    await withRetry(
      async () => {
        const { error: rpcError } = await supabase.rpc('record_consent_action', {
          p_session_id: sessionId,
          p_action: 'revoked',
          p_action_hash: hash,
        })
        if (rpcError) throw rpcError
      },
      { retries: 2, delayMs: 500 },
    )

    await loadSession()
  }, [loadSession, sessionId, user])

  return {
    session: currentSession,
    loading,
    error,
    confirmConsent,
    revokeConsent,
    reload: loadSession,
  }
}
