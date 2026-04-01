import { useState } from 'react'
import { Sparkles, ShieldCheck } from 'lucide-react'
import { Navigate } from 'react-router-dom'
import { z } from 'zod'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { AvatarPicker } from '@/components/profile/AvatarPicker'
import { generateAvatarColor } from '@/lib/utils'

const profileSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(2, 'Lo pseudonimo deve avere almeno 2 caratteri')
    .max(30, 'Lo pseudonimo puo avere massimo 30 caratteri'),
  avatarColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
})

export function ProfileOnboardingPage() {
  const auth = useAuth()
  // Mock fallback for Preview Gallery
  const user = auth?.user
  const profile = auth?.profile
  const isAuthenticated = auth?.isAuthenticated ?? true // Assume true for demo

  const [displayName, setDisplayName] = useState(user?.firstName ?? '')
  const [avatarColor, setAvatarColor] = useState<string>(generateAvatarColor(user?.email ?? user?.id ?? 'consenso'))
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Only redirect if NOT in preview mode (we can check pathname or just allow it)
  const isPreview = window.location.pathname === '/preview'

  if (!isPreview && !isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (!isPreview && profile) {
    return <Navigate to="/app" replace />
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isPreview) {
      setLoading(true)
      setTimeout(() => setLoading(false), 1000)
      return
    }

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
      p_avatar_url: avatarUrl,
    })

    if (upsertError) {
      setError(upsertError.message)
      setLoading(false)
      return
    }

    window.location.assign('/app')
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-background">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[70%] h-[50%] bg-accent/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-5%] left-[-5%] w-[60%] h-[40%] bg-orange-500/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="safe-page-tight relative z-10 mx-auto flex w-full max-w-md flex-col justify-center px-6 py-12 md:py-20 lg:py-24">
        <section className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <header className="space-y-4 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-orange-400 to-rose-500 shadow-lg shadow-orange-500/20">
              <Sparkles className="text-white" size={32} />
            </div>
            <div className="space-y-2">
              <h1 className="text-4xl font-black tracking-tight text-text-primary sm:text-5xl">
                Ciao! <br />
                <span className="bg-gradient-to-r from-orange-400 to-rose-500 bg-clip-text text-transparent">Chi vuoi essere?</span>
              </h1>
              <p className="text-base font-medium text-text-secondary opacity-80">
                Personalizza il tuo profilo per iniziare.
              </p>
            </div>
          </header>

          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-400/20 to-rose-500/20 blur-2xl rounded-[48px] opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative flex flex-col items-center justify-center rounded-[48px] border border-white/10 bg-surface/40 p-10 backdrop-blur-2xl shadow-2xl">
              <AvatarPicker
                userId={user?.id ?? 'preview-id'}
                displayName={displayName}
                avatarColor={avatarColor}
                avatarUrl={avatarUrl}
                onColorChange={setAvatarColor}
                onAvatarUrlChange={setAvatarUrl}
                size="lg"
              />
              <div className="mt-8 text-center">
                <p className="text-2xl font-black tracking-tight text-text-primary min-h-[32px]">
                  {displayName.trim() || 'Il tuo nome'}
                </p>
                <div className="mt-1 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 border border-accent/20">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-accent">Anteprima Live</span>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-10">
            <div className="space-y-3">
              <label htmlFor="displayName" className="block text-[11px] font-black uppercase tracking-[0.2em] text-text-muted px-1">
                Pseudonimo Unico
              </label>
              <div className="relative group">
                <input
                  id="displayName"
                  type="text"
                  value={displayName}
                  onChange={(event) => setDisplayName(event.target.value)}
                  minLength={2}
                  maxLength={30}
                  placeholder="Esempio: Cosmo, Stella..."
                  className="input-premium block w-full bg-surface/50 border border-border h-20 rounded-3xl px-8 text-xl font-bold text-text-primary transition-all focus:border-accent/50 focus:ring-4 focus:ring-accent/10 outline-none"
                  required
                />
                <div className="absolute right-6 top-1/2 -translate-y-1/2 text-text-muted opacity-40">
                  <Sparkles size={20} />
                </div>
              </div>
              <p className="px-2 text-xs font-medium leading-relaxed text-text-muted/70 italic">
                Scegli un nome che ti faccia sentire a tuo agio.
              </p>
            </div>

            {error ? (
              <div className="animate-shake rounded-2xl border border-danger/20 bg-danger/10 px-5 py-4 text-sm font-bold text-danger flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-danger" />
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="group relative h-20 w-full overflow-hidden rounded-[32px] bg-text-primary px-8 text-xl font-black text-background transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-rose-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <span className="relative z-10 flex items-center justify-center gap-3">
                {loading ? (
                  <div className="h-6 w-6 animate-spin rounded-full border-4 border-background/20 border-t-background" />
                ) : (
                  <>
                    Inizia l'Esperienza
                    <Sparkles size={24} />
                  </>
                )}
              </span>
            </button>
          </form>
        </section>

        <footer className="mt-20 text-center space-y-4">
          <div className="flex items-center justify-center gap-4 opacity-30">
            <div className="h-px w-8 bg-text-muted" />
            <ShieldCheck size={16} className="text-text-muted" />
            <div className="h-px w-8 bg-text-muted" />
          </div>
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-text-muted leading-relaxed max-w-[240px] mx-auto">
            I tuoi dati sono protetti da crittografia end-to-end.
          </p>
        </footer>
      </div>
    </main>
  )
}
