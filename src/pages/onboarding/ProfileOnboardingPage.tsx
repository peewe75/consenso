import { useState } from 'react'
import { ShieldCheck } from 'lucide-react'
import { Navigate } from 'react-router-dom'
import { z } from 'zod'
import { supabase } from '@/lib/supabase'
import { cn, generateAvatarColor, initialsFromName } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'

const profileSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(2, 'Lo pseudonimo deve avere almeno 2 caratteri')
    .max(30, 'Lo pseudonimo puo avere massimo 30 caratteri'),
  avatarColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
})

const AVATAR_COLORS = ['#6366F1', '#8B5CF6', '#EC4899', '#10B981', '#F59E0B', '#3B82F6', '#EF4444', '#14B8A6']

export function ProfileOnboardingPage() {
  const { user, profile, isAuthenticated } = useAuth()
  const [displayName, setDisplayName] = useState(user?.firstName ?? '')
  const [avatarColor, setAvatarColor] = useState<string>(generateAvatarColor(user?.email ?? user?.id ?? 'consenso'))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (profile) {
    return <Navigate to="/app" replace />
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const parsed = profileSchema.safeParse({ displayName, avatarColor })
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Controlla i dati del profilo')
      return
    }

    setLoading(true)
    setError(null)

    const { error: upsertError } = await supabase.rpc('upsert_my_profile', {
      p_display_name: parsed.data.displayName,
      p_avatar_color: parsed.data.avatarColor,
    })

    if (upsertError) {
      setError(upsertError.message)
      setLoading(false)
      return
    }

    window.location.assign('/app')
  }

  return (
    <main className="safe-page-tight flex min-h-screen flex-col justify-between gap-8">
      <section className="space-y-8">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10">
            <ShieldCheck size={22} className="text-accent" />
          </div>
          <div>
            <p className="text-sm text-text-secondary">Onboarding</p>
            <h1 className="text-2xl font-bold text-text-primary">Completa il tuo profilo</h1>
          </div>
        </div>

        <div className="panel rounded-[28px] px-5 py-6">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-[28px] text-4xl font-bold text-white shadow-sm" style={{ backgroundColor: avatarColor }}>
              {initialsFromName(displayName)}
            </div>
            <div>
              <p className="text-lg font-semibold text-text-primary">{displayName.trim() || 'Il tuo pseudonimo'}</p>
              <p className="mt-1 text-sm text-text-secondary">Visibile agli altri partecipanti nella sessione</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <label className="block space-y-2">
            <span className="text-sm font-medium text-text-secondary">Pseudonimo</span>
            <input
              type="text"
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              minLength={2}
              maxLength={30}
              placeholder="Es. Stella, Marco, Vale"
              className={fieldInputClass}
            />
          </label>

          <div className="space-y-3">
            <span className="text-sm font-medium text-text-secondary">Colore avatar</span>
            <div className="grid grid-cols-4 gap-3">
              {AVATAR_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setAvatarColor(color)}
                  className={cn(
                    'flex min-h-12 items-center justify-center rounded-2xl border border-border shadow-sm transition active:scale-[0.98]',
                    avatarColor === color && 'ring-2 ring-accent ring-offset-2 ring-offset-background',
                  )}
                  style={{ backgroundColor: color }}
                  aria-label={`Seleziona il colore ${color}`}
                />
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-warning/20 bg-warning/10 px-4 py-4 text-sm leading-6 text-text-secondary">
            Usa un nome che ti faccia sentire a tuo agio. Evita dati personali reali se preferisci restare piu discreto.
          </div>

          {error ? <div className="rounded-2xl border border-danger/20 bg-danger/10 px-4 py-3 text-sm text-danger">{error}</div> : null}

          <button
            type="submit"
            disabled={loading}
            className="flex min-h-14 w-full items-center justify-center rounded-full bg-accent text-base font-semibold text-white transition active:scale-[0.98] active:opacity-90 disabled:opacity-50"
          >
            {loading ? 'Salvataggio profilo...' : 'Continua nell’app'}
          </button>
        </form>
      </section>
    </main>
  )
}

const fieldInputClass =
  'min-h-14 w-full rounded-2xl border border-border bg-white px-4 text-base text-text-primary outline-none transition placeholder:text-text-muted focus:border-accent focus:ring-2 focus:ring-accent/10'
