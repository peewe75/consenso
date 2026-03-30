import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'

export function AuthGuard() {
  const { user, loading } = useAuthStore()

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

  return <Outlet />
}
