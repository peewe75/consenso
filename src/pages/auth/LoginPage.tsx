import { SignIn } from '@clerk/clerk-react'
import { Navigate } from 'react-router-dom'
import { clerkAppearance } from '@/lib/clerk'
import { useAuth } from '@/hooks/useAuth'

export function LoginPage() {
  const { user, profile } = useAuth()

  if (user) {
    return <Navigate to={profile ? '/app' : '/onboarding/profile'} replace />
  }

  return (
    <main className="safe-page-tight flex min-h-screen items-center justify-center">
      <div className="w-full max-w-[29rem]">
        <SignIn
          routing="path"
          path="/login"
          signUpUrl="/register"
          fallbackRedirectUrl="/app"
          appearance={clerkAppearance}
        />
      </div>
    </main>
  )
}
