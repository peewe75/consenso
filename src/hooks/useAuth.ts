import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'

async function fetchProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) throw error
  return data
}

export function useAuthInit() {
  const { setUser, setSession, setProfile, setLoading, reset } = useAuthStore()

  useEffect(() => {
    let active = true

    async function bootstrap() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!active) return

        setSession(session)
        setUser(session?.user ?? null)

        if (session?.user) {
          const profile = await fetchProfile(session.user.id)
          if (!active) return
          setProfile(profile)
        } else {
          setProfile(null)
        }
      } catch {
        if (active) reset()
      } finally {
        if (active) setLoading(false)
      }
    }

    void bootstrap()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)

      if (!session?.user) {
        setProfile(null)
        setLoading(false)
        return
      }

      try {
        const profile = await fetchProfile(session.user.id)
        if (active) setProfile(profile)
      } finally {
        if (active) setLoading(false)
      }
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [reset, setLoading, setProfile, setSession, setUser])
}

export function useAuth() {
  const auth = useAuthStore()

  async function signOut() {
    await supabase.auth.signOut()
    auth.reset()
  }

  return {
    ...auth,
    isAuthenticated: Boolean(auth.user),
    signOut,
  }
}
