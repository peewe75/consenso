import { create } from 'zustand'
import type { Profile } from '@/types/session'

export interface AuthUser {
  id: string
  email: string | null
  firstName: string | null
  lastName: string | null
}

interface AuthState {
  user: AuthUser | null
  profile: Profile | null
  loading: boolean
  setUser: (user: AuthUser | null) => void
  setProfile: (profile: Profile | null) => void
  setLoading: (loading: boolean) => void
  reset: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  loading: true,
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setLoading: (loading) => set({ loading }),
  reset: () => set({ user: null, profile: null, loading: false }),
}))
