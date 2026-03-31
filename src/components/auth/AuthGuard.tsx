import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'

export function AuthGuard() {
  const location = useLocation()
  const { user, profile, loading } = useAuthStore()

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0F0F14]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#6366F1] border-t-transparent" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (!profile && location.pathname !== '/onboarding/profile') {
    return <Navigate to="/onboarding/profile" replace />
  }

  if (profile && location.pathname === '/onboarding/profile') {
    return <Navigate to="/app" replace />
  }

  return <Outlet />
}
