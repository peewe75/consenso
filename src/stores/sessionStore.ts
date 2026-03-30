import { create } from 'zustand'
import type { PairingPartnerProfile, SessionWithParticipants } from '@/types/session'

interface SessionState {
  currentSession: SessionWithParticipants | null
  pairedUserId: string | null
  pairedUserProfile: PairingPartnerProfile | null
  setCurrentSession: (session: SessionWithParticipants | null) => void
  updateSessionStatus: (update: Partial<SessionWithParticipants>) => void
  setPairedUser: (id: string | null, profile: PairingPartnerProfile | null) => void
  reset: () => void
}

export const useSessionStore = create<SessionState>((set) => ({
  currentSession: null,
  pairedUserId: null,
  pairedUserProfile: null,
  setCurrentSession: (session) => set({ currentSession: session }),
  updateSessionStatus: (update) =>
    set((state) => ({
      currentSession: state.currentSession
        ? { ...state.currentSession, ...update }
        : null,
    })),
  setPairedUser: (id, profile) => set({ pairedUserId: id, pairedUserProfile: profile }),
  reset: () => set({ currentSession: null, pairedUserId: null, pairedUserProfile: null }),
}))
