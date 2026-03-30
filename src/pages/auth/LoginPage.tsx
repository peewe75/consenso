import { useState } from 'react'
import { Eye, EyeOff, Lock, ShieldCheck } from 'lucide-react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'

const loginSchema = z.object({
  email: z.email('Inserisci un indirizzo email valido'),
  password: z.string().min(6, 'La password deve avere almeno 6 caratteri'),
})

export function LoginPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (user) {
    return <Navigate to="/app" replace />
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const parsed = loginSchema.safeParse({ email, password })
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Controlla i dati inseriti')
      return
    }
    setLoading(true)
    setError(null)
    const { error: authError } = await supabase.auth.signInWithPassword(parsed.data)
    if (authError) {
      setError('Email o password non corretti')
      setLoading(false)
      return
    }
    navigate('/app')
  }

  return (
    <div className="flex min-h-screen flex-col items-center overflow-x-hidden bg-background text-text-primary">
      {/* Ambient glows */}
      <div className="pointer-events-none fixed -left-24 -top-24 h-96 w-96 rounded-full bg-accent/10 blur-[120px]" />
      <div className="pointer-events-none fixed -right-24 top-1/2 h-80 w-80 rounded-full bg-success/5 blur-[100px]" />

      <main className="relative flex w-full max-w-[375px] min-h-screen flex-col gap-10 px-6 pb-12 pt-20">
        {/* Header */}
        <header className="flex flex-col items-center gap-6 text-center">
          <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-surface-2 shadow-accent">
            <div className="absolute inset-0 animate-pulse rounded-full border border-accent/20" />
            <ShieldCheck size={36} className="text-accent" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-text-primary">Bentornato</h1>
            <p className="font-medium text-text-secondary">Accedi al tuo spazio</p>
          </div>
        </header>

        {/* Form */}
        <section className="flex flex-col gap-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="flex flex-col gap-2">
              <label className="pl-4 text-[11px] font-medium uppercase tracking-[0.02em] text-text-muted">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                placeholder="nome@esempio.it"
                className="h-14 w-full rounded-2xl border border-border bg-white px-5 text-base text-text-primary outline-none transition placeholder:text-text-muted focus:border-accent focus:ring-2 focus:ring-accent/10"
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-2">
              <label className="pl-4 text-[11px] font-medium uppercase tracking-[0.02em] text-text-muted">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="h-14 w-full rounded-2xl border border-border bg-white px-5 pr-14 text-base text-text-primary outline-none transition placeholder:text-text-muted focus:border-accent focus:ring-2 focus:ring-accent/10"
                />
                <button
                  type="button"
                  aria-label={showPassword ? 'Nascondi password' : 'Mostra password'}
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted transition hover:text-accent active:scale-95"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {error ? (
              <div className="rounded-2xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="h-14 w-full rounded-full bg-accent text-base font-bold text-white shadow-soft transition active:scale-[0.98] disabled:opacity-50 hover:bg-accent-hover"
            >
              {loading ? 'Accesso...' : 'Accedi'}
            </button>

            <div className="pt-2 text-center">
              <Link to="/register" className="text-sm text-text-secondary transition hover:text-text-primary">
                Non hai ancora un account?{' '}
                <span className="font-semibold text-accent">Registrati</span>
              </Link>
            </div>
          </form>
        </section>

        {/* Privacy glass card */}
        <section className="mt-auto">
          <div className="panel flex items-start gap-4 rounded-[24px] p-6">
            <Lock size={20} className="mt-0.5 shrink-0 text-accent" />
            <div className="flex flex-col gap-1">
              <h3 className="text-[13px] font-bold uppercase tracking-wide text-accent">
                Sicurezza &amp; Privacy
              </h3>
              <p className="text-[13px] font-medium leading-relaxed text-text-secondary">
                Usiamo email e password solo per l&apos;autenticazione. Il profilo visibile agli altri contiene
                soltanto pseudonimo e colore avatar.
              </p>
            </div>
          </div>
        </section>

        {/* Handle bar */}
        <div className="flex justify-center">
          <div className="h-1 w-32 rounded-full bg-border" />
        </div>
      </main>
    </div>
  )
}
