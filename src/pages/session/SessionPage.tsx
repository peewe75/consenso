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

// ─── Semantic status badge map ──────────────────────────────────────────────────
const statusBadge: Record<string, { bg: string; text: string; border: string }> = {
  pending:   { bg: 'bg-warning/20',  text: 'text-warning',  border: 'border-warning/30' },
  active:    { bg: 'bg-success/20',  text: 'text-success',  border: 'border-success/20' },
  confirmed: { bg: 'bg-success/20',  text: 'text-success',  border: 'border-success/20' },
  revoked:   { bg: 'bg-danger/20',   text: 'text-danger',   border: 'border-danger/30' },
  expired:   { bg: 'bg-surface-2',   text: 'text-text-muted', border: 'border-border' },
}
// ─────────────────────────────────────────────────────────────────────────────

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
    return getSessionStatusMeta(
      expired && session.status !== 'revoked' && session.status !== 'confirmed'
        ? 'expired'
        : session.status,
    )
  }, [expired, session])

  if (loading || !session || !visualState) {
    return (
      <main className="safe-page-tight flex min-h-screen items-center justify-center">
        <div className="panel rounded-2xl px-5 py-6 text-sm text-text-muted">
          {error ?? 'Caricamento sessione...'}
        </div>
      </main>
    )
  }

  const effectiveStatus = expired && !['revoked', 'confirmed'].includes(session.status) ? 'expired' : session.status
  const badge = statusBadge[effectiveStatus] ?? statusBadge.expired
  const myParticipant = session.participants.find((p) => p.user_id === user?.id)
  const otherParticipants = session.participants.filter((p) => p.user_id !== user?.id)
  const canInteract = !expired && !['confirmed', 'revoked', 'expired'].includes(session.status)
  const timerColor = expired ? 'text-danger' : expiringSoon ? 'text-warning' : 'text-success'

  async function handleRevoke() {
    setShowRevokeSheet(false)
    await revokeConsent()
  }

  return (
    <main
      className="safe-page-tight space-y-6 bg-background"
      style={{
        paddingBottom: canInteract ? 'calc(env(safe-area-inset-bottom) + 220px)' : undefined,
      }}
    >
      {/* Ambient glow */}
      <div className="pointer-events-none fixed right-0 top-0 h-[44vh] w-1/2 rounded-full bg-accent/5 blur-[120px]" />
      <div className="pointer-events-none fixed bottom-0 left-0 h-[26vh] w-full bg-gradient-to-t from-accent/5 to-transparent" />

      {/* Back button */}
      <button
        type="button"
        onClick={() => navigate('/app')}
        className="inline-flex min-h-11 items-center gap-2 rounded-full text-sm font-medium text-text-muted transition active:scale-[0.98]"
      >
        <ChevronLeft size={18} />
        Torna alla home
      </button>

      {/* ── Header card ─────────────────────────────────────────────────── */}
      <section className="panel rounded-[28px] p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <span
                className={`rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${badge.bg} ${badge.text} ${badge.border}`}
              >
                {visualState.label}
              </span>
            </div>
            <h1 className="text-[2.5rem] font-extrabold leading-[0.95] tracking-tight text-text-primary">
              Sessione di consenso
            </h1>
            <p className="mt-2 text-sm text-text-muted">{formatSessionDate(session.initiated_at)}</p>
          </div>
        </div>

        {/* Timer bento */}
        <div className="mt-5 flex items-center justify-between overflow-hidden rounded-2xl border border-border bg-surface px-5 py-4">
          <div className="flex flex-col gap-1">
            <span className="text-[11px] uppercase tracking-[0.05em] text-text-muted">Scadenza sessione</span>
            <div className="flex items-center gap-3">
              <Clock3 size={20} className={timerColor} />
              <span className={`font-mono text-[2rem] font-bold tracking-tighter ${timerColor}`}>
                {countdown}
              </span>
            </div>
          </div>
          {/* Decorative ghost icon */}
          <Clock3 size={64} className="opacity-5 text-text-primary" />
        </div>
      </section>

      {/* ── Participants ─────────────────────────────────────────────────── */}
      <section className="panel rounded-[28px] p-6">
        <div className="mb-4 flex items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-text-muted">
            Partecipanti
          </span>
          <Users size={14} className="text-text-muted" />
        </div>
        <div className="space-y-3">
          {myParticipant ? (
            <ParticipantRow
              name={`${myParticipant.profile.display_name} (tu)`}
              color={myParticipant.profile.avatar_color}
              statusLabel={
                myParticipant.currentStatus === 'confirmed'
                  ? 'Hai confermato'
                  : myParticipant.currentStatus === 'revoked'
                    ? 'Hai revocato'
                    : 'In attesa'
              }
              statusClass={
                myParticipant.currentStatus === 'confirmed'
                  ? 'bg-success/20 text-success border-success/20'
                  : myParticipant.currentStatus === 'revoked'
                    ? 'bg-danger/20 text-danger border-danger/20'
                    : 'bg-accent/10 text-accent border-border/50'
              }
              caption={
                myParticipant.lastActionAt
                  ? `Ultima azione alle ${formatSessionTime(myParticipant.lastActionAt)}`
                  : 'La tua scelta resta privata agli altri.'
              }
            />
          ) : null}
          {otherParticipants.map((p) => (
            <ParticipantRow
              key={p.id}
              name={p.profile.display_name}
              color={p.profile.avatar_color}
              statusLabel="Privato"
              statusClass="bg-surface text-text-muted border-border"
              caption="Mostriamo solo il conteggio aggregato delle conferme."
            />
          ))}
        </div>
      </section>

      {/* ── Aggregate ────────────────────────────────────────────────────── */}
      <section className="panel rounded-[28px] px-5 py-5">
        <div className="mb-3 flex items-center gap-2">
          <ShieldCheck size={18} className="text-accent" />
          <h2 className="text-base font-bold uppercase tracking-wide text-text-primary">Stato aggregato</h2>
        </div>
        <p className="text-sm leading-6 text-text-secondary">
          {session.confirmedCount}/{session.participant_count} hanno confermato.
        </p>
        <p className="mt-2 text-sm leading-6 text-text-muted">
          Gli stati individuali degli altri partecipanti non vengono esposti. Vedrai solo il tuo e il
          conteggio totale.
        </p>
      </section>

      {/* ── Action / Final state ─────────────────────────────────────────── */}
      {canInteract ? (
        <section className="panel hidden flex-col items-center gap-6 rounded-[28px] px-5 py-8 shadow-soft md:flex">
          <div className="space-y-2 text-center">
            <h2 className="text-xl font-bold text-text-primary">
              {session.myStatus === 'confirmed' ? 'Il tuo consenso è registrato' : 'Conferma il tuo consenso'}
            </h2>
            <p className="px-4 text-sm text-text-muted">
              La conferma è sempre revocabile. Ogni azione richiede pressione prolungata di 600 ms.
            </p>
          </div>

          {session.myStatus !== 'confirmed' ? (
            <ConsentButton mode="confirm" onAction={confirmConsent} />
          ) : (
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-success/20">
                <ShieldCheck size={34} className="text-success" />
              </div>
              <p className="text-sm leading-6 text-text-secondary">
                Se vuoi puoi ancora revocare la tua scelta prima della chiusura o della scadenza.
              </p>
              <button
                type="button"
                onClick={() => setShowRevokeSheet(true)}
                className="flex min-h-12 items-center justify-center rounded-full border border-danger/30 bg-danger/10 px-6 text-sm font-semibold text-danger transition active:scale-[0.98]"
              >
                Apri revoca
              </button>
            </div>
          )}
        </section>
      ) : (
        <section className="panel rounded-[28px] px-5 py-6 text-center">
          <p className="text-lg font-semibold text-text-primary">
            {session.status === 'confirmed'
              ? 'Sessione confermata'
              : session.status === 'revoked'
                ? 'Sessione revocata'
                : 'Sessione scaduta'}
          </p>
          <p className="mt-2 text-sm leading-6 text-text-secondary">
            {session.status === 'confirmed'
              ? 'Tutti hanno confermato entro la finestra prevista.'
              : session.status === 'revoked'
                ? 'Una revoca è stata registrata e notificata in realtime agli altri partecipanti.'
                : 'La finestra di cinque ore si è conclusa senza ulteriori azioni.'}
          </p>
        </section>
      )}

      {/* ── Revoke bottom sheet ──────────────────────────────────────────── */}
      {canInteract ? (
        <section className="fixed inset-x-0 bottom-0 z-40 px-[calc(env(safe-area-inset-left)+16px)] pb-[calc(env(safe-area-inset-bottom)+16px)] pr-[calc(env(safe-area-inset-right)+16px)] md:hidden">
          <div className="panel rounded-[28px] px-4 py-4 shadow-[0_-20px_60px_-20px_rgba(0,0,0,0.6)]">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-text-muted">
                  Azione rapida
                </p>
                <h2 className="mt-1 text-base font-bold text-text-primary">
                  {session.myStatus === 'confirmed'
                    ? 'Consenso registrato'
                    : 'Tieni premuto per confermare'}
                </h2>
                <p className="mt-1 text-xs leading-5 text-text-muted">
                  {session.myStatus === 'confirmed'
                    ? 'Puoi ancora aprire la revoca finche la sessione resta attiva.'
                    : 'La CTA resta visibile qui in basso per un uso rapido su smartphone.'}
                </p>
              </div>

              {session.myStatus !== 'confirmed' ? (
                <ConsentButton
                  mode="confirm"
                  onAction={confirmConsent}
                  size="compact"
                  label="Premi 600 ms"
                />
              ) : (
                <button
                  type="button"
                  onClick={() => setShowRevokeSheet(true)}
                  className="flex min-h-12 shrink-0 items-center justify-center rounded-full border border-danger/30 bg-danger/10 px-5 text-sm font-semibold text-danger transition active:scale-[0.98]"
                >
                  Apri revoca
                </button>
              )}
            </div>
          </div>
        </section>
      ) : null}

      <AnimatePresence>
        {showRevokeSheet ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/65 backdrop-blur-sm"
          >
            <button
              type="button"
              aria-label="Chiudi dialog revoca"
              className="absolute inset-0"
              onClick={() => setShowRevokeSheet(false)}
            />
            <motion.section
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 30, opacity: 0 }}
              className="absolute inset-x-0 bottom-0 rounded-t-[32px] border-t border-border bg-surface px-5 pb-[calc(env(safe-area-inset-bottom)+24px)] pt-6"
            >
              <div className="mx-auto mb-5 h-1.5 w-12 rounded-full bg-border" />
              <h3 className="text-xl font-bold text-text-primary">Revoca il consenso</h3>
              <p className="mt-2 max-w-sm text-sm leading-6 text-text-secondary">
                Stai per revocare il tuo consenso. Questa azione è immediata e tutti i partecipanti ne saranno
                informati.
              </p>
              <div className="mt-6 flex flex-col items-center gap-4">
                <ConsentButton mode="revoke" onAction={handleRevoke} />
                <button
                  type="button"
                  onClick={() => setShowRevokeSheet(false)}
                  className="flex min-h-12 w-full items-center justify-center rounded-full border border-border bg-transparent text-sm font-medium text-text-primary transition active:scale-[0.98]"
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

// ─── ParticipantRow ───────────────────────────────────────────────────────────

function ParticipantRow({
  name,
  color,
  statusLabel,
  statusClass,
  caption,
}: {
  name: string
  color: string
  statusLabel: string
  statusClass: string
  caption: string
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface px-3 py-3">
      <div
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-base font-bold text-white shadow-soft"
        style={{ backgroundColor: color }}
      >
        {initialsFromName(name)}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-text-primary">{name}</p>
        <p className="mt-0.5 text-xs leading-5 text-text-muted">{caption}</p>
      </div>
      <span
        className={`rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-wide ${statusClass}`}
      >
        {statusLabel}
      </span>
    </div>
  )
}
