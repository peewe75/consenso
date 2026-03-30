import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Clock3, Smartphone, Sparkles, TriangleAlert } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { formatSessionDate, getSessionStatusMeta, initialsFromName, isIosSafariInstallPromptVisible } from '@/lib/utils'
import type { ConsentSession, ConsentStatusView } from '@/types/session'

interface SessionCardData extends ConsentSession {
  myStatus: ConsentStatusView['current_status'] | null
}

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

  return (
    <main className="safe-page space-y-8">
      <motion.section
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(99,102,241,0.2),rgba(17,17,26,0.92)_35%,rgba(15,15,20,0.98))] px-5 pb-6 pt-6 shadow-[0_28px_80px_rgba(0,0,0,0.35)]"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-text-secondary">Ciao</p>
            <h1 className="mt-1 text-[1.75rem] font-bold leading-tight">{profile?.display_name ?? 'Partecipante'}</h1>
            <p className="mt-3 max-w-xs text-sm leading-6 text-text-secondary">
              Avvia una nuova sessione solo quando tutte le persone coinvolte sono presenti e consapevoli del flusso.
            </p>
          </div>
          <div className="flex h-14 w-14 items-center justify-center rounded-[20px] text-xl font-bold text-white" style={{ backgroundColor: profile?.avatar_color ?? '#6366F1' }}>
            {initialsFromName(profile?.display_name ?? '?')}
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate('/pairing')}
          className="mt-8 flex min-h-16 w-full items-center justify-between rounded-[24px] bg-accent px-5 py-4 text-left text-white shadow-[0_0_45px_rgba(99,102,241,0.28)] transition active:scale-[0.98] active:opacity-90"
        >
          <div>
            <p className="text-sm font-medium text-white/72">Nuova sessione</p>
            <p className="mt-1 text-lg font-semibold">Apri un nuovo consenso</p>
          </div>
          <ArrowRight size={22} />
        </button>

        <div className="mt-5 flex items-start gap-3 rounded-2xl border border-warning/18 bg-warning/10 px-4 py-4">
          <TriangleAlert size={18} className="mt-0.5 text-warning" />
          <p className="text-sm leading-6 text-text-secondary">
            Il consenso resta libero e revocabile in ogni momento. L&apos;app non sostituisce il dialogo tra le persone coinvolte.
          </p>
        </div>
      </motion.section>

      {showIosHint ? (
        <section className="panel rounded-2xl px-4 py-4">
          <div className="flex items-start gap-3">
            <Smartphone size={18} className="mt-0.5 text-accent" />
            <div>
              <p className="text-sm font-semibold text-text-primary">Installazione su iPhone</p>
              <p className="mt-1 text-sm leading-6 text-text-secondary">
                In Safari usa condividi e poi <span className="font-medium text-text-primary">Aggiungi a schermata Home</span>. Su iOS il Service Worker funziona in modo completo solo in standalone.
              </p>
            </div>
          </div>
        </section>
      ) : null}

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Sessioni in corso</h2>
            <p className="text-sm text-text-secondary">Le piu recenti ancora aperte o in attesa.</p>
          </div>
          <Sparkles size={18} className="text-accent" />
        </div>

        {loading ? (
          <div className="panel rounded-2xl px-4 py-10 text-center text-sm text-text-secondary">Caricamento sessioni...</div>
        ) : sessions.length === 0 ? (
          <div className="panel rounded-2xl px-4 py-10 text-center">
            <Clock3 size={22} className="mx-auto text-text-muted" />
            <p className="mt-3 text-sm text-text-secondary">Non ci sono sessioni attive. Puoi iniziarne una da qui sopra.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map((session) => {
              const status = getSessionStatusMeta(session.status)

              return (
                <button
                  key={session.id}
                  type="button"
                  onClick={() => navigate(`/session/${session.id}`)}
                  className="panel w-full rounded-2xl px-4 py-4 text-left transition active:scale-[0.99]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-text-primary">{formatSessionDate(session.initiated_at)}</p>
                      <p className="mt-1 text-sm leading-6 text-text-secondary">
                        Partecipanti: {session.participant_count} · La tua scelta: {session.myStatus === 'confirmed' ? 'confermata' : session.myStatus === 'revoked' ? 'revocata' : 'in attesa'}
                      </p>
                    </div>
                    <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${status.tone} ${status.color}`}>{status.label}</span>
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
