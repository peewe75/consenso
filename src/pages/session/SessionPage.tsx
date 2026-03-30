import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, Clock3, ShieldCheck, Users } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { ConsentButton } from '@/components/session/ConsentButton'
import { useRealtime } from '@/hooks/useRealtime'
import { useSession } from '@/hooks/useSession'
import { useTimer } from '@/hooks/useTimer'
import { formatSessionDate, formatSessionTime, getSessionStatusMeta, initialsFromName } from '@/lib/utils'
import { useAuthStore } from '@/stores/authStore'

export function SessionPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { user } = useAuthStore()
  const { session, loading, error, confirmConsent, revokeConsent, reload } = useSession(id ?? null)
  const { countdown, expiringSoon, expired } = useTimer(session?.expires_at ?? null)
  const [showRevokeSheet, setShowRevokeSheet] = useState(false)

  useRealtime(id ?? null, reload)

  const visualState = useMemo(() => {
    if (!session) return null
    return getSessionStatusMeta(expired && session.status !== 'revoked' && session.status !== 'confirmed' ? 'expired' : session.status)
  }, [expired, session])

  if (loading || !session || !visualState) {
    return (
      <main className="safe-page-tight flex min-h-screen items-center justify-center">
        <div className="panel rounded-2xl px-5 py-6 text-sm text-text-secondary">{error ?? 'Caricamento sessione...'}</div>
      </main>
    )
  }

  const myParticipant = session.participants.find((participant) => participant.user_id === user?.id)
  const otherParticipants = session.participants.filter((participant) => participant.user_id !== user?.id)
  const canInteract = !expired && !['confirmed', 'revoked', 'expired'].includes(session.status)
  const timerColor = expired ? 'text-danger' : expiringSoon ? 'text-warning' : 'text-success'

  async function handleRevoke() {
    setShowRevokeSheet(false)
    await revokeConsent()
  }

  return (
    <main className="safe-page-tight space-y-6">
      <button type="button" onClick={() => navigate('/app')} className="inline-flex min-h-11 items-center gap-2 rounded-full text-sm font-medium text-text-secondary transition active:scale-[0.98]">
        <ChevronLeft size={18} />
        Torna alla home
      </button>

      <section className="panel rounded-[30px] px-5 py-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-[1.65rem] font-bold">Sessione di consenso</h1>
            <p className="mt-2 text-sm leading-6 text-text-secondary">{formatSessionDate(session.initiated_at)}</p>
          </div>
          <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${visualState.tone} ${visualState.color}`}>{visualState.label}</span>
        </div>

        <div className="mt-5 rounded-2xl border border-white/10 bg-white/4 px-4 py-4">
          <div className="flex items-center gap-3">
            <Clock3 size={18} className={timerColor} />
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-text-muted">Countdown</p>
              <p className={`mt-1 font-mono text-2xl font-bold ${timerColor}`}>{countdown}</p>
            </div>
          </div>
          <p className="mt-3 text-sm leading-6 text-text-secondary">
            {expired
              ? 'Le cinque ore sono terminate.'
              : expiringSoon
                ? 'Mancano meno di 30 minuti alla scadenza della sessione.'
                : 'La sessione resta attiva per cinque ore dalla sua creazione.'}
          </p>
        </div>
      </section>

      <section className="panel rounded-[28px] px-5 py-5">
        <div className="flex items-center gap-2">
          <Users size={18} className="text-text-secondary" />
          <h2 className="text-lg font-semibold">Partecipanti</h2>
        </div>

        <div className="mt-5 space-y-3">
          {myParticipant ? (
            <ParticipantRow
              name={`${myParticipant.profile.display_name} (tu)`}
              color={myParticipant.profile.avatar_color}
              statusLabel={myParticipant.currentStatus === 'confirmed' ? 'Hai confermato' : myParticipant.currentStatus === 'revoked' ? 'Hai revocato' : 'In attesa della tua scelta'}
              statusTone={myParticipant.currentStatus === 'confirmed' ? 'bg-success/12 text-success border-success/20' : myParticipant.currentStatus === 'revoked' ? 'bg-danger/12 text-danger border-danger/20' : 'bg-surface-2 text-text-secondary border-border'}
              caption={myParticipant.lastActionAt ? `Ultima azione alle ${formatSessionTime(myParticipant.lastActionAt)}` : 'La tua scelta resta privata agli altri.'}
            />
          ) : null}

          {otherParticipants.map((participant) => (
            <ParticipantRow
              key={participant.id}
              name={participant.profile.display_name}
              color={participant.profile.avatar_color}
              statusLabel="Privato"
              statusTone="bg-white/5 text-text-muted border-white/10"
              caption="Mostriamo solo il conteggio aggregato delle conferme."
            />
          ))}
        </div>
      </section>

      <section className="panel rounded-[28px] px-5 py-5">
        <div className="flex items-center gap-2">
          <ShieldCheck size={18} className="text-accent" />
          <h2 className="text-lg font-semibold">Stato aggregato</h2>
        </div>
        <p className="mt-3 text-sm leading-6 text-text-secondary">
          {session.confirmedCount}/{session.participant_count} hanno confermato.
        </p>
        <p className="mt-2 text-sm leading-6 text-text-secondary">
          Gli stati individuali degli altri partecipanti non vengono esposti. Vedrai solo il tuo e il conteggio totale.
        </p>
      </section>

      {canInteract ? (
        <section className="space-y-5 rounded-[30px] border border-white/8 bg-[linear-gradient(180deg,rgba(99,102,241,0.16),rgba(15,15,20,0.92))] px-5 py-6 shadow-[0_20px_70px_rgba(0,0,0,0.36)]">
          <div className="space-y-2 text-center">
            <h2 className="text-xl font-semibold">
              {session.myStatus === 'confirmed' ? 'Il tuo consenso e registrato' : 'Conferma il tuo consenso'}
            </h2>
            <p className="text-sm leading-6 text-text-secondary">
              La conferma e sempre revocabile finche la sessione resta attiva. Per sicurezza ogni azione richiede pressione prolungata di 600 ms.
            </p>
          </div>

          {session.myStatus !== 'confirmed' ? (
            <ConsentButton mode="confirm" onAction={confirmConsent} />
          ) : (
            <div className="space-y-4 text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-success/12">
                <ShieldCheck size={34} className="text-success" />
              </div>
              <p className="text-sm leading-6 text-text-secondary">Se vuoi puoi ancora revocare la tua scelta prima della chiusura o della scadenza.</p>
              <button
                type="button"
                onClick={() => setShowRevokeSheet(true)}
                className="mx-auto flex min-h-12 items-center justify-center rounded-full border border-danger/30 bg-danger/10 px-5 text-sm font-semibold text-danger transition active:scale-[0.98]"
              >
                Apri revoca
              </button>
            </div>
          )}
        </section>
      ) : (
        <section className="panel rounded-[28px] px-5 py-5 text-center">
          <p className="text-lg font-semibold text-text-primary">
            {session.status === 'confirmed' ? 'Sessione confermata' : session.status === 'revoked' ? 'Sessione revocata' : 'Sessione scaduta'}
          </p>
          <p className="mt-2 text-sm leading-6 text-text-secondary">
            {session.status === 'confirmed'
              ? `Tutti hanno confermato entro la finestra prevista.`
              : session.status === 'revoked'
                ? 'Una revoca e stata registrata e notificata in realtime agli altri partecipanti.'
                : 'La finestra di cinque ore si e conclusa senza ulteriori azioni.'}
          </p>
        </section>
      )}

      <AnimatePresence>
        {showRevokeSheet ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/65 backdrop-blur-sm"
          >
            <button type="button" aria-label="Chiudi dialog revoca" className="absolute inset-0" onClick={() => setShowRevokeSheet(false)} />

            <motion.section
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 30, opacity: 0 }}
              className="absolute inset-x-0 bottom-0 rounded-t-[32px] border border-white/10 bg-background px-5 pb-[calc(env(safe-area-inset-bottom)+24px)] pt-6"
            >
              <div className="mx-auto mb-5 h-1.5 w-12 rounded-full bg-white/10" />
              <h3 className="text-xl font-semibold">Revoca il consenso</h3>
              <p className="mt-2 max-w-sm text-sm leading-6 text-text-secondary">
                La revoca e immediata e chiude la sessione. Usa la pressione prolungata anche qui per evitare tocchi accidentali.
              </p>

              <div className="mt-6 flex flex-col items-center gap-4">
                <ConsentButton mode="revoke" onAction={handleRevoke} />
                <button
                  type="button"
                  onClick={() => setShowRevokeSheet(false)}
                  className="flex min-h-12 w-full items-center justify-center rounded-full border border-white/10 bg-white/4 text-sm font-medium text-text-secondary transition active:scale-[0.98]"
                >
                  Annulla
                </button>
              </div>
            </motion.section>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </main>
  )
}

function ParticipantRow({
  name,
  color,
  statusLabel,
  statusTone,
  caption,
}: {
  name: string
  color: string
  statusLabel: string
  statusTone: string
  caption: string
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.035] px-3 py-3">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-lg font-bold text-white" style={{ backgroundColor: color }}>
        {initialsFromName(name)}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-text-primary">{name}</p>
        <p className="mt-1 text-xs leading-5 text-text-secondary">{caption}</p>
      </div>
      <span className={`rounded-full border px-3 py-1 text-xs font-medium ${statusTone}`}>{statusLabel}</span>
    </div>
  )
}
