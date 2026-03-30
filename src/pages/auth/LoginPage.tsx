import { useState } from 'react'
import { Eye, EyeOff, ShieldCheck } from 'lucide-react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'
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
    <main className="safe-page-tight flex min-h-screen flex-col justify-between gap-8">
      <section className="space-y-8">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/18">
            <ShieldCheck size={22} className="text-accent" />
          </div>
          <div>
            <p className="text-sm text-text-secondary">Bentornato</p>
            <h1 className="text-2xl font-bold">Accedi al tuo spazio</h1>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Email">
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              placeholder="nome@esempio.it"
              className={fieldInputClass}
            />
          </Field>

          <Field label="Password">
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                placeholder="Minimo 6 caratteri"
                className={cn(fieldInputClass, 'pr-12')}
              />
              <button
                type="button"
                aria-label={showPassword ? 'Nascondi password' : 'Mostra password'}
                onClick={() => setShowPassword((value) => !value)}
                className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full text-text-muted transition active:scale-[0.98]"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </Field>

          {error ? (
            <div className="rounded-2xl border border-danger/20 bg-danger/10 px-4 py-3 text-sm text-danger">{error}</div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="flex min-h-14 w-full items-center justify-center rounded-full bg-accent text-base font-semibold text-white transition active:scale-[0.98] active:opacity-90 disabled:opacity-50"
          >
            {loading ? 'Accesso...' : 'Accedi'}
          </button>
        </form>
      </section>

      <section className="space-y-4 pb-4">
        <div className="panel rounded-2xl px-4 py-4 text-sm leading-6 text-text-secondary">
          Usiamo email e password solo per l&apos;autenticazione. Il profilo visibile agli altri contiene soltanto pseudonimo e colore avatar.
        </div>
        <p className="text-center text-sm text-text-secondary">
          Non hai ancora un account?{' '}
          <Link to="/register" className="font-semibold text-text-primary">
            Registrati
          </Link>
        </p>
      </section>
    </main>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-text-secondary">{label}</span>
      {children}
    </label>
  )
}

const fieldInputClass =
  'min-h-14 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-base text-text-primary outline-none transition placeholder:text-text-muted focus:border-accent focus:bg-white/[0.07]'
