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

// ─── Stitch palette shortcuts ─────────────────────────────────────────────────
// Background: #131318  Surface-low: #1B1B20  Surface: #1F1F24
// Primary: #C0C1FF     Tertiary: #4EDEA3     Outline-v: #464554
// On-surface: #E4E1E9  On-surface-v: #C7C4D7 Outline: #908FA0
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
        className="relative overflow-hidden rounded-[30px] p-8 shadow-2xl"
        style={{ background: 'linear-gradient(135deg, #494bd6 0%, #131318 100%)' }}
      >
        {/* Ambient top-right glow */}
        <div className="pointer-events-none absolute -right-32 -top-32 h-64 w-64 rounded-full bg-[#C0C1FF]/10 blur-[80px]" />

        <div className="relative z-10 flex items-start justify-between">
          <div className="space-y-2">
            <h1 className="text-[3.2rem] font-bold leading-[0.95] tracking-tight text-white">
              Ciao{' '}
              <br />
              {profile?.display_name ?? 'Partecipante'}
            </h1>
            <p className="pt-2 text-sm font-medium uppercase tracking-widest text-[#E1E0FF]/70">
              Il tuo vault è sicuro
            </p>
          </div>
          <div
            className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-white/10 text-xl font-bold text-[#1000A9] shadow-lg"
            style={{ backgroundColor: profile?.avatar_color ?? '#C0C1FF' }}
          >
            {initials}
          </div>
        </div>
      </section>

      {/* ── New Session Button (gradient border pill) ──────────────────── */}
      <div
        className="rounded-full p-[1.5px]"
        style={{ background: 'linear-gradient(90deg, #C0C1FF 0%, #8083FF 100%)' }}
      >
        <button
          type="button"
          onClick={() => navigate('/pairing')}
          className="group flex h-[72px] w-full items-center justify-between rounded-full bg-[#131318] px-8 transition-colors duration-300 hover:bg-transparent active:scale-[0.98]"
        >
          <span className="text-lg font-bold text-[#C0C1FF] transition-colors group-hover:text-[#1000A9]">
            Nuova sessione / Apri un nuovo consenso
          </span>
          <ArrowRight size={20} className="text-[#C0C1FF] transition-colors group-hover:text-[#1000A9]" />
        </button>
      </div>

      {/* Warning strip */}
      <div className="flex items-start gap-3 rounded-2xl border border-[#93000A]/20 bg-[#93000A]/10 px-4 py-4">
        <TriangleAlert size={18} className="mt-0.5 shrink-0 text-[#FFB4AB]" />
        <p className="text-sm leading-6 text-[#C7C4D7]">
          Il consenso resta libero e revocabile in ogni momento. L&apos;app non sostituisce il dialogo tra le
          persone coinvolte.
        </p>
      </div>

      {/* iOS install hint */}
      {showIosHint ? (
        <div
          className="flex items-start gap-3 rounded-[24px] border border-[#464554]/20 px-5 py-4"
          style={{
            background: 'linear-gradient(180deg, rgba(34,34,58,0.4) 0%, rgba(26,26,36,0.4) 100%)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <Smartphone size={18} className="mt-0.5 text-[#C0C1FF]" />
          <div>
            <p className="text-sm font-semibold text-[#E4E1E9]">Installazione su iPhone</p>
            <p className="mt-1 text-sm leading-6 text-[#C7C4D7]">
              In Safari usa condividi e poi{' '}
              <span className="font-medium text-[#E4E1E9]">Aggiungi a schermata Home</span>.
            </p>
          </div>
        </div>
      ) : null}

      {/* ── Sessions in corso ────────────────────────────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 px-1">
          <Sparkles size={18} className="text-[#4EDEA3]" />
          <h2 className="text-xl font-bold tracking-tight text-[#E4E1E9]">Sessioni in corso</h2>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-[#464554]/20 bg-[#1B1B20] px-4 py-10 text-center text-sm text-[#908FA0]">
            Caricamento sessioni...
          </div>
        ) : sessions.length === 0 ? (
          <div className="rounded-2xl border border-[#464554]/20 bg-[#1B1B20] px-4 py-10 text-center">
            <Clock3 size={22} className="mx-auto text-[#464554]" />
            <p className="mt-3 text-sm text-[#908FA0]">
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
                  className="w-full rounded-xl border border-[#464554]/20 px-6 py-5 text-left transition hover:border-[#C0C1FF]/40 active:scale-[0.99]"
                  style={{
                    background: 'linear-gradient(180deg, rgba(34,34,58,0.9) 0%, rgba(26,26,36,0.9) 100%)',
                    backdropFilter: 'blur(12px)',
                  }}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#2A292F] text-[#C0C1FF]">
                        <Clock3 size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-[#E4E1E9]">{formatSessionDate(session.initiated_at)}</p>
                        <p className="mt-0.5 text-sm text-[#908FA0]">
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
                        <div className="h-2 w-2 animate-pulse rounded-full bg-[#4EDEA3]" />
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
