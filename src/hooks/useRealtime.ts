import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export function useRealtime(sessionId: string | null, onUpdate: () => void) {
  useEffect(() => {
    if (!sessionId) return

    const channel = supabase
      .channel(`session:${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'consent_sessions',
          filter: `id=eq.${sessionId}`,
        },
        () => onUpdate(),
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'consent_confirmations',
          filter: `session_id=eq.${sessionId}`,
        },
        () => onUpdate(),
      )
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [onUpdate, sessionId])
}

export const useSessionRealtime = useRealtime
