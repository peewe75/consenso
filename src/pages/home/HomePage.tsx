import { useEffect, useState } from 'react'
import { ArrowRight, Clock3, Smartphone, Sparkles, TriangleAlert } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { formatSessionDate, getSessionStatusMeta, initialsFromName, isIosSafariInstallPromptVisible } from '@/lib/utils'
import type { ConsentSession, ConsentStatusView } from '@/types/session'

interface SessionCardData extends ConsentSession {
  myStatus: ConsentStatusView['current_status'] | null
}

// ─── Semantic Palette Mapping Applied ───────────────────────────────────────
// Uses global styles defined in globals.css
// ─────────────────────────────────────────────────────────────────────────────

export function HomePage() {
  const navigate = useNavigate()
  const { profile } = useAuth()
  const [sessions, setSessions] = useState<SessionCardData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)

      const { data: sessionRows } = await supabase
        .from('consent_sessions')
        .select('*')
        .in('status', ['pending', 'active'])
        .order('created_at', { ascending: false })
        .limit(3)

      const sessionIds = (sessionRows ?? []).map((row) => row.id)

      const { data: statuses } =
        sessionIds.length > 0
          ? await supabase.from('v_current_consent_status').select('*').in('session_id', sessionIds)
          : { data: [] as ConsentStatusView[] | null }

      const statusMap = new Map((statuses ?? []).map((row) => [row.session_id, row.current_status]))

      setSessions(
        (sessionRows ?? []).map((row) => ({
          ...row,
          myStatus: statusMap.get(row.id) ?? null,
        })),
      )
      setLoading(false)
    }

    void load()
  }, [])

  const showIosHint = isIosSafariInstallPromptVisible()
  const initials = initialsFromName(profile?.display_name ?? '?')

  return (
    <main className="safe-page space-y-6">
      {/* ── Hero Card ────────────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden rounded-[30px] p-8 shadow-soft"
        style={{ background: 'linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-hover) 100%)' }}
      >
        {/* Ambient top-right glow */}
        <div className="pointer-events-none absolute -right-32 -top-32 h-64 w-64 rounded-full bg-white/10 blur-[80px]" />

        <div className="relative z-10 flex items-start justify-between">
          <div className="space-y-2">
            <h1 className="text-[3.2rem] font-bold leading-[0.95] tracking-tight text-white">
              Ciao{' '}
              <br />
              {profile?.display_name ?? 'Partecipante'}
            </h1>
            <p className="pt-2 text-sm font-medium uppercase tracking-widest text-white/70">
              Il tuo vault è sicuro
            </p>
          </div>
          <div
            className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-white/20 text-xl font-bold text-white shadow-sm"
            style={{ backgroundColor: profile?.avatar_color ?? 'var(--color-accent)' }}
          >
            {initials}
          </div>
        </div>
      </section>

      {/* ── New Session Button ─────────────────────────────────────────────── */}
      <button
        type="button"
        onClick={() => navigate('/pairing')}
        className="group flex h-[72px] w-full items-center justify-between rounded-full bg-accent hover:bg-accent-hover text-white shadow-soft px-8 transition-colors duration-300 active:scale-[0.98]"
      >
        <span className="text-lg font-bold transition-colors">
          Nuova sessione / Apri un nuovo consenso
        </span>
        <ArrowRight size={20} className="transition-colors group-hover:translate-x-1" />
      </button>

      {/* Warning strip */}
      <div className="flex items-start gap-3 rounded-2xl border border-warning/20 bg-warning/10 px-4 py-4">
        <TriangleAlert size={18} className="mt-0.5 shrink-0 text-warning" />
        <p className="text-sm leading-6 text-text-secondary">
          Il consenso resta libero e revocabile in ogni momento. L&apos;app non sostituisce il dialogo tra le
          persone coinvolte.
        </p>
      </div>

      {/* iOS install hint */}
      {showIosHint ? (
        <div className="panel flex items-start gap-3 rounded-[24px] px-5 py-4">
          <Smartphone size={18} className="mt-0.5 text-accent" />
          <div>
            <p className="text-sm font-semibold text-text-primary">Installazione su iPhone</p>
            <p className="mt-1 text-sm leading-6 text-text-secondary">
              In Safari usa condividi e poi{' '}
              <span className="font-medium text-text-primary">Aggiungi a schermata Home</span>.
            </p>
          </div>
        </div>
      ) : null}

      {/* ── Sessions in corso ────────────────────────────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 px-1">
          <Sparkles size={18} className="text-success" />
          <h2 className="text-xl font-bold tracking-tight text-text-primary">Sessioni in corso</h2>
        </div>

        {loading ? (
          <div className="panel rounded-2xl px-4 py-10 text-center text-sm text-text-muted">
            Caricamento sessioni...
          </div>
        ) : sessions.length === 0 ? (
          <div className="panel flex flex-col items-center justify-center rounded-2xl px-4 py-10 text-center">
            <Clock3 size={24} className="text-text-muted" />
            <p className="mt-3 text-sm text-text-muted">
              Non ci sono sessioni attive. Puoi iniziarne una da qui sopra.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map((session) => {
              const status = getSessionStatusMeta(session.status)
              const isLive = session.status === 'active' || session.status === 'pending'

              return (
                <button
                  key={session.id}
                  type="button"
                  onClick={() => navigate(`/session/${session.id}`)}
                  className="panel w-full rounded-xl px-6 py-5 text-left transition active:scale-[0.99]"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-2 text-accent">
                        <Clock3 size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-text-primary">{formatSessionDate(session.initiated_at)}</p>
                        <p className="mt-0.5 text-sm text-text-secondary">
                          Partecipanti: {session.participant_count} ·{' '}
                          {session.myStatus === 'confirmed'
                            ? 'confermata'
                            : session.myStatus === 'revoked'
                              ? 'revocata'
                              : 'in attesa'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {isLive ? (
                        <div className="h-2 w-2 animate-pulse rounded-full bg-success" />
                      ) : null}
                      <span
                        className={`rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${status.tone} ${status.color}`}
                      >
                        {status.label}
                      </span>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </section>
    </main>
  )
}
