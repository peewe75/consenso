import { useEffect } from 'react'
import { useAuth as useClerkAuth, useClerk, useUser } from '@clerk/clerk-react'
import { setSupabaseAccessTokenGetter, supabase } from '@/lib/supabase'
import { useAuthStore, type AuthUser } from '@/stores/authStore'
import { useSessionStore } from '@/stores/sessionStore'

async function fetchProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle()

  if (error) throw error
  return data
}

function mapClerkUser(user: ReturnType<typeof useUser>['user']): AuthUser | null {
  if (!user) return null

  return {
    id: user.id,
    email: user.primaryEmailAddress?.emailAddress ?? null,
    firstName: user.firstName ?? null,
    lastName: user.lastName ?? null,
  }
}

export function useAuthInit() {
  const { isLoaded, userId, getToken } = useClerkAuth()
  const { user } = useUser()
  const { reset: resetSessionStore } = useSessionStore()
  const { setUser, setProfile, setLoading, reset } = useAuthStore()

  useEffect(() => {
    setSupabaseAccessTokenGetter(async () => (await getToken()) ?? null)

    return () => {
      setSupabaseAccessTokenGetter(null)
    }
  }, [getToken])

  useEffect(() => {
    let active = true

    async function bootstrap() {
      if (!isLoaded) {
        setLoading(true)
        return
      }

      if (!userId || !user) {
        if (active) {
          reset()
          resetSessionStore()
        }
        return
      }

      setLoading(true)
      setUser(mapClerkUser(user))

      try {
        const profile = await fetchProfile(userId)
        if (!active) return
        setProfile(profile ?? null)
      } catch {
        if (active) setProfile(null)
      } finally {
        if (active) setLoading(false)
      }
    }

    void bootstrap()

    return () => {
      active = false
    }
  }, [isLoaded, reset, resetSessionStore, setLoading, setProfile, setUser, user, userId])
}

export function useAuth() {
  const auth = useAuthStore()
  const { signOut: clerkSignOut } = useClerk()
  const { reset: resetSessionStore } = useSessionStore()

  async function signOut() {
    await clerkSignOut()
    setSupabaseAccessTokenGetter(null)
    resetSessionStore()
    auth.reset()
  }

  return {
    ...auth,
    isAuthenticated: Boolean(auth.user),
    signOut,
  }
}
