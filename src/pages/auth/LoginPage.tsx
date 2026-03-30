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
    <div className="flex min-h-screen flex-col items-center overflow-x-hidden bg-[#131318] text-[#E4E1E9]">
      {/* Ambient glows */}
      <div className="pointer-events-none fixed -left-24 -top-24 h-96 w-96 rounded-full bg-[#C0C1FF]/8 blur-[120px]" />
      <div className="pointer-events-none fixed -right-24 top-1/2 h-80 w-80 rounded-full bg-[#4EDEA3]/5 blur-[100px]" />

      <main className="relative flex w-full max-w-[375px] min-h-screen flex-col gap-10 px-6 pb-12 pt-20">
        {/* Header */}
        <header className="flex flex-col items-center gap-6 text-center">
          <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-[#2A292F] shadow-[0_0_40px_rgba(192,193,255,0.1)]">
            <div className="absolute inset-0 animate-pulse rounded-full border border-[#C0C1FF]/20" />
            <ShieldCheck size={36} className="text-[#C0C1FF]" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-[#E4E1E9]">Bentornato</h1>
            <p className="font-medium text-[#C7C4D7]">Accedi al tuo spazio</p>
          </div>
        </header>

        {/* Form */}
        <section className="flex flex-col gap-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="flex flex-col gap-2">
              <label className="pl-4 text-[11px] font-medium uppercase tracking-[0.02em] text-[#908FA0]">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                placeholder="nome@esempio.it"
                className="h-14 w-full rounded-2xl border-none bg-white/5 px-5 text-base text-[#E4E1E9] outline-none transition placeholder:text-[#464554]/60 focus:ring-2 focus:ring-[#C0C1FF]/40"
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-2">
              <label className="pl-4 text-[11px] font-medium uppercase tracking-[0.02em] text-[#908FA0]">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="h-14 w-full rounded-2xl border-none bg-white/5 px-5 pr-14 text-base text-[#E4E1E9] outline-none transition placeholder:text-[#464554]/60 focus:ring-2 focus:ring-[#C0C1FF]/40"
                />
                <button
                  type="button"
                  aria-label={showPassword ? 'Nascondi password' : 'Mostra password'}
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#464554] transition hover:text-[#C0C1FF] active:scale-95"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {error ? (
              <div className="rounded-2xl border border-[#93000A]/30 bg-[#93000A]/20 px-4 py-3 text-sm text-[#FFB4AB]">
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="h-14 w-full rounded-full bg-gradient-to-b from-[#C0C1FF] to-[#8083FF] text-base font-bold text-[#1000A9] shadow-[0_8px_30px_rgba(128,131,255,0.3)] transition active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? 'Accesso...' : 'Accedi'}
            </button>

            <div className="pt-2 text-center">
              <Link to="/register" className="text-sm text-[#C7C4D7] transition hover:text-[#C0C1FF]">
                Non hai ancora un account?{' '}
                <span className="font-semibold text-[#C0C1FF]">Registrati</span>
              </Link>
            </div>
          </form>
        </section>

        {/* Privacy glass card */}
        <section className="mt-auto">
          <div
            className="flex items-start gap-4 rounded-[24px] border border-[#464554]/20 p-6"
            style={{
              background: 'linear-gradient(180deg, rgba(34,34,58,0.4) 0%, rgba(26,26,36,0.4) 100%)',
              backdropFilter: 'blur(12px)',
            }}
          >
            <Lock size={20} className="mt-0.5 shrink-0 text-[#C0C1FF]" />
            <div className="flex flex-col gap-1">
              <h3 className="text-[13px] font-bold uppercase tracking-wide text-[#C0C1FF]">
                Sicurezza &amp; Privacy
              </h3>
              <p className="text-[13px] font-medium leading-relaxed text-[#C7C4D7]">
                Usiamo email e password solo per l&apos;autenticazione. Il profilo visibile agli altri contiene
                soltanto pseudonimo e colore avatar.
              </p>
            </div>
          </div>
        </section>

        {/* Handle bar */}
        <div className="flex justify-center">
          <div className="h-1 w-32 rounded-full bg-[#35343A]" />
        </div>
      </main>
    </div>
  )
}
